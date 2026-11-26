import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { UseFormReturn } from './useForm';

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--form-gap, 0.75rem)',
    width: '100%',
    fontFamily: 'var(--form-text-font-family, inherit)'
  },

  summary: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--form-summary-gap, 0.25rem)',
    padding: 'var(--form-summary-padding, 0.5rem 0.75rem)',
    border: '1px solid var(--form-summary-border-color, var(--color-danger-500, #ff3d71))',
    borderRadius: 'var(--form-summary-border-radius, 0.25rem)',
    backgroundColor: 'var(--form-summary-background-color, rgba(255, 61, 113, 0.08))',
    color: 'var(--form-summary-text-color, var(--color-danger-500, #ff3d71))',
    fontSize: 'var(--form-summary-text-font-size, 0.8125rem)',
    lineHeight: 'var(--form-summary-text-line-height, 1.4)'
  },

  summaryTitle: {
    fontWeight: 'var(--form-summary-title-font-weight, 600)' as any
  },

  summaryList: {
    margin: 0,
    paddingLeft: 'var(--form-summary-list-padding, 1.25rem)'
  }
}));

export type FormStylesNames = Selectors<typeof useStyles>;

export interface FormProps extends DefaultProps<FormStylesNames> {
  form: UseFormReturn<any>;
  children: React.ReactNode;
  onSuccess?(): void;
  ariaLabel?: string;
  noValidate?: boolean;
}

const defaultProps: Partial<FormProps> = {
  noValidate: true
};

const _Form = forwardRef<HTMLFormElement, FormProps>((props, ref) => {
  const {
    form,
    children,
    onSuccess,
    ariaLabel,
    noValidate,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'form',
    classNames,
    styles,
    unstyled
  });

  const errorEntries = Object.entries(form.errors ?? {}).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    form.handleSubmit(event, onSuccess).catch(() => undefined);
  };

  return (
    <form
      ref={ref}
      className={cx(classes.root, className)}
      aria-label={ariaLabel}
      aria-busy={form.validating ? true : undefined}
      data-validating={form.validating ? true : undefined}
      noValidate={noValidate}
      onSubmit={handleSubmit}
    >
      {errorEntries.length > 0 && (
        <div role="alert" className={cx(classes.summary)}>
          <span className={cx(classes.summaryTitle)}>Please fix the errors below.</span>
          <ul className={cx(classes.summaryList)}>
            {errorEntries.map(([key, message]) => (
              <li key={key} id={`${key}-error`}>
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {children}
    </form>
  );
});

_Form.displayName = 'Form';

export { _Form as Form };
