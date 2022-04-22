import React from 'react';
import { NbCard, NbCardBody, NbOption, NbSelect } from '@nebular-react';

const SelectShowcase: React.FC = () => {
  return (
    <NbCard size="small">
      <NbCardBody>
        <NbSelect placeholder="Select Showcase">
          <NbOption title="Option empty" value={undefined} />
          <NbOption title="Option 0" value={0} />
          <NbOption title="Option 1" value={1} selected />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>
      </NbCardBody>
    </NbCard>
  );
};

export { SelectShowcase };
