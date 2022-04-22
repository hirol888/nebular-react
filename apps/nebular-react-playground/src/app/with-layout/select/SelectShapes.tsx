import React from 'react';
import { NbCard, NbCardBody, NbOption, NbSelect } from '@nebular-react';

const SelectShapes: React.FC = () => {
  return (
    <NbCard size="medium">
      <NbCardBody className="example-items-col">
        <NbSelect placeholder="Round" shape="round">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Rectangle" shape="rectangle">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Semi-round" shape="semi-round">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>
      </NbCardBody>
    </NbCard>
  );
};

export { SelectShapes };
