import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface DescriptionItem {
  label: React.ReactNode;
  value: React.ReactNode;
  span?: number;
}

export interface DescriptionsProps
  extends
    DefaultProps<DescriptionsStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  items: DescriptionItem[];
  columns?: number;
  title?: React.ReactNode;
  bordered?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const useStyles = createStyles(
  (
    _theme,
    {
      columns,
      bordered,
      size
    }: { columns: number; bordered: boolean; size: 'small' | 'medium' | 'large' }
  ) => ({
    root: {
      width: '100%',
      fontFamily: 'var(--descriptions-text-font-family, inherit)'
    },

    title: {
      marginBottom: '0.5rem',
      color: 'var(--descriptions-title-color, var(--text-basic-color, #222b45))',
      fontSize: 'var(--descriptions-title-font-size, 0.9375rem)',
      fontWeight: 600
    },

    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: bordered ? 0 : '0.75rem 1.25rem',
      border: bordered
        ? '1px solid var(--descriptions-border-color, var(--border-basic-color-3, #e4e9f2))'
        : 'none',
      borderRadius: bordered ? 'var(--descriptions-border-radius, 0.25rem)' : undefined,
      overflow: bordered ? 'hidden' : undefined
    },

    item: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.15rem',
      padding: `var(--descriptions-${size}-padding, 0.5rem 0.75rem)`,
      borderBottom: bordered
        ? '1px solid var(--descriptions-border-color, var(--border-basic-color-3, #e4e9f2))'
        : 'none'
    },

    label: {
      color: 'var(--descriptions-label-color, var(--text-hint-color, #8f9bb3))',
      fontSize: `var(--descriptions-${size}-label-font-size, 0.75rem)`,
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'uppercase'
    },

    value: {
      color: 'var(--descriptions-value-color, var(--text-basic-color, #222b45))',
      fontSize: `var(--descriptions-${size}-value-font-size, 0.875rem)`,
      lineHeight: 1.5,
      wordBreak: 'break-word'
    }
  })
);

export type DescriptionsStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<DescriptionsProps> = {
  columns: 1,
  bordered: false,
  size: 'medium'
};

const _Descriptions = forwardRef<HTMLDivElement, DescriptionsProps>((props, ref) => {
  const {
    items,
    columns,
    title,
    bordered,
    size,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { columns, bordered, size },
    { name: 'descriptions', classNames, styles, unstyled }
  );

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      {title && <div className={cx(classes.title)}>{title}</div>}
      <dl className={cx(classes.grid)}>
        {items.map((item, index) => (
          <div
            key={index}
            className={cx(classes.item)}
            style={item.span ? { gridColumn: `span ${item.span}` } : undefined}
          >
            <dt className={cx(classes.label)}>{item.label}</dt>
            <dd className={cx(classes.value)} style={{ margin: 0 }}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
});

_Descriptions.displayName = 'Descriptions';

export { _Descriptions as Descriptions };
