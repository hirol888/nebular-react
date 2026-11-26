import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { useUncontrolled } from '@nebular-react/hooks';
import { createStyles, DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { FormControl } from '../FormControl';
import { FormErrorSummary } from '../FormErrorSummary';
import { Input } from '../Input';
import { NativeSelect, NativeSelectItem } from '../NativeSelect';

export type SchemaFormValue = string | number | boolean;
export type SchemaFormValues = Readonly<Record<string, SchemaFormValue | undefined>>;

export interface SchemaFormRendererContext {
  value: SchemaFormValue | undefined;
  values: SchemaFormValues;
  onChange(value: SchemaFormValue | undefined): void;
  /** Spread onto the focusable element to keep the field labelled and described. */
  inputProps: Pick<
    React.ComponentPropsWithoutRef<'input'>,
    'id' | 'name' | 'disabled' | 'required' | 'aria-describedby' | 'aria-invalid'
  >;
}

interface SchemaFormFieldBase {
  name: string;
  label: string;
  description?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  visibleWhen?(values: SchemaFormValues): boolean;
  validate?(value: SchemaFormValue | undefined, values: SchemaFormValues): string | undefined;
}

export type SchemaFormField = SchemaFormFieldBase &
  (
    | { type: 'text' | 'number' | 'date' | 'boolean' }
    | { type: 'select'; options: readonly NativeSelectItem[] }
    | { type: 'custom'; render(context: SchemaFormRendererContext): React.ReactNode }
  );

export interface SchemaFormLabels {
  submit: string;
  select: string;
  errorSummary: string;
  required(field: SchemaFormField): string;
}

const defaultLabels: SchemaFormLabels = {
  submit: 'Submit',
  select: 'Select an option',
  errorSummary: 'Review the following fields',
  required: (field) => `${field.label} is required`
};

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    gap: 'var(--schema-form-gap, 1rem)'
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignSelf: 'flex-start'
  }
}));

export type SchemaFormStylesNames = Selectors<typeof useStyles>;

export interface SchemaFormProps
  extends
    DefaultProps<SchemaFormStylesNames>,
    Omit<
      React.ComponentPropsWithoutRef<'form'>,
      'children' | 'defaultValue' | 'onChange' | 'onSubmit'
    > {
  fields: readonly SchemaFormField[];
  value?: SchemaFormValues;
  defaultValue?: SchemaFormValues;
  /** Conditional fields retain their values in both callbacks. */
  onChange?(values: SchemaFormValues): void;
  /** Runs after the visible, enabled fields pass their local validation. */
  onSubmit?(values: SchemaFormValues): void;
  /** Additional errors from the application, indexed by field name. */
  errors?: Readonly<Record<string, string | undefined>>;
  labels?: Partial<SchemaFormLabels>;
  disabled?: boolean;
}

const emptyValues: SchemaFormValues = {};

function ownValue<T>(values: Readonly<Record<string, T>>, name: string): T | undefined {
  return Object.hasOwn(values, name) ? values[name] : undefined;
}

function fieldError(field: SchemaFormField, values: SchemaFormValues, labels: SchemaFormLabels) {
  const value = ownValue(values, field.name);
  const isEmpty =
    value === undefined || value === '' || (field.type === 'boolean' && value === false);
  return field.required && isEmpty ? labels.required(field) : field.validate?.(value, values);
}

function getFieldControl(
  field: SchemaFormField,
  context: SchemaFormRendererContext,
  selectLabel: string,
  error: string | undefined
) {
  const { inputProps, value, onChange } = context;
  const status = error ? 'danger' : undefined;

  switch (field.type) {
    case 'custom':
      return field.render(context);
    case 'boolean':
      return (
        <Checkbox {...inputProps} checked={value === true} onCheck={onChange} status={status} />
      );
    case 'select':
      return (
        <NativeSelect
          {...inputProps}
          data={
            field.options.some((option) => option.value === '')
              ? [...field.options]
              : [{ value: '', label: selectLabel }, ...field.options]
          }
          value={typeof value === 'string' ? value : ''}
          error={error}
          onChange={(nextValue) => onChange(nextValue)}
        />
      );
    default:
      return (
        <Input
          {...inputProps}
          fullWidth
          type={field.type}
          step={field.type === 'number' ? 'any' : undefined}
          status={status}
          value={typeof value === 'string' || typeof value === 'number' ? value : ''}
          onChange={({ currentTarget }) =>
            onChange(
              field.type === 'number'
                ? Number.isFinite(currentTarget.valueAsNumber)
                  ? currentTarget.valueAsNumber
                  : undefined
                : currentTarget.value
            )
          }
        />
      );
  }
}

const SchemaForm = forwardRef<HTMLFormElement, SchemaFormProps>((props, ref) => {
  const {
    fields,
    value,
    defaultValue,
    onChange,
    onSubmit,
    errors,
    labels,
    disabled,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = props;
  const { classes, cx } = useStyles(undefined, {
    name: 'schema-form',
    classNames,
    styles,
    unstyled
  });
  const text = { ...defaultLabels, ...labels };
  const [values, setValues] = useUncontrolled({
    value,
    defaultValue,
    finalValue: emptyValues,
    onChange
  });
  const [failedSubmissions, setFailedSubmissions] = useState(0);
  const formId = useId();
  const summaryRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (failedSubmissions > 0) summaryRef.current?.focus();
  }, [failedSubmissions]);

  const visibleFields = fields.filter((field) => field.visibleWhen?.(values) !== false);
  const describeField = (field: SchemaFormField) => {
    const fieldId = `${formId}-${encodeURIComponent(field.name)}`;
    const error =
      (!field.disabled && errors && ownValue(errors, field.name)) ||
      (failedSubmissions > 0 && !field.disabled ? fieldError(field, values, text) : undefined);

    return { field, fieldId, error };
  };
  const entries = visibleFields.map(describeField);
  const summaryErrors = entries.flatMap(({ fieldId, error }) =>
    error ? [{ fieldId, message: error }] : []
  );

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    if (visibleFields.some((field) => !field.disabled && fieldError(field, values, text))) {
      setFailedSubmissions((attempts) => attempts + 1);
      return;
    }
    onSubmit?.(values);
  };

  return (
    <form
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      noValidate
      onSubmit={submit}
    >
      <FormErrorSummary
        ref={summaryRef}
        errors={summaryErrors}
        title={text.errorSummary}
        focusOnMount={false}
      />
      {entries.map(({ field, fieldId, error }) => {
        const descriptionId = field.description ? `${fieldId}-description` : undefined;
        const errorId = error && field.type !== 'select' ? `${fieldId}-error` : undefined;
        const controlDisabled = disabled || field.disabled;
        const inputProps: SchemaFormRendererContext['inputProps'] = {
          id: fieldId,
          name: field.name,
          disabled: controlDisabled,
          required: field.required,
          'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': Boolean(error) || undefined
        };

        return (
          <FormControl
            key={field.name}
            htmlFor={fieldId}
            label={field.label}
            required={field.required}
            description={descriptionId && <span id={descriptionId}>{field.description}</span>}
            error={errorId && <span id={errorId}>{error}</span>}
          >
            {getFieldControl(
              field,
              {
                inputProps,
                values,
                value: ownValue(values, field.name),
                onChange: (nextValue) => {
                  if (!controlDisabled) setValues({ ...values, [field.name]: nextValue });
                }
              },
              text.select,
              error
            )}
          </FormControl>
        );
      })}
      <div className={classes.actions}>
        <Button type="submit" status="primary" disabled={disabled}>
          {text.submit}
        </Button>
      </div>
    </form>
  );
});

SchemaForm.displayName = 'SchemaForm';

export { SchemaForm };
