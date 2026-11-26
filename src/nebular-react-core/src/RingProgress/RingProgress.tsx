import React, { forwardRef } from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface RingProgressSection {
  /** Numeric weight of the section. Sections are normalized to fill the ring. */
  value: number;
  color?: string;
}

export interface RingProgressProps
  extends
    DefaultProps<RingProgressStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Progress percentage from 0 to 100. Ignored when `sections` is provided. */
  value?: number;
  /** Multiple weighted sections that share the ring. */
  sections?: RingProgressSection[];
  size?: number;
  thickness?: number;
  roundCaps?: boolean;
  label?: React.ReactNode;
  status?: ComponentOrCustomStatus;
  ariaLabel?: string;
}

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    verticalAlign: 'middle'
  },

  svg: {
    display: 'block',
    overflow: 'visible'
  },

  track: {
    stroke: 'var(--ring-progress-track-color, var(--background-basic-color-3, #edf1f7))'
  },

  section: {
    transition: 'stroke-dasharray 200ms ease, stroke-dashoffset 200ms ease'
  },

  label: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    lineHeight: 1.2,
    fontWeight: 600,
    color: 'var(--ring-progress-label-color, var(--text-basic-color, #222b45))',
    pointerEvents: 'none'
  }
}));

export type RingProgressStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<RingProgressProps> = {
  size: 120,
  thickness: 12,
  roundCaps: false,
  status: 'primary',
  ariaLabel: 'Progress'
};

function clampPercentage(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value as number));
}

const _RingProgress = forwardRef<HTMLDivElement, RingProgressProps>((props, ref) => {
  const {
    value,
    sections,
    size,
    thickness,
    roundCaps,
    label,
    status,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'ring-progress',
    classNames,
    styles,
    unstyled
  });

  const dimension = Math.max(1, size);
  const strokeWidth = Math.min(Math.max(0, thickness), dimension / 2);
  const radius = Math.max(0, (dimension - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const hasSections = Array.isArray(sections) && sections.length > 0;
  const normalizedSections = hasSections
    ? sections.map((section) => ({
        value: Number.isFinite(section.value) ? Math.max(0, section.value) : 0,
        color: section.color
      }))
    : [{ value: clampPercentage(value), color: undefined }];
  const total = normalizedSections.reduce((sum, section) => sum + section.value, 0);

  let offset = 0;
  const segments = normalizedSections
    .map((section, index) => {
      const fraction = hasSections ? (total > 0 ? section.value / total : 0) : section.value / 100;
      const segment = {
        key: index,
        fraction,
        offset,
        color:
          section.color ??
          `var(--ring-progress-${status}-color, var(--color-${status}-500, #3366ff))`
      };

      offset += fraction;
      return segment;
    })
    .filter((segment) => segment.fraction > 0);

  const role = hasSections ? 'img' : 'progressbar';
  const progressProps = hasSections
    ? {}
    : {
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': Math.round(clampPercentage(value))
      };

  return (
    <div
      {...others}
      ref={ref}
      role={role}
      aria-label={ariaLabel}
      {...progressProps}
      className={cx(classes.root, className)}
      style={{ width: dimension, height: dimension, ...others.style }}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        className={classes.svg}
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
      >
        <circle
          className={classes.track}
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        {segments.map((segment) => (
          <circle
            key={segment.key}
            className={classes.section}
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap={roundCaps ? 'round' : 'butt'}
            strokeDasharray={`${segment.fraction * circumference} ${circumference}`}
            strokeDashoffset={-segment.offset * circumference}
            transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
          />
        ))}
      </svg>
      {label != null && (
        <div
          className={classes.label}
          style={{ fontSize: Math.max(10, dimension * 0.16) }}
          aria-hidden="true"
        >
          {label}
        </div>
      )}
    </div>
  );
});

_RingProgress.displayName = 'RingProgress';

export { _RingProgress as RingProgress };
