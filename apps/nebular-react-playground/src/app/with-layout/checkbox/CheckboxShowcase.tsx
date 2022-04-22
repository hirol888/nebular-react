import React, { useState } from 'react';
import { NbCard, NbCardBody, NbCheckbox } from '@nebular-react';

const CheckboxShowcase: React.FC = () => {
  const [checkedValue, setCheckedValue] = useState<boolean>(false);

  const changeHandler = (value: boolean | React.FormEvent<HTMLDivElement>) => {
    if (typeof value === 'boolean') setCheckedValue(value);
  };

  return (
    <NbCard>
      <NbCardBody className="example-items-rows">
        <NbCheckbox onCheck={(value) => changeHandler(value)}>Toggle me</NbCheckbox>
      </NbCardBody>
      <NbCardBody>
        <label>Checked:</label> <span>{checkedValue.toString()}</span>
      </NbCardBody>
    </NbCard>
  );
};

export { CheckboxShowcase };
