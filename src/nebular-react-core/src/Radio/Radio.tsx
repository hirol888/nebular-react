import React, { forwardRef, useContext } from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { ForwardRefWithStaticComponents } from '@mantine/utils';
import { useId } from '@nebular-react/hooks';
import { RadioGroup } from './RadioGroup';
import { RadioGroupContext } from './RadioGroup.context';
import useStyles, { RadioStylesParams } from './Radio.style';

export type RadioStylesNames = Selectors<typeof useStyles>;

export interface RadioProps
  extends DefaultProps<RadioStylesNames, RadioStylesParams>,
    React.ComponentPropsWithoutRef<'input'> {
  label?: React.ReactNode;
  value: string;
}

type RadioComponent = ForwardRefWithStaticComponents<RadioProps, { Group: typeof RadioGroup }>;

export const Radio: RadioComponent = forwardRef<HTMLInputElement, RadioProps>((props, ref) => {
  const { label, value, id, className, classNames, styles, unstyled, ...others } = props;
  const { selectedValue, groupDisabled, status, onChange } = useContext(RadioGroupContext);
  const { classes, cx } = useStyles({ status }, { name: 'radio', classNames, styles, unstyled });
  const uuid = useId(id);

  return (
    <div className={cx(classes.root, className)}>
      <label>
        <input
          ref={ref}
          type="radio"
          id={uuid}
          className={cx(classes.nativeInput, 'visually-hidden')}
          value={value}
          checked={value === selectedValue}
          disabled={groupDisabled}
          onChange={onChange}
          {...others}
        />
        <span className={cx(classes.circle, classes.outerCircle)} />
        <span className={cx(classes.circle, classes.innerCircle)} />
        <span className={cx(classes.text)}>{label}</span>
      </label>
    </div>
  );
}) as any;

Radio.displayName = '@nebular-react/core/Radio';
Radio.Group = RadioGroup;
