import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type VisuallyHiddenElement = 'span' | 'div';

interface VisuallyHiddenStylesParams {
  focusable: boolean;
}

const useStyles = createStyles((_theme, { focusable }: VisuallyHiddenStylesParams) => ({
  root: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
    clipPath: 'inset(50%)',

    ...(focusable
      ? {
          '&:focus, &:focus-within': {
            position: 'static',
            width: 'auto',
            height: 'auto',
            padding: 0,
            margin: 0,
            overflow: 'visible',
            clip: 'auto',
            whiteSpace: 'normal',
            clipPath: 'none'
          }
        }
      : {})
  }
}));

export type VisuallyHiddenStylesNames = Selectors<typeof useStyles>;

export interface VisuallyHiddenProps extends DefaultProps<VisuallyHiddenStylesNames> {
  children: React.ReactNode;
  as?: VisuallyHiddenElement;
  focusable?: boolean;
}

const defaultProps: Partial<VisuallyHiddenProps> = {
  as: 'span',
  focusable: false
};

const _VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>((props, ref) => {
  const { children, as, focusable, className, classNames, styles, unstyled } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { focusable },
    { name: 'visually-hidden', classNames, styles, unstyled }
  );
  const rootClassName = cx(classes.root, className);

  if (as === 'div') {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={rootClassName}
        data-focusable={focusable ? 'true' : undefined}
      >
        {children}
      </div>
    );
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={rootClassName}
      data-focusable={focusable ? 'true' : undefined}
    >
      {children}
    </span>
  );
});

_VisuallyHidden.displayName = 'VisuallyHidden';

export { _VisuallyHidden as VisuallyHidden };
