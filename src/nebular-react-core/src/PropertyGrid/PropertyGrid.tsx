import React, { forwardRef, useId, useState } from 'react';
import { useUncontrolled } from '@nebular-react/hooks';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { FormControl } from '../FormControl';
import { Input } from '../Input';
import { NativeSelect } from '../NativeSelect';
import type { SchemaFormField, SchemaFormValue, SchemaFormValues } from '../SchemaForm';

export type PropertyGridField = Exclude<SchemaFormField, { type: 'custom' }> & {
  category?: string;
  defaultValue?: SchemaFormValue;
  readOnly?: boolean;
};

export interface PropertyGridLabels {
  title: string;
  search: string;
  general: string;
  empty: string;
  reset(property: string): string;
}

const defaults: PropertyGridLabels = {
  title: 'Properties',
  search: 'Search properties',
  general: 'General',
  empty: 'No matching properties.',
  reset: (property) => `Reset ${property}`
};

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '0.75rem', minWidth: 0 },
  category: {
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.25rem)',
    color: 'var(--text-basic-color, #222b45)'
  },
  heading: {
    cursor: 'pointer',
    fontWeight: 600,
    backgroundColor: 'var(--background-basic-color-2, #f7f9fc)',
    padding: '0.5rem 0.75rem'
  },
  rows: { display: 'grid', padding: '0.75rem', gap: '0.75rem' },
  row: { display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: '0.5rem' },
  field: { flex: '1 1 10rem', minWidth: 0 },
  reset: { alignSelf: 'end' }
}));

export type PropertyGridStylesNames = Selectors<typeof useStyles>;

export interface PropertyGridProps extends DefaultProps<PropertyGridStylesNames> {
  fields: readonly PropertyGridField[];
  value?: SchemaFormValues;
  defaultValue?: SchemaFormValues;
  onChange?(value: SchemaFormValues): void;
  errors?: Readonly<Record<string, string | undefined>>;
  labels?: Partial<PropertyGridLabels>;
  disabled?: boolean;
  searchable?: boolean;
}

const emptyValues: SchemaFormValues = {};
const ownValue = (values: SchemaFormValues, key: string) =>
  Object.hasOwn(values, key) ? values[key] : undefined;

export const PropertyGrid = forwardRef<HTMLDivElement, PropertyGridProps>((props, ref) => {
  const {
    fields,
    value,
    defaultValue,
    onChange,
    errors,
    labels,
    searchable = true,
    disabled,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = props;
  const text = { ...defaults, ...labels };
  const { classes, cx } = useStyles(null, { name: 'property-grid', classNames, styles, unstyled });
  const [values, setValues] = useUncontrolled({
    value,
    defaultValue,
    finalValue: emptyValues,
    onChange
  });
  const [search, setSearch] = useState('');
  const id = useId();
  const query = searchable ? search.trim().toLocaleLowerCase() : '';
  const categories = new Map<string, PropertyGridField[]>();

  fields.forEach((field) => {
    if (field.visibleWhen?.(values) === false) return;
    const category = field.category ?? text.general;
    if (
      query &&
      ![field.label, field.name, category].some((item) => item.toLocaleLowerCase().includes(query))
    )
      return;
    const group = categories.get(category);
    if (group) group.push(field);
    else categories.set(category, [field]);
  });

  const renderField = (field: PropertyGridField) => {
    const current = ownValue(values, field.name);
    const fieldId = `${id}-${fields.indexOf(field)}`;
    const error =
      (errors && Object.hasOwn(errors, field.name) ? errors[field.name] : undefined) ??
      field.validate?.(current, values);
    const errorId = `${fieldId}-error`;
    const inactive = !!(disabled || field.disabled || field.readOnly);
    const change = (next: SchemaFormValue | undefined) => {
      if (!inactive) setValues({ ...values, [field.name]: next });
    };
    const shared = {
      id: fieldId,
      disabled: inactive,
      'aria-invalid': !!error || undefined,
      'aria-describedby': error ? errorId : undefined
    };
    let input: React.ReactNode;
    if (field.type === 'select') {
      input = (
        <NativeSelect
          {...shared}
          data={[...field.options]}
          value={typeof current === 'string' ? current : ''}
          placeholder=""
          onChange={(next) => change(next || undefined)}
        />
      );
    } else if (field.type === 'boolean') {
      input = <Checkbox {...shared} checked={current === true} onCheck={change} />;
    } else {
      input = (
        <Input
          {...shared}
          fullWidth
          type={field.type}
          value={typeof current === 'boolean' ? '' : (current ?? '')}
          onChange={(event) => {
            const inputValue = event.target.value;
            if (field.type === 'number') {
              const number = event.target.valueAsNumber;
              change(Number.isFinite(number) ? number : undefined);
            } else {
              change(inputValue);
            }
          }}
        />
      );
    }
    return (
      <div key={field.name} className={classes.row}>
        <FormControl
          className={classes.field}
          htmlFor={fieldId}
          label={field.label}
          description={field.description}
          withAsterisk={field.required}
          error={error && <span id={errorId}>{error}</span>}
        >
          {input}
        </FormControl>
        {Object.hasOwn(field, 'defaultValue') && (
          <Button
            type="button"
            size="small"
            appearance="outline"
            className={classes.reset}
            disabled={inactive || current === field.defaultValue}
            onClick={() => change(field.defaultValue)}
          >
            {text.reset(field.label)}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      style={style}
      className={cx(classes.root, className)}
      role="region"
      aria-label={text.title}
    >
      {searchable && (
        <Input
          type="search"
          fullWidth
          value={search}
          aria-label={text.search}
          placeholder={text.search}
          onChange={(event) => setSearch(event.target.value)}
        />
      )}
      {categories.size === 0 && <div role="status">{text.empty}</div>}
      {Array.from(categories, ([category, items]) => (
        <details key={category} open className={classes.category}>
          <summary className={classes.heading}>{category}</summary>
          <div className={classes.rows}>{items.map(renderField)}</div>
        </details>
      ))}
    </div>
  );
});

PropertyGrid.displayName = 'PropertyGrid';
