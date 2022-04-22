import React, { useState } from 'react';
import { NbCard, NbCardBody, NbOption, NbSelect, NbSelectLabel } from '@nebular-react';

const SelectLabel: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changeHandler = (value: any) => {
    setSelectedValue(value[0]);
  };

  return (
    <NbCard size="small">
      <NbCardBody>
        <NbSelect placeholder="Custom label" onSelectChange={changeHandler}>
          <NbSelectLabel>Selected: {selectedValue}</NbSelectLabel>

          <NbOption title="Option 0" value={0} />
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>
      </NbCardBody>
    </NbCard>
  );
};

export { SelectLabel };
