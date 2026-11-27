import React, { forwardRef, useEffect } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthResult {
  score: PasswordStrengthScore;
  label: string;
  percentage: number;
}

export const DEFAULT_PASSWORD_STRENGTH_LABELS: [string, string, string, string] = [
  'Weak',
  'Fair',
  'Good',
  'Strong'
];

export function getPasswordStrength(
  value: string,
  minLength = 8,
  labels: [string, string, string, string] = DEFAULT_PASSWORD_STRENGTH_LABELS
): PasswordStrengthResult {
  if (!value) {
    return { score: 0, label: '', percentage: 0 };
  }

  const { length } = value;
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  const variety = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  let score = 1;
  if (length >= minLength) {
    score += 1;
  }
  if (variety >= 3) {
    score += 1;
  }
  if (length >= Math.max(minLength * 1.5, minLength + 4) && variety >= 3) {
    score += 1;
  }

  const normalized = Math.min(4, Math.max(1, score)) as PasswordStrengthScore;

  return {
    score: normalized,
    label: labels[normalized - 1],
    percentage: normalized * 25
  };
}

const useStyles = createStyles((_theme, { score }: { score: PasswordStrengthScore }) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--password-strength-gap, 0.375rem)',
    width: '100%',
    fontFamily: 'var(--password-strength-font-family, inherit)'
  },

  bars: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--password-strength-bar-gap, 0.25rem)'
  },

  bar: {
    height: 'var(--password-strength-bar-height, 0.25rem)',
    borderRadius: 'var(--password-strength-bar-radius, 999px)',
    backgroundColor: 'var(--password-strength-bar-background, var(--border-basic-color-3, #e4e9f2))'
  },

  barActive: {
    backgroundColor:
      score <= 1
        ? 'var(--password-strength-weak-color, var(--color-danger-500, #ff3d71))'
        : score === 2
          ? 'var(--password-strength-fair-color, var(--color-warning-500, #ffaa00))'
          : score === 3
            ? 'var(--password-strength-good-color, var(--color-info-500, #0095ff))'
            : 'var(--password-strength-strong-color, var(--color-success-500, #00d68f))'
  },

  label: {
    color: 'var(--password-strength-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--password-strength-label-font-size, 0.75rem)',
    lineHeight: 'var(--password-strength-label-line-height, 1.4)'
  }
}));

export type PasswordStrengthStylesNames = Selectors<typeof useStyles>;

export interface PasswordStrengthProps
  extends DefaultProps<PasswordStrengthStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  value: string;
  minLength?: number;
  showLabel?: boolean;
  labels?: [string, string, string, string];
  onStrengthChange?(score: PasswordStrengthScore): void;
  ariaLabel?: string;
}

const defaultProps: Partial<PasswordStrengthProps> = {
  minLength: 8,
  showLabel: true,
  labels: DEFAULT_PASSWORD_STRENGTH_LABELS,
  ariaLabel: 'Password strength'
};

const _PasswordStrength = forwardRef<HTMLDivElement, PasswordStrengthProps>((props, ref) => {
  const {
    value,
    minLength,
    showLabel,
    labels,
    onStrengthChange,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const result = getPasswordStrength(value, minLength, labels);
  const { classes, cx } = useStyles(
    { score: result.score },
    { name: 'password-strength', classNames, styles, unstyled }
  );

  useEffect(() => {
    onStrengthChange?.(result.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.score]);

  return (
    <div
      {...others}
      ref={ref}
      role="meter"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={4}
      aria-valuenow={result.score}
      aria-valuetext={result.label || undefined}
      data-score={result.score}
      className={cx(classes.root, className)}
    >
      <div className={cx(classes.bars)} aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cx(classes.bar, { [classes.barActive]: step <= result.score })}
          />
        ))}
      </div>

      {showLabel && result.label && <span className={cx(classes.label)}>{result.label}</span>}
    </div>
  );
});

_PasswordStrength.displayName = 'PasswordStrength';

export { _PasswordStrength as PasswordStrength };
