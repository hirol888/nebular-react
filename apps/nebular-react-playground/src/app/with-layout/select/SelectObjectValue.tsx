import React, { useState } from 'react';
import { NbCard, NbCardBody, NbOption, NbSelect } from '@nebular-react';

const SelectObjectValue: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<{ id: number; title: string } | undefined | null>(undefined);

  const options = [
    { id: 0, title: 'Option 0' },
    { id: 1, title: 'Option 1' },
    { id: 2, title: 'Option 2' },
    { id: 3, title: 'Option 3' },
    { id: 4, title: 'Option 4' }
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changeHandler = (value: any) => {
    setSelectedValue(value);
  };

  return (
    <NbCard size="small">
      <NbCardBody>
        <NbSelect placeholder="Custom label" onSelectChange={changeHandler}>
          {options.map((o) => {
            return <NbOption title={o.title} value={o} />;
          })}
        </NbSelect>
        <p>Selected Value: {JSON.stringify(selectedValue)}</p>
      </NbCardBody>
    </NbCard>
  );
};

export { SelectObjectValue };
