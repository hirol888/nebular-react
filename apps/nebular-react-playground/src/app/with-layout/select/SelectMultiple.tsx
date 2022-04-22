import React from 'react';
import { NbCard, NbCardBody, NbOption, NbSelect } from '@nebular-react';

const SelectMultiple: React.FC = () => {
  return (
    <NbCard size="small">
      <NbCardBody>
        <NbSelect placeholder="Multiple Select" multiple={true}>
          <NbOption title="Option 0" value={0} />
          <NbOption title="Option 1" value={1} selected />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} selected />
          <NbOption title="Option 4" value={4} />
        </NbSelect>
      </NbCardBody>
    </NbCard>
  );
};

export { SelectMultiple };
