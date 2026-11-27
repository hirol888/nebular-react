import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface TimelineItem {
  id?: React.Key;
  title: React.ReactNode;
  time?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  active?: boolean;
}

export interface TimelineProps
  extends DefaultProps<TimelineStylesNames>, React.ComponentPropsWithoutRef<'ol'> {
  items: TimelineItem[];
  bulletSize?: number;
  lineWidth?: number;
}

const useStyles = createStyles(
  (_theme, { bulletSize, lineWidth }: { bulletSize: number; lineWidth: number }) => ({
    root: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      margin: 0,
      padding: 0,
      paddingInlineStart: `calc(${bulletSize}px + 0.75rem)`,
      listStyle: 'none',
      fontFamily: 'var(--timeline-text-font-family, inherit)'
    },

    item: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
      paddingBottom: '1rem',
      minHeight: bulletSize,

      '&:not(:last-of-type)::before': {
        content: '""',
        position: 'absolute',
        top: bulletSize,
        bottom: 0,
        insetInlineStart: `calc(-${(bulletSize + lineWidth) / 2}px - 0.75rem)`,
        width: lineWidth,
        backgroundColor: 'var(--timeline-line-color, var(--border-basic-color-3, #e4e9f2))'
      }
    },

    bullet: {
      position: 'absolute',
      top: 0,
      insetInlineStart: `calc(-${bulletSize}px - 0.75rem)`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: bulletSize,
      height: bulletSize,
      boxSizing: 'border-box',
      borderRadius: '50%',
      border:
        '2px solid var(--timeline-bullet-border-color, var(--background-basic-color-1, #ffffff))',
      backgroundColor:
        'var(--timeline-bullet-background-color, var(--background-basic-color-1, #ffffff))',
      color: 'var(--timeline-bullet-color, var(--color-primary-500, #3366ff))',
      fontSize: bulletSize * 0.5
    },

    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.15rem'
    },

    titleRow: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: '0.75rem'
    },

    title: {
      color: 'var(--timeline-title-color, var(--text-basic-color, #222b45))',
      fontSize: 'var(--timeline-title-font-size, 0.875rem)',
      fontWeight: 600,
      lineHeight: 1.4
    },

    time: {
      color: 'var(--timeline-time-color, var(--text-hint-color, #8f9bb3))',
      fontSize: 'var(--timeline-time-font-size, 0.75rem)',
      whiteSpace: 'nowrap'
    },

    description: {
      color: 'var(--timeline-description-color, var(--text-hint-color, #8f9bb3))',
      fontSize: 'var(--timeline-description-font-size, 0.8125rem)',
      lineHeight: 1.5
    }
  })
);

export type TimelineStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<TimelineProps> = {
  bulletSize: 28,
  lineWidth: 2
};

const _Timeline = forwardRef<HTMLOListElement, TimelineProps>((props, ref) => {
  const { items, bulletSize, lineWidth, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { bulletSize, lineWidth },
    { name: 'timeline', classNames, styles, unstyled }
  );

  return (
    <ol {...others} ref={ref} className={cx(classes.root, className)}>
      {items.map((item, index) => (
        <li key={item.id ?? index} className={cx(classes.item)}>
          <span
            className={cx(classes.bullet)}
            style={item.color ? { color: item.color } : undefined}
            aria-hidden="true"
          >
            {item.icon}
          </span>
          <div className={cx(classes.content)}>
            <div className={cx(classes.titleRow)}>
              <span className={cx(classes.title)}>{item.title}</span>
              {item.time && <span className={cx(classes.time)}>{item.time}</span>}
            </div>
            {item.description && <div className={cx(classes.description)}>{item.description}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
});

_Timeline.displayName = 'Timeline';

export { _Timeline as Timeline };
