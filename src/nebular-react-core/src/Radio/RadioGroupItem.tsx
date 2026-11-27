import React, { forwardRef, useContext } from 'react';
import { useId } from '@nebular-react/hooks';
import { RadioGroupContext } from './RadioGroup.context';
import useStyles from './Radio.style';

export interface RadioGroupItemProps {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>((props, ref) => {
  const { value, label, disabled, required, id } = props;
  const { selectedValue, groupDisabled, status, onChange, name } = useContext(RadioGroupContext);
  const { classes, cx } = useStyles({ status }, { name: 'radio' });
  const uuid = useId(id);

  return (
    <div className={cx(classes.root)}>
      <label>
        <input
          ref={ref}
          type="radio"
          id={uuid}
          name={name}
          className={cx(classes.nativeInput, 'visually-hidden')}
          value={value}
          checked={value === selectedValue}
          disabled={groupDisabled || disabled}
          required={required}
          onChange={onChange}
        />
        <span className={cx(classes.circle, classes.outerCircle)} />
        <span className={cx(classes.circle, classes.innerCircle)} />
        <span className={cx(classes.text)}>{label ?? value}</span>
      </label>
    </div>
  );
});

RadioGroupItem.displayName = 'RadioGroupItem';
