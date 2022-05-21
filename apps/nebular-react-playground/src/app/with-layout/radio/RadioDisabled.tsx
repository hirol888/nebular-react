/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  NbButton,
  NbCard,
  NbCardBody,
  NbCardFooter,
  NbCardHeader,
  NbRadio,
  NbRadioGroup,
  NbRadioGroupRef
} from '@nebular-react';
import { useRef, useState } from 'react';

export function RadioDisabled() {
  const options = [
    { value: 'This is value 1', label: 'Option 1' },
    { value: 'This is value 2', label: 'Option 2' },
    { value: 'This is value 3', label: 'Option 3' },
    { value: 'This is value 4', label: 'Option 4' },
    { value: 'This is value 5', label: 'Option 5' }
  ];

  const radioGroupRef = useRef<NbRadioGroupRef>(null);

  const disable = () => {
    radioGroupRef.current?.disable();
  };

  const enable = () => {
    radioGroupRef.current?.enable();
  };

  const [selectedValue, setSelectedValue] = useState<any>();

  const handleValueChange = (value: any) => {
    setSelectedValue(value);
  };

  return (
    <NbCard>
      <NbCardHeader>Selected Option: {selectedValue}</NbCardHeader>
      <NbCardBody>
        <NbRadioGroup disabled name="disabled" ref={radioGroupRef} onSelectChange={handleValueChange}>
          {options.map((op, index) => {
            return (
              <NbRadio key={`radio-${index}`} id={`radio-${index}`} value={op.value}>
                {op.label}
              </NbRadio>
            );
          })}
        </NbRadioGroup>
      </NbCardBody>
      <NbCardFooter className="example-items-rows">
        <NbButton status="primary" onClick={enable}>
          Enable
        </NbButton>
        <NbButton status="warning" onClick={disable}>
          Disable
        </NbButton>
      </NbCardFooter>
    </NbCard>
  );
}
