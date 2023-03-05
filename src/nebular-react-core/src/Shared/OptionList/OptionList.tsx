import React from 'react';
import {
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { ForwardRefWithStaticComponents } from '@mantine/utils';
import { Position, useId, KeyManagerType } from '@nebular-react/hooks';
import useStyles, { OptionListStylesParams } from './OptionList.style';
import { OptionListContext } from './OptionList.context';
import { OptionComponent } from './Option/OptionComponent';
import { OptionGroupComponent } from './OptionGroup/OptionGroupComponent';
import { OptionGroup, OptionInternal } from './types';

export type OptionListStylesNames = Selectors<typeof useStyles>;

export interface OptionListProps
  extends DefaultProps<OptionListStylesNames, OptionListStylesParams> {
  data: (OptionInternal | OptionGroup)[];
  size?: ComponentSize;
  multiple?: boolean;
  position?: Position;
  keyManagerType?: KeyManagerType;
  onOptionSelected?: (option: { label?: string; value?: string; selected?: boolean }) => void;
}

type OptionListComponent = ForwardRefWithStaticComponents<
  OptionListProps,
  { OptionGroup: typeof OptionGroupComponent; Option: typeof OptionComponent }
>;

const defaultProps: Partial<OptionListProps> = {
  data: [],
  size: 'medium',
  multiple: false,
  keyManagerType: 'focus'
};

const OptionList: OptionListComponent = (props) => {
  const {
    className,
    size,
    multiple,
    position,
    onOptionSelected,
    keyManagerType,
    classNames,
    styles,
    unstyled,
    data,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { position, itemsCount: data.length },
    {
      name: 'option-list',
      unstyled,
      classNames,
      styles
    }
  );

  const uuid = useId();

  return (
    <OptionListContext.Provider value={{ multiple, size, onOptionSelected, keyManagerType }}>
      <div className={cx(classes.root, className, size)} {...others}>
        <ul className={cx(classes.optionList)} role="listbox">
          {data.map((item, index) => {
            if (item.type === 'option') {
              return (
                <OptionList.Option
                  label={item.label}
                  value={item.value}
                  disabled={item.disabled}
                  selected={item.selected}
                  key={`${uuid}-option-${index}`}
                  active={item.active}
                  role="option"
                />
              );
            }
            if (item.type === 'group') {
              return (
                <OptionList.OptionGroup
                  options={item.options}
                  disabled={item.disabled}
                  label={item.label}
                  key={`${uuid}-group-${index}`}
                  role="group"
                />
              );
            }
            return null;
          })}
        </ul>
      </div>
    </OptionListContext.Provider>
  );
};

OptionList.displayName = '@nebular-react/core/OptionList';
OptionList.OptionGroup = OptionGroupComponent;
OptionList.Option = OptionComponent;

export { OptionList };
