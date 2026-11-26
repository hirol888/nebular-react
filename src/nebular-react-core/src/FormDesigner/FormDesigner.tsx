import React, { forwardRef, useId, useRef, useState } from 'react';
import { useUncontrolled } from '@nebular-react/hooks';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { FormControl } from '../FormControl';
import { PropertyGrid } from '../PropertyGrid';
import type { PropertyGridField } from '../PropertyGrid';
import { RepeatableFieldset } from '../RepeatableFieldset';
import type { RepeatableFieldsetLabels } from '../RepeatableFieldset';
import { SchemaForm } from '../SchemaForm';
import type { SchemaFormField, SchemaFormLabels, SchemaFormValues } from '../SchemaForm';
import { Textarea } from '../Textarea';

export type FormDesignerFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export interface FormDesignerField {
  id: string;
  name: string;
  label: string;
  type: FormDesignerFieldType;
  description?: string;
  required?: boolean;
  options?: readonly string[];
}

export interface FormDesignerLabels {
  title: string;
  fields: string;
  newField(index: number): string;
  editField(title: string): string;
  properties: string;
  name: string;
  label: string;
  type: string;
  description: string;
  required: string;
  options: string;
  preview: string;
  empty: string;
  invalidFields: string;
  fieldTypes: Record<FormDesignerFieldType, string>;
}

const defaults: FormDesignerLabels = {
  title: 'Form designer',
  fields: 'Fields',
  newField: (index) => `Field ${index}`,
  editField: (title) => `Edit ${title}`,
  properties: 'Field properties',
  name: 'Field name',
  label: 'Label',
  type: 'Type',
  description: 'Description',
  required: 'Required',
  options: 'Options',
  preview: 'Form preview',
  empty: 'Add a field to preview the form.',
  invalidFields: 'Enter unique names and a label for every field to preview the form.',
  fieldTypes: {
    text: 'Text',
    number: 'Number',
    date: 'Date',
    boolean: 'Checkbox',
    select: 'Select'
  }
};

export function toSchemaFormFields(fields: readonly FormDesignerField[]): SchemaFormField[] {
  return fields.map(({ type, name, label, description, required, options }) => {
    const base = { name: name.trim(), label, description, required };
    if (type !== 'select') return { ...base, type };
    const choices = [...new Set(options?.map((option) => option.trim()).filter(Boolean))];
    return { ...base, type, options: choices.map((item) => ({ label: item, value: item })) };
  });
}

const useStyles = createStyles(() => ({
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 17rem), 1fr))',
    gap: '1rem',
    alignItems: 'start',
    minWidth: 0
  },
  controls: { display: 'grid', gap: '0.75rem', minWidth: 0 },
  panel: {
    minWidth: 0,
    display: 'grid',
    gap: '0.75rem',
    padding: '0.75rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.25rem)',
    color: 'var(--text-basic-color, #222b45)'
  },
  title: { fontSize: '1rem', margin: 0 }
}));

export type FormDesignerStylesNames = Selectors<typeof useStyles>;

export interface FormDesignerProps extends DefaultProps<FormDesignerStylesNames> {
  value?: readonly FormDesignerField[];
  defaultValue?: readonly FormDesignerField[];
  onChange?(fields: readonly FormDesignerField[]): void;
  onPreviewSubmit?(values: SchemaFormValues): void;
  labels?: Partial<Omit<FormDesignerLabels, 'fieldTypes'>> & {
    fieldTypes?: Partial<FormDesignerLabels['fieldTypes']>;
  };
  fieldListLabels?: Partial<RepeatableFieldsetLabels>;
  previewLabels?: Partial<SchemaFormLabels>;
  disabled?: boolean;
}

const emptyFields: readonly FormDesignerField[] = [];
const validTypes = new Set<FormDesignerFieldType>(['text', 'number', 'date', 'boolean', 'select']);

export const FormDesigner = forwardRef<HTMLDivElement, FormDesignerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    onPreviewSubmit,
    labels,
    fieldListLabels,
    previewLabels,
    disabled,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = props;
  const text = {
    ...defaults,
    ...labels,
    fieldTypes: { ...defaults.fieldTypes, ...labels?.fieldTypes }
  };
  const { classes, cx } = useStyles(null, { name: 'form-designer', classNames, styles, unstyled });
  const [fields, setFields] = useUncontrolled({
    value,
    defaultValue,
    finalValue: emptyFields,
    onChange
  });
  const [selected, select] = useState<string>();
  const id = useId();
  const counter = useRef(0);
  const active = fields.find((field) => field.id === selected) ?? fields[0];
  const optionsId = `${id}-choices`;
  const names = fields.map((field) => field.name.trim());
  const valid =
    new Set(names).size === fields.length &&
    fields.every((field) => field.name.trim() && field.label.trim());
  const propertyFields: readonly PropertyGridField[] = [
    { name: 'name', type: 'text', label: text.name },
    { name: 'label', type: 'text', label: text.label },
    {
      name: 'type',
      type: 'select',
      label: text.type,
      options: Object.entries(text.fieldTypes).map(([type, label]) => ({ value: type, label }))
    },
    { name: 'description', type: 'text', label: text.description },
    { name: 'required', type: 'boolean', label: text.required }
  ];

  const create = (): FormDesignerField => {
    do {
      counter.current += 1;
    } while (
      fields.some(
        (field) =>
          field.id === `${id}-${counter.current}` || field.name === `field${counter.current}`
      )
    );
    return {
      id: `${id}-${counter.current}`,
      name: `field${counter.current}`,
      label: text.newField(counter.current),
      type: 'text'
    };
  };

  const replaceActive = (next: FormDesignerField) => {
    if (!disabled) setFields(fields.map((field) => (field.id === next.id ? next : field)));
  };

  const previewFields = valid ? toSchemaFormFields(fields) : [];

  return (
    <div
      ref={ref}
      style={style}
      className={cx(classes.root, className)}
      role="region"
      aria-label={text.title}
    >
      <div className={classes.controls}>
        <RepeatableFieldset
          legend={text.fields}
          items={fields}
          getItemKey={(field) => field.id}
          createItem={create}
          disabled={disabled}
          labels={{ add: 'Add field', ...fieldListLabels }}
          onChange={(next) => {
            const newField = next.find((item) => !fields.some((field) => item.id === field.id));
            if (newField) select(newField.id);
            setFields(next);
          }}
          renderItem={({ item, index }) => (
            <Button
              type="button"
              size="small"
              status="basic"
              appearance="outline"
              aria-pressed={active?.id === item.id}
              onClick={() => select(item.id)}
            >
              {text.editField(item.label || text.newField(index + 1))}
            </Button>
          )}
        />
        {active && (
          <section className={classes.panel} aria-label={text.properties}>
            <PropertyGrid
              fields={propertyFields}
              labels={{ title: text.fields }}
              value={{
                name: active.name,
                label: active.label,
                type: active.type,
                required: active.required,
                description: active.description
              }}
              searchable={false}
              disabled={disabled}
              onChange={(next) => {
                const type = next.type as FormDesignerFieldType;
                replaceActive({
                  ...active,
                  type: validTypes.has(type) ? type : active.type,
                  name: String(next.name ?? ''),
                  label: String(next.label ?? ''),
                  required: next.required === true,
                  description: String(next.description ?? '')
                });
              }}
            />
            {active.type === 'select' && (
              <FormControl label={text.options} htmlFor={optionsId}>
                <Textarea
                  id={optionsId}
                  fullWidth
                  rows={3}
                  disabled={disabled}
                  value={active.options?.join('\n') ?? ''}
                  onChange={(event) =>
                    replaceActive({ ...active, options: event.target.value.split('\n') })
                  }
                />
              </FormControl>
            )}
          </section>
        )}
      </div>
      <section aria-label={text.preview} className={classes.panel}>
        <h2 className={classes.title}>{text.preview}</h2>
        {previewFields.length > 0 ? (
          <SchemaForm
            key={JSON.stringify(previewFields.map(({ name, type }) => [name, type]))}
            fields={previewFields}
            onSubmit={onPreviewSubmit}
            labels={previewLabels}
          />
        ) : (
          <p role="status">{valid ? text.empty : text.invalidFields}</p>
        )}
      </section>
    </div>
  );
});

FormDesigner.displayName = 'FormDesigner';
