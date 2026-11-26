import React, { createElement, forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';

export function formatNumber(
  value: number | null | undefined,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '';
  }

  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return String(value);
  }
}

const useStyles = createStyles(() => ({
  root: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '0.125rem',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--number-formatter-color, inherit)',
    fontFamily: 'var(--number-formatter-font-family, inherit)',
    fontSize: 'var(--number-formatter-font-size, inherit)',
    fontWeight: 'var(--number-formatter-font-weight, inherit)' as React.CSSProperties['fontWeight']
  },

  prefix: {
    color: 'var(--number-formatter-prefix-color, inherit)'
  },

  value: {
    color: 'var(--number-formatter-value-color, inherit)'
  },

  suffix: {
    color: 'var(--number-formatter-suffix-color, inherit)'
  },

  fallback: {
    color: 'var(--number-formatter-fallback-color, var(--text-hint-color, #8f9bb3))'
  }
}));

export type NumberFormatterStylesNames = Selectors<typeof useStyles>;
export type NumberFormatterElement = 'span' | 'div' | 'strong' | 'b' | 'p';

export interface NumberFormatterProps
  extends
    DefaultProps<NumberFormatterStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'span'>, 'children' | 'prefix'> {
  value: number | null | undefined;
  locale?: string;
  options?: Intl.NumberFormatOptions;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  fallback?: React.ReactNode;
  as?: NumberFormatterElement;
}

const defaultProps: Partial<NumberFormatterProps> = {
  fallback: '—',
  as: 'span'
};

const _NumberFormatter = forwardRef<HTMLElement, NumberFormatterProps>((props, ref) => {
  const {
    value,
    locale,
    options,
    prefix,
    suffix,
    fallback,
    as,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { locale: providerLocale } = useNebularLocale();
  const { classes, cx } = useStyles(undefined, {
    name: 'number-formatter',
    classNames,
    styles,
    unstyled
  });
  const formatted = formatNumber(value, locale ?? providerLocale, options);
  const hasValue = formatted.length > 0;

  return createElement(
    as,
    {
      ...others,
      ref,
      className: cx(classes.root, className),
      'data-empty': hasValue ? undefined : 'true'
    },
    hasValue ? (
      <>
        {prefix && <span className={cx(classes.prefix)}>{prefix}</span>}
        <span className={cx(classes.value)}>{formatted}</span>
        {suffix && <span className={cx(classes.suffix)}>{suffix}</span>}
      </>
    ) : (
      <span className={cx(classes.fallback)}>{fallback}</span>
    )
  );
});

_NumberFormatter.displayName = 'NumberFormatter';

export { _NumberFormatter as NumberFormatter };
