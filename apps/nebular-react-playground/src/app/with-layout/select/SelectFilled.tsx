import React from 'react';
import { NbCard, NbCardBody, NbOption, NbSelect } from '@nebular-react';

const SelectFilled: React.FC = () => {
  return (
    <NbCard size="medium">
      <NbCardBody className="example-items-col">
        <NbSelect placeholder="Primary" status="primary" appearance="filled">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Info" status="info" appearance="filled">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Danger" status="danger" appearance="filled">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Success" status="success" appearance="filled">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Warning" status="warning" appearance="filled">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>
      </NbCardBody>
    </NbCard>
  );
};

export { SelectFilled };
