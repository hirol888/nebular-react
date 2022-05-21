/* eslint-disable @typescript-eslint/no-explicit-any */
import { NbCard, NbCardBody, NbCardHeader, NbRadio, NbRadioGroup } from '@nebular-react';
import { useState } from 'react';

export function RadioShowcase() {
  const options = [
    { value: 'This is value 1', label: 'Option 1' },
    { value: 'This is value 2', label: 'Option 2' },
    { value: 'This is value 3', label: 'Option 3' },
    { value: 'This is value 4', label: 'Option 4' }
  ];

  const [selectedValue, setSelectedValue] = useState<any>();

  const handleValueChange = (value: any) => {
    setSelectedValue(value);
  };

  return (
    <NbCard>
      <NbCardHeader>Selected Option: {selectedValue}</NbCardHeader>
      <NbCardBody>
        <NbRadioGroup onSelectChange={handleValueChange}>
          {options.map((op, index) => {
            return (
              <NbRadio key={`radio-${index}`} id={`radio-${index}`} value={op.value}>
                {op.label}
              </NbRadio>
            );
          })}
        </NbRadioGroup>
      </NbCardBody>
    </NbCard>
  );
}
