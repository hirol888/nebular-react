import React from 'react';
import { NbCard, NbCardBody, NbOption, NbOptionGroup, NbSelect } from '@nebular-react';

const SelectDisabled: React.FC = () => {
  return (
    <NbCard size="small">
      <NbCardBody className="example-items-col">
        <NbSelect placeholder="Disabled" disabled>
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Disabled option">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} disabled />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} disabled />
        </NbSelect>

        <NbSelect placeholder="Disabled Groups">
          <NbOptionGroup title="Group 1">
            <NbOption title="Option 1" value={1} />
            <NbOption title="Option 2" disabled value={2} />
          </NbOptionGroup>
          <NbOptionGroup title="Disabled group" disabled>
            <NbOption title="Option 21" value={21} />
            <NbOption title="Option 22" value={22} />
          </NbOptionGroup>
        </NbSelect>
      </NbCardBody>
    </NbCard>
  );
};

export { SelectDisabled };
