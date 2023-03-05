import React, { useRef } from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import { useIsomorphicEffect } from '@nebular-react/hooks';
import { useOptionGroupComponentContext } from '../OptionGroup/OptionGroupComponent.context';
import useStyles from './OptionComponent.style';
import { useOptionListContext } from '../OptionList.context';
import { Checkbox } from '../../../Checkbox/Checkbox';
import { OptionInternal } from '../types';

export type OptionStylesNames = Selectors<typeof useStyles>;

export interface OptionComponentProps
  extends Omit<OptionInternal, 'type'>,
    React.ComponentPropsWithoutRef<'div'>,
    DefaultProps<OptionStylesNames> {}

const defaultProps: Partial<OptionComponentProps> = {
  disabled: false,
  selected: false,
  active: false
};

const OptionComponent: React.FC<OptionComponentProps> = (props) => {
  const {
    className,
    label,
    value,
    disabled,
    selected,
    active,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const _disabled = disabled || useOptionGroupComponentContext().disabled;
  const { size, multiple, keyManagerType, onOptionSelected } = useOptionListContext();
  const { classes, cx } = useStyles({ size }, { name: 'option', unstyled, classNames, styles });

  const optionRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    onOptionSelected && onOptionSelected({ label, value, selected: !selected });
  };

  useIsomorphicEffect(() => {
    if (active && optionRef.current && keyManagerType === 'focus') {
      optionRef.current.focus();
    }
  }, [selected, active, optionRef.current]);

  return (
    <div
      className={cx(classes.root, className, size, {
        [classes.selected]: selected,
        [classes.disabled]: _disabled,
        [classes.active]: active,
        [classes.multiple]: multiple
      })}
      onClick={handleClick}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handleClick()}
      tabIndex={-1}
      ref={optionRef}
      {...others}
    >
      {multiple && (
        <Checkbox
          className={cx(classes.checkboxMultiple)}
          checked={selected}
          disabled={disabled}
          aria-hidden="true"
        />
      )}
      {label}
    </div>
  );
};

OptionComponent.displayName = '@nebular-react/core/Option';

export { OptionComponent };
