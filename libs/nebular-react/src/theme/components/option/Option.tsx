import classNames from 'classnames';
import React, { useContext, useImperativeHandle, useRef, useState } from 'react';
import * as _ from 'lodash';
import { OptionGroupContext } from './OptionGroup';
import { CheckboxRef, NbCheckbox } from '../checkbox';
import { ENTER, FocusableOption, Highlightable, SPACE } from 'libs/nebular-react/src/core/cdk';
import './option.scoped.scss';
import { OptionListContext } from './OptionList.context';

export interface NbOptionRef extends FocusableOption, Highlightable {
  getValue(): any;
  id: string;
  selected: boolean;
}

export interface NbOptionProps {
  /**
   * Option value that will be fired on selection.
   * */
  value?: any;
  text?: string;
  disabled?: boolean;
  selected?: boolean;
}

const NbOption = React.forwardRef<NbOptionRef, NbOptionProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ value, title, disabled = false, selected = false, className, ...otherProps }, ref) => {
    const { disabled: disabledByGroup } = useContext(OptionGroupContext);
    const { multiple, handleOptionChange } = useContext(OptionListContext);
    const [active, setActive] = useState<boolean>(false);
    const disabledValue = disabled || disabledByGroup;
    const [optionId] = useState<string>(_.uniqueId('nb-option-id-'));

    const checkboxRef = useRef<CheckboxRef>(null);
    const optionRef = useRef<HTMLDivElement>(null);

    const handleOptionSelect = () => {
      if (!disabledValue) {
        const _selected = !selected;

        // use outside callback to change selected prop
        if (handleOptionChange) {
          handleOptionChange(_selected, optionId, value);
          if (multiple && checkboxRef.current) {
            checkboxRef.current.setChecked(_selected);
          }
        }
      }
    };

    useImperativeHandle(ref, () => ({
      getLabel: () => title ?? '',
      getValue: () => value,
      isDisabled: () => disabledValue,
      selected: selected,
      focus: () => {
        optionRef.current?.focus();
      },
      id: optionId,
      setActiveStyles: () => setActive(true),
      setInactiveStyles: () => setActive(false)
    }));

    return (
      <div
        ref={optionRef}
        className={classNames('nb-option', 'nb-transition', className, {
          selected: selected,
          multiple: multiple,
          disabled: disabledValue,
          active: active
        })}
        id={optionId}
        tabIndex={-1}
        onClick={handleOptionSelect}
        onKeyDown={(e) => (e.keyCode === ENTER || e.keyCode === SPACE) && handleOptionSelect()}
        {...otherProps}
      >
        {multiple && (
          <NbCheckbox ref={checkboxRef} checked={selected} disabled={disabledValue} aria-hidden="true"></NbCheckbox>
        )}
        {title}
      </div>
    );
  }
);

export { NbOption };
