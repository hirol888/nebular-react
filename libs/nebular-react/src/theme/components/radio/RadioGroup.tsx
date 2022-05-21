import React, { useEffect, useImperativeHandle, useState } from 'react';
import { NbComponentOrCustomStatus } from '../component';
import { NbRadioGroupProps, NbRadioGroupRef, RadioContext } from './model';
import classNames from 'classnames';

const NbRadioGroup = React.forwardRef<NbRadioGroupRef, NbRadioGroupProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ name, disabled = false, status = 'basic', onSelectChange, className, children, ...otherProps }, ref) => {
    const [disabledValue, setDisabledValue] = useState<boolean>(disabled);
    const [statusValue, setStatusValue] = useState<NbComponentOrCustomStatus>(status);
    const [selectedRadio, setSelectedRadio] = useState<{ id: string; value: any }>();

    useEffect(() => {
      setDisabledValue(disabled);
    }, [disabled]);

    useEffect(() => {
      setStatusValue(status);
    }, [status]);

    useImperativeHandle(ref, () => ({
      disable: () => setDisabledValue(true),
      enable: () => setDisabledValue(false)
    }));

    const onRadioChange = (id: string, value: any) => {
      setSelectedRadio({ id, value });
      onSelectChange && onSelectChange(value);
    };

    return (
      <RadioContext.Provider
        value={{ name, groupDisabled: disabledValue, status: statusValue, selectedRadio, onRadioChange }}
      >
        <div className={classNames('nb-radio-group', className)} {...otherProps}>
          {children}
        </div>
      </RadioContext.Provider>
    );
  }
);

export { NbRadioGroup };
