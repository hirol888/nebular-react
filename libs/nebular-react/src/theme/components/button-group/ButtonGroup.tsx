import React, { Children, isValidElement, useEffect, useState } from 'react';
import { NbButton, NbLinkButton } from '../button';
import { NbButtonToggle, NbButtonToggleRef } from './ButtonToggle';
import * as _ from 'lodash';
import { NbComponentOrCustomStatus, NbComponentShape, NbComponentSize } from '../component';
import { NbButtonAppearance } from '../button/Button';
import classNames from 'classnames';
import { ButtonGroupContext } from './ButtonGroup.context';

export type NbButtonToggleAppearance = Exclude<NbButtonAppearance, 'hero'>;

export type NbButtonGroupProps = {
  size?: NbComponentSize;
  status?: NbComponentOrCustomStatus;
  notPressedStatus?: NbComponentOrCustomStatus;
  shape?: NbComponentShape;
  appearance?: NbButtonToggleAppearance;
  disabled?: boolean;
  multiple?: boolean;
  onPressedChange?: (value: any[]) => void;
};

const NbButtonGroup: React.FC<NbButtonGroupProps & React.HTMLAttributes<HTMLDivElement>> = ({
  size = 'medium',
  status = 'basic',
  notPressedStatus = 'basic',
  shape = 'rectangle',
  appearance = 'filled',
  disabled = false,
  multiple = false,
  onPressedChange,
  className,
  children,
  ...otherProps
}) => {
  const buttonRefs: { id: string; ref: React.RefObject<NbButtonToggleRef> }[] = [];

  const [disabledValue, setDisabledValue] = useState<boolean>(disabled);

  useEffect(() => {
    setDisabledValue(disabled);
  }, [disabled]);

  const handlePressedChange = (event: { id: string; pressed: boolean; value?: any }) => {
    if (!multiple) {
      if (event.pressed) {
        buttonRefs.forEach((b) => {
          if (b.id !== event.id) {
            b.ref.current && b.ref.current.updatePressed(false);
          }
        });
        setPressedValues([event.value]);
        onPressedChange && onPressedChange([event.value]);
      } else {
        setPressedValues([]);
        onPressedChange && onPressedChange([]);
      }
    } else {
      if (event.pressed) {
        const newPressedValues = [...pressedValues, event.value];
        setPressedValues(newPressedValues);
        onPressedChange && onPressedChange(newPressedValues);
      } else {
        const newPressedValues = pressedValues.filter((v) => !_.isEqual(v, event.value));
        setPressedValues(newPressedValues);
        onPressedChange && onPressedChange(newPressedValues);
      }
    }
  };

  let _pressedValues: any[] = [];

  const buttonToggles = Children.map(children, (c) => {
    if (isValidElement(c) && c.type === NbButtonToggle) {
      const ref = React.createRef<NbButtonToggleRef>();
      buttonRefs.push({ id: c.props.id, ref });
      // setup initial pressed values
      if (!multiple && c.props.pressed) {
        _pressedValues = [c.props.value];
      }
      if (multiple && c.props.pressed) {
        _pressedValues = [..._pressedValues, c.props.value];
      }
      return React.cloneElement(c, {
        ...c.props,
        appearance,
        size,
        status,
        notPressedStatus,
        shape,
        ref
      });
    }
    return null;
  });

  const [pressedValues, setPressedValues] = useState<any[]>(_pressedValues);

  const buttons = Children.toArray(children).filter((c) => {
    return isValidElement(c) && (c.type === NbButton || c.type === NbLinkButton);
  });

  return (
    <ButtonGroupContext.Provider value={{ disabled: disabledValue, handlePressedChange }}>
      <div className={classNames('nb-button-group', className)} role="group" {...otherProps}>
        {buttonToggles}
        {buttons}
      </div>
    </ButtonGroupContext.Provider>
  );
};

export { NbButtonGroup };
