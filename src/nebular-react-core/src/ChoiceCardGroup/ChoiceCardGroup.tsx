import React, { forwardRef, useId } from 'react';
import { useUncontrolled } from '@nebular-react/hooks';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Checkbox } from '../Checkbox';
import { Radio } from '../Radio';
import { RadioGroupContext } from '../Radio/RadioGroup.context';

export interface ChoiceCardOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Decorative content. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

const useStyles = createStyles(() => ({
  root: { margin: 0, padding: 0, border: 0, minWidth: 0 },
  legend: {
    color: 'var(--text-basic-color, #222b45)',
    fontWeight: 600,
    marginBottom: '0.375rem',
    padding: 0
  },
  description: {
    display: 'block',
    color: 'var(--text-basic-color, #222b45)',
    fontSize: '0.8125rem',
    fontWeight: 400
  },
  options: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))',
    gap: 'var(--choice-card-group-gap, 0.5rem)'
  },
  option: {
    minWidth: 0,

    '& > label': {
      boxSizing: 'border-box',
      width: '100%',
      minHeight: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.375rem',
      padding: '0.75rem',
      border: '1px solid var(--border-basic-color-3, #e4e9f2)',
      borderRadius: 'var(--border-radius, 0.25rem)',
      backgroundColor: 'var(--background-basic-color-1, #fff)',
      cursor: 'pointer'
    },

    '& > label:has(input:checked)': {
      borderColor: 'var(--color-primary-500, #3366ff)',
      backgroundColor: 'var(--background-basic-color-2, #f7f9fc)'
    },

    '& > label:has(input:focus-visible)': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    },

    '& > label:has(input:disabled)': {
      cursor: 'not-allowed',
      opacity: 0.65
    },

    '& > label > .nebular-radio-circle': {
      insetInlineStart: '0.75rem'
    }
  },
  content: { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', minWidth: 0 },
  label: { display: 'block', fontWeight: 600, overflowWrap: 'anywhere' },
  introduction: { margin: '0 0 0.5rem' },
  error: { marginBottom: '0.5rem', color: 'var(--color-danger-700, #b81d49)' }
}));

export type ChoiceCardGroupStylesNames = Selectors<typeof useStyles>;

interface ChoiceCardGroupBaseProps
  extends
    DefaultProps<ChoiceCardGroupStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'fieldset'>, 'defaultValue' | 'onChange' | 'children'> {
  options: readonly ChoiceCardOption[];
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  /** Require one selected option in single-choice mode. */
  required?: boolean;
}

export type ChoiceCardGroupProps = ChoiceCardGroupBaseProps &
  (
    | {
        multiple?: false;
        value?: string | null;
        defaultValue?: string | null;
        onChange?(value: string): void;
      }
    | {
        multiple: true;
        value?: readonly string[];
        defaultValue?: readonly string[];
        onChange?(value: string[]): void;
      }
  );

export const ChoiceCardGroup = forwardRef<HTMLFieldSetElement, ChoiceCardGroupProps>(
  (props, ref) => {
    const {
      options,
      label,
      description,
      error,
      required,
      multiple,
      value,
      defaultValue,
      onChange: _onChange,
      disabled,
      name,
      form,
      className,
      classNames,
      styles,
      unstyled,
      'aria-describedby': ariaDescribedBy,
      ...others
    } = props;
    const id = useId();
    const inputName = name ?? `${id}-choice`;
    const { classes, cx } = useStyles(null, {
      name: 'choice-card-group',
      classNames,
      styles,
      unstyled
    });
    const [selected, setSelected] = useUncontrolled<string | readonly string[] | null>({
      value,
      defaultValue,
      finalValue: multiple ? [] : null
    });
    const selectedItems = typeof selected === 'string' || selected === null ? [] : selected;
    const groupDescriptionIds = [
      ariaDescribedBy,
      description ? `${id}-description` : undefined,
      error ? `${id}-error` : undefined
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <fieldset
        {...others}
        ref={ref}
        disabled={disabled}
        form={form}
        aria-describedby={groupDescriptionIds || undefined}
        aria-invalid={error ? true : others['aria-invalid']}
        className={cx(classes.root, className)}
      >
        {label && <legend className={classes.legend}>{label}</legend>}
        {description && (
          <div id={`${id}-description`} className={cx(classes.description, classes.introduction)}>
            {description}
          </div>
        )}
        {error && (
          <div id={`${id}-error`} className={classes.error} role="alert">
            {error}
          </div>
        )}
        <RadioGroupContext.Provider value={{ status: 'basic' }}>
          <div className={classes.options}>
            {options.map((option, index) => {
              const labelId = `${id}-label-${index}`;
              const descriptionId = `${id}-description-${index}`;
              const content = (
                <span className={classes.content}>
                  {option.icon && <span aria-hidden="true">{option.icon}</span>}
                  <span>
                    <span id={labelId} className={classes.label}>
                      {option.label}
                    </span>
                    {option.description && (
                      <span id={descriptionId} className={classes.description}>
                        {option.description}
                      </span>
                    )}
                  </span>
                </span>
              );
              const inputProps = {
                name: inputName,
                form,
                value: option.value,
                disabled: disabled || option.disabled,
                'aria-labelledby': labelId,
                'aria-describedby': option.description ? descriptionId : undefined,
                className: classes.option,
                unstyled
              };

              return props.multiple === true ? (
                <Checkbox
                  key={option.value}
                  {...inputProps}
                  checked={selectedItems.includes(option.value)}
                  onCheck={(checked) => {
                    const next = checked
                      ? [...selectedItems, option.value]
                      : selectedItems.filter((item) => item !== option.value);
                    setSelected(next);
                    props.onChange?.(next);
                  }}
                >
                  {content}
                </Checkbox>
              ) : (
                <Radio
                  key={option.value}
                  {...inputProps}
                  checked={selected === option.value}
                  label={content}
                  required={required}
                  onChange={() => {
                    setSelected(option.value);
                    props.onChange?.(option.value);
                  }}
                />
              );
            })}
          </div>
        </RadioGroupContext.Provider>
      </fieldset>
    );
  }
);

ChoiceCardGroup.displayName = 'ChoiceCardGroup';
