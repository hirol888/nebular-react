import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { SpacingValue, resolveSpacing } from '../Stack/Stack';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const maxWidths: Record<ContainerSize, string> = {
  sm: '40rem',
  md: '48rem',
  lg: '60rem',
  xl: '80rem',
  full: '100%'
};

export interface ContainerStylesParams {
  size: ContainerSize;
  padding: string;
  centered: boolean;
}

const useStyles = createStyles((_theme, { size, padding, centered }: ContainerStylesParams) => ({
  root: {
    width: '100%',
    maxWidth: `var(--container-${size}-max-width, ${maxWidths[size]})`,
    padding,

    ...(centered ? { marginLeft: 'auto', marginRight: 'auto' } : {})
  }
}));

export type ContainerStylesNames = Selectors<typeof useStyles>;

export interface ContainerProps
  extends
    DefaultProps<ContainerStylesNames, ContainerStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  size?: ContainerSize;
  padding?: SpacingValue;
  centered?: boolean;
}

const defaultProps: Partial<ContainerProps> = {
  size: 'lg',
  padding: 'md',
  centered: true
};

const _Container = forwardRef<HTMLDivElement, ContainerProps>((props, ref) => {
  const { children, size, padding, centered, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { size, padding: resolveSpacing(padding), centered },
    { name: 'container', classNames, styles, unstyled }
  );

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      {children}
    </div>
  );
});

_Container.displayName = 'Container';

export { _Container as Container };
