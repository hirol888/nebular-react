import React, { useRef, useState } from 'react';
import { NbCard, NbCardBody, NbOption, NbSelect, SelectRef } from '@nebular-react';
import * as _ from 'lodash';

const SelectRefExamples: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<{ id: number; title: string } | undefined | null>(undefined);
  const [disabled, setDisabled] = useState<boolean>(false);

  const ref = useRef<SelectRef>(null);

  const options = [
    { id: 0, title: 'Option 0' },
    { id: 1, title: 'Option 1' },
    { id: 2, title: 'Option 2' },
    { id: 3, title: 'Option 3' },
    { id: 4, title: 'Option 4' }
  ];

  const toggleDisable = (value: boolean) => {
    value ? ref.current?.enable() : ref.current?.disable();
    setDisabled(!value);
  };

  const reset = () => {
    ref.current?.reset();
    setSelectedValue(undefined);
  };

  const getSelectedValue = () => {
    const value = ref.current?.getSelectedValues();
    setSelectedValue(value);
  };

  return (
    <NbCard size="small">
      <NbCardBody>
        <NbSelect placeholder="Custom label" ref={ref}>
          {options.map((o) => {
            return <NbOption key={_.uniqueId('option-')} title={o.title} value={o} />;
          })}
        </NbSelect>
        <p>
          <button onClick={() => reset()}>Reset</button>
          <button onClick={() => toggleDisable(disabled)}>{disabled ? 'Enable' : 'Disable'}</button>
          <button onClick={() => getSelectedValue()}>Get Selected Value</button>
        </p>
        <p>Selected Value: {JSON.stringify(selectedValue)}</p>
      </NbCardBody>
    </NbCard>
  );
};

export { SelectRefExamples };
