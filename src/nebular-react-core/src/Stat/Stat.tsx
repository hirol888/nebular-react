import React, { forwardRef } from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Icon } from '../Icon';

export interface StatTrend {
  value: React.ReactNode;
  direction?: 'up' | 'down' | 'flat';
}

export interface StatProps
  extends DefaultProps<StatStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: StatTrend;
  status?: ComponentOrCustomStatus;
}

const useStyles = createStyles((_theme, { status }: { status: ComponentOrCustomStatus }) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    padding: 'var(--stat-padding, 1rem 1.25rem)',
    border: '1px solid var(--stat-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--stat-border-radius, 0.5rem)',
    backgroundColor: 'var(--stat-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--stat-shadow, 0 1px 2px rgba(0, 0, 0, 0.04))',
    fontFamily: 'var(--stat-text-font-family, inherit)'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem'
  },

  label: {
    color: 'var(--stat-label-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--stat-label-font-size, 0.75rem)',
    fontWeight: 600,
    letterSpacing: '0.02em',
    textTransform: 'uppercase'
  },

  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: `var(--stat-${status}-color, var(--color-primary-500, #3366ff))`,
    fontSize: '1.25rem'
  },

  value: {
    color: `var(--stat-${status}-color, var(--text-basic-color, #222b45))`,
    fontSize: 'var(--stat-value-font-size, 1.625rem)',
    fontWeight: 700,
    lineHeight: 1.2
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: '1.25rem'
  },

  trend: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    fontSize: '0.75rem',
    fontWeight: 600
  },

  trendUp: {
    color: 'var(--stat-trend-up-color, var(--color-success-500, #00d68f))'
  },

  trendDown: {
    color: 'var(--stat-trend-down-color, var(--color-danger-500, #ff3d71))'
  },

  trendFlat: {
    color: 'var(--stat-trend-flat-color, var(--text-hint-color, #8f9bb3))'
  },

  hint: {
    color: 'var(--stat-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--stat-hint-font-size, 0.75rem)'
  }
}));

export type StatStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<StatProps> = {
  status: 'primary',
  trend: undefined
};

const _Stat = forwardRef<HTMLDivElement, StatProps>((props, ref) => {
  const {
    label,
    value,
    hint,
    icon,
    trend,
    status,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles({ status }, { name: 'stat', classNames, styles, unstyled });
  const direction = trend?.direction ?? 'flat';

  return (
    <div
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      aria-label={typeof label === 'string' ? label : undefined}
    >
      <div className={cx(classes.header)}>
        <span className={cx(classes.label)}>{label}</span>
        {icon && <span className={cx(classes.icon)}>{icon}</span>}
      </div>
      <div className={cx(classes.value)}>{value}</div>
      {(trend || hint) && (
        <div className={cx(classes.footer)}>
          {trend && (
            <span
              className={cx(classes.trend, {
                [classes.trendUp]: direction === 'up',
                [classes.trendDown]: direction === 'down',
                [classes.trendFlat]: direction === 'flat'
              })}
            >
              <Icon
                icon={
                  direction === 'up'
                    ? 'arrow-up-outline'
                    : direction === 'down'
                      ? 'arrow-down-outline'
                      : 'minus-outline'
                }
                pack="nebular-essentials"
                aria-hidden="true"
              />
              {trend.value}
            </span>
          )}
          {hint && <span className={cx(classes.hint)}>{hint}</span>}
        </div>
      )}
    </div>
  );
});

_Stat.displayName = 'Stat';

const KpiCard = _Stat;

export { _Stat as Stat, KpiCard };
