import React, { useId } from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import useStyles, { OptionGroupStylesParams } from './OptionGroupComponent.style';
import { useOptionListContext } from '../OptionList.context';
import { OptionGroupComponentContext } from './OptionGroupComponent.context';
import { OptionComponent } from '../Option/OptionComponent';
import { OptionGroup, OptionInternal } from '../types';

export type OptionGroupStylesNames = Selectors<typeof useStyles>;

export interface OptionGroupComponentProps
  extends
    Omit<OptionGroup, 'type'>,
    React.ComponentPropsWithoutRef<'div'>,
    DefaultProps<OptionGroupStylesNames, OptionGroupStylesParams> {
  getOptionProps?: (
    option: OptionInternal
  ) => Pick<React.ComponentPropsWithoutRef<'div'>, 'id' | 'aria-label' | 'children'>;
  renderOption?: (option: OptionInternal) => React.ReactNode;
}

const defaultProps: Partial<OptionGroupComponentProps> = {
  disabled: false,
  options: []
};

const OptionGroupComponent: React.FC<OptionGroupComponentProps> = (props) => {
  const {
    className,
    label,
    disabled,
    classNames,
    styles,
    unstyled,
    options,
    getOptionProps,
    renderOption,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { size } = useOptionListContext();
  const { classes, cx } = useStyles(
    { size },
    { name: 'option-group', unstyled, classNames, styles }
  );

  const uuid = useId();

  return (
    <OptionGroupComponentContext.Provider value={{ disabled }}>
      <div
        className={cx(classes.root, className, {
          [classes.disabled]: disabled
        })}
        {...others}
      >
        <span className={cx(classes.groupTitle)}>{label}</span>
        {options.map((item, index) => (
          <OptionComponent
            {...getOptionProps?.(item)}
            {...(renderOption
              ? { children: renderOption(item), 'aria-label': item.label ?? item.value }
              : undefined)}
            label={item.label}
            value={item.value}
            disabled={item.disabled}
            selected={item.selected}
            key={`${uuid}-group-option-${index}`}
            active={item.active}
            role="option"
          />
        ))}
      </div>
    </OptionGroupComponentContext.Provider>
  );
};

OptionGroupComponent.displayName = 'OptionGroup';

export { OptionGroupComponent };
