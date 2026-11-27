import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type StackDirection = 'row' | 'column';

export type SpacingToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type SpacingValue = number | string;

const spacingTokens: Record<SpacingToken, string> = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem'
};

export function resolveSpacing(value: SpacingValue = 'md'): string {
  if (typeof value === 'number') {
    return `${value}px`;
  }

  return spacingTokens[value as SpacingToken] ?? value;
}

export interface StackStylesParams {
  direction: StackDirection;
  gap: string;
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
  wrap?: React.CSSProperties['flexWrap'];
}

const useStyles = createStyles(
  (_theme, { direction, gap, align, justify, wrap }: StackStylesParams) => ({
    root: {
      display: 'flex',
      flexDirection: direction,
      gap,
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap
    }
  })
);

export type StackStylesNames = Selectors<typeof useStyles>;

export interface StackProps
  extends DefaultProps<StackStylesNames, StackStylesParams>, React.ComponentPropsWithoutRef<'div'> {
  direction?: StackDirection;
  gap?: SpacingValue;
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
  wrap?: React.CSSProperties['flexWrap'];
}

const defaultProps: Partial<StackProps> = {
  direction: 'column',
  gap: 'md',
  wrap: 'nowrap'
};

const _Stack = forwardRef<HTMLDivElement, StackProps>((props, ref) => {
  const {
    children,
    direction,
    gap,
    align,
    justify,
    wrap,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { direction, gap: resolveSpacing(gap), align, justify, wrap },
    { name: 'stack', classNames, styles, unstyled }
  );

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      {children}
    </div>
  );
});

_Stack.displayName = 'Stack';

export { _Stack as Stack };
