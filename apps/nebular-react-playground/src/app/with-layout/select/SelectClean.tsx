import React from 'react';
import { NbCard, NbCardBody, NbOption, NbSelect } from '@nebular-react';

const SelectClean: React.FC = () => {
  return (
    <NbCard size="small">
      <NbCardBody>
        <NbSelect placeholder="Cleanable">
          <NbOption title="Clean with option without value" />
          <NbOption title="null" value={null} />
          <NbOption title="undefined" value={undefined} />
          <NbOption title="Option 0" value={0} />
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
          <NbOption title="Option 5" value={5} />
          <NbOption title="Option 6" value={6} />
        </NbSelect>
      </NbCardBody>
    </NbCard>
  );
};

export { SelectClean };
