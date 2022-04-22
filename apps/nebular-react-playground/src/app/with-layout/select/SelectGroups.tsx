import React from 'react';
import { NbCard, NbCardBody, NbOption, NbOptionGroup, NbSelect } from '@nebular-react';

const SelectGroups: React.FC = () => {
  return (
    <NbCard size="medium">
      <NbCardBody>
        <NbSelect placeholder="Select Groups">
          <NbOptionGroup title="Group 1">
            <NbOption title="Option 1" value={1} />
            <NbOption title="Option 2" value={2} />
            <NbOption title="Option 3" value={3} />
            <NbOption title="Option 4" value={4} />
          </NbOptionGroup>

          <NbOptionGroup title="Group 2">
            <NbOption title="Option 21" value={21} />
            <NbOption title="Option 22" value={22} />
            <NbOption title="Option 23" value={23} />
            <NbOption title="Option 24" value={24} />
          </NbOptionGroup>

          <NbOptionGroup title="Group 3">
            <NbOption title="Option 31" value={31} />
            <NbOption title="Option 32" value={32} />
            <NbOption title="Option 33" value={33} />
            <NbOption title="Option 34" value={34} />
          </NbOptionGroup>
        </NbSelect>
      </NbCardBody>
    </NbCard>
  );
};

export { SelectGroups };
