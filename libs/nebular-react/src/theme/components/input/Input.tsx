import { NbComponentSize, NbComponentOrCustomStatus } from '@nebular-react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { NbComponentShape } from '../component';

export interface NbInputProps {
  fieldSize?: NbComponentSize;
  status?: NbComponentOrCustomStatus;
  shape?: NbComponentShape;
  fullWidth?: boolean;
  disabled?: boolean;
}

const NbInput = React.forwardRef<HTMLInputElement, NbInputProps & React.InputHTMLAttributes<HTMLInputElement>>(
  (
    {
      fieldSize = 'medium',
      status = 'basic',
      shape = 'rectangle',
      fullWidth = false,
      disabled = false,
      className,
      ...otherProps
    },
    ref
  ) => {
    const [sizeValue, setSizeValue] = useState<NbComponentSize>(fieldSize);
    const [statusValue, setStatusValue] = useState<NbComponentOrCustomStatus>(status);
    const [disabledValue, setDisabledValue] = useState<boolean>(disabled);
    const [fullWidthValue, setFullWidthValue] = useState<boolean>(fullWidth);

    useEffect(() => {
      setSizeValue(fieldSize);
    }, [fieldSize]);

    useEffect(() => {
      setStatusValue(status);
    }, [status]);

    useEffect(() => {
      setDisabledValue(disabled);
    }, [disabled]);

    useEffect(() => {
      setFullWidthValue(fullWidth);
    }, [fullWidth]);

    return (
      <input
        className={classNames(
          'nb-input',
          `status-${statusValue}`,
          `shape-${shape}`,
          `size-${sizeValue}`,
          'nb-transition',
          className,
          {
            'input-full-width': fullWidthValue
          }
        )}
        disabled={disabledValue}
        ref={ref}
        {...otherProps}
      />
    );
  }
);

export { NbInput };
