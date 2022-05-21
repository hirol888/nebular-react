import classNames from 'classnames';
import React, { useContext, useEffect, useImperativeHandle, useState } from 'react';
import { NbRadioProps, NbRadioRef, RadioContext } from './model';
import './radio.scoped.scss';

const NbRadio = React.forwardRef<NbRadioRef, NbRadioProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ id, checked = false, disabled = false, value, className, children, ...otherProps }, ref) => {
    const [checkedValue, setCheckedValue] = useState<boolean>(checked);
    const [disabledValue, setDisabledValue] = useState<boolean>(disabled);

    const { name, groupDisabled, status, selectedRadio, onRadioChange } = useContext(RadioContext);

    useEffect(() => {
      if (checked) {
        onRadioChange && onRadioChange(id, value);
      }
    }, [checked]);

    useEffect(() => {
      setDisabledValue(disabled);
    }, [disabled]);

    useEffect(() => {
      if (selectedRadio?.id === id) {
        setCheckedValue(true);
      } else {
        setCheckedValue(false);
      }
    }, [selectedRadio?.id]);

    useImperativeHandle(ref, () => ({
      setChecked: (checked: boolean) => {
        setCheckedValue(checked);
      }
    }));

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      onRadioChange && onRadioChange(id, value);
    };

    return (
      <div className={classNames('nb-radio', `status-${status}`, className)} {...otherProps}>
        <label>
          <input
            type="radio"
            className="native-input visually-hidden"
            name={name}
            checked={checkedValue}
            disabled={groupDisabled || disabledValue}
            onChange={(event) => onChange(event)}
            onClick={(event) => event.stopPropagation()}
          />
          <span className="outer-circle"></span>
          <span className="inner-circle"></span>
          <span className="text">{children}</span>
        </label>
      </div>
    );
  }
);

export { NbRadio };
