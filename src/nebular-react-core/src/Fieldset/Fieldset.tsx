import React, { forwardRef } from 'react';
import { useId } from '@nebular-react/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type FieldsetVariant = 'default' | 'filled';

export interface FieldsetStylesParams {
  variant: FieldsetVariant;
  withBorder: boolean;
}

const useStyles = createStyles((_theme, { variant, withBorder }: FieldsetStylesParams) => ({
  root: {
    margin: 0,
    minWidth: 0,
    padding: 'var(--fieldset-padding, 0.875rem 1rem)',
    border: withBorder
      ? '1px solid var(--fieldset-border-color, var(--border-basic-color-3, #e4e9f2))'
      : 'none',
    borderRadius: 'var(--fieldset-border-radius, 0.375rem)',
    backgroundColor:
      variant === 'filled'
        ? 'var(--fieldset-background-color, var(--background-basic-color-1, #f7f9fc))'
        : 'transparent',
    fontFamily: 'var(--fieldset-text-font-family, inherit)'
  },

  legend: {
    padding: '0 0.35rem',
    color: 'var(--fieldset-legend-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--fieldset-legend-font-size, 0.875rem)',
    fontWeight: 600,
    lineHeight: 'var(--fieldset-legend-line-height, 1.4)'
  },

  description: {
    margin: '0 0 0.625rem',
    color: 'var(--fieldset-description-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--fieldset-description-font-size, 0.75rem)',
    lineHeight: 'var(--fieldset-description-line-height, 1.4)'
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--fieldset-content-gap, 0.75rem)'
  },

  disabled: {
    opacity: 'var(--fieldset-disabled-opacity, 0.6)'
  }
}));

export type FieldsetStylesNames = Selectors<typeof useStyles>;

export interface FieldsetProps
  extends
    DefaultProps<FieldsetStylesNames, FieldsetStylesParams>,
    React.ComponentPropsWithoutRef<'fieldset'> {
  legend?: React.ReactNode;
  description?: React.ReactNode;
  variant?: FieldsetVariant;
  withBorder?: boolean;
  ariaLabel?: string;
}

const defaultProps: Partial<FieldsetProps> = {
  variant: 'default',
  withBorder: true
};

const _Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>((props, ref) => {
  const {
    legend,
    description,
    variant,
    withBorder,
    disabled,
    ariaLabel,
    children,
    className,
    classNames,
    styles,
    unstyled,
    'aria-describedby': ariaDescribedBy,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { variant, withBorder },
    { name: 'fieldset', classNames, styles, unstyled }
  );
  const descriptionId = useId();
  const describedBy = [ariaDescribedBy, description ? descriptionId : undefined]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <fieldset
      {...others}
      ref={ref}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={describedBy || undefined}
      data-variant={variant}
      data-with-border={withBorder ? 'true' : undefined}
      className={cx(classes.root, className, { [classes.disabled]: disabled })}
    >
      {legend && <legend className={cx(classes.legend)}>{legend}</legend>}

      {description && (
        <div id={descriptionId} className={cx(classes.description)}>
          {description}
        </div>
      )}

      <div className={cx(classes.content)}>{children}</div>
    </fieldset>
  );
});

_Fieldset.displayName = 'Fieldset';

export { _Fieldset as Fieldset };
