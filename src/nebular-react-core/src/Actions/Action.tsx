import React, { useEffect, useState } from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles, { ActionStylesParams } from './Action.style';
import { BadgeProps } from '../Badge';

export type ActionStylesNames = Selectors<typeof useStyles>;

export interface ActionProps
  extends DefaultProps<ActionStylesNames, ActionStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  icon?: React.ReactNode;
  disabled?: boolean;
  tabIndex?: number;
  badge?: React.ReactElement<BadgeProps>;
  children?: React.ReactNode;
}

const defaultProps: Partial<ActionProps> = {
  title: '',
  disabled: false
};

const _Action = React.forwardRef<HTMLButtonElement, ActionProps & { component: any }>(
  (props, ref) => {
    const {
      icon,
      disabled,
      tabIndex,
      badge,
      className,
      classNames,
      styles,
      unstyled,
      children,
      ...others
    } = useComponentDefaultProps(defaultProps, props);

    const iconOnly = !!icon && !children;
    const Element = props.component || 'button';
    const { classes, cx } = useStyles(
      { disabled, iconOnly },
      { name: 'action', unstyled, classNames, styles }
    );

    const [tabIndexValue, setTabIndexValue] = useState<number>(tabIndex ?? 0);
    useEffect(() => {
      if (disabled) setTabIndexValue(-1);
      else setTabIndexValue(tabIndex ?? 0);
    }, [disabled]);

    const handleFocus = (event: any) => {
      if (disabled) {
        event.preventDefault();
        event.stopProgagation();
      }
    };

    return (
      <div className={cx(classes.wrapper, className)}>
        <Element
          className={cx(classes.root)}
          disabled={disabled}
          aria-disabled={disabled}
          tabIndex={tabIndexValue}
          ref={ref}
          onFocus={handleFocus}
          {...others}
        >
          {icon && <>{icon}</>}
          {children && <>{children}</>}
          {badge}
        </Element>
      </div>
    );
  }
);

_Action.displayName = '@nebular-react/core/Action';

export const Action = createPolymorphicComponent<'button', ActionProps>(_Action);
