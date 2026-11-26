import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { SpacingValue, StackDirection, resolveSpacing } from '../Stack/Stack';

export interface FlexStylesParams {
  direction: StackDirection;
  gap: string;
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
  wrap?: React.CSSProperties['flexWrap'];
  inline?: boolean;
}

const useStyles = createStyles(
  (_theme, { direction, gap, align, justify, wrap, inline }: FlexStylesParams) => ({
    root: {
      display: inline ? 'inline-flex' : 'flex',
      flexDirection: direction,
      gap,
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap
    }
  })
);

export type FlexStylesNames = Selectors<typeof useStyles>;

export interface FlexProps
  extends DefaultProps<FlexStylesNames, FlexStylesParams>, React.ComponentPropsWithoutRef<'div'> {
  direction?: StackDirection;
  gap?: SpacingValue;
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
  wrap?: React.CSSProperties['flexWrap'];
  inline?: boolean;
}

const defaultProps: Partial<FlexProps> = {
  direction: 'row',
  gap: 'md',
  wrap: 'nowrap',
  inline: false
};

const _Flex = forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
  const {
    children,
    direction,
    gap,
    align,
    justify,
    wrap,
    inline,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { direction, gap: resolveSpacing(gap), align, justify, wrap, inline },
    { name: 'flex', classNames, styles, unstyled }
  );

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      {children}
    </div>
  );
});

_Flex.displayName = 'Flex';

export { _Flex as Flex };
