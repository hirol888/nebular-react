import React from 'react';
import { NbCard, NbCardBody, NbOption, NbSelect } from '@nebular-react';

const SelectStatuses: React.FC = () => {
  return (
    <NbCard size="medium">
      <NbCardBody className="example-items-col">
        <NbSelect placeholder="Basic" status="basic">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Primary" status="primary">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Info" status="info">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Danger" status="danger">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Success" status="success">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <NbSelect placeholder="Warning" status="warning">
          <NbOption title="Option 1" value={1} />
          <NbOption title="Option 2" value={2} />
          <NbOption title="Option 3" value={3} />
          <NbOption title="Option 4" value={4} />
        </NbSelect>

        <div className="control-status-example">
          <NbSelect placeholder="Control" status="control">
            <NbOption title="Option 1" value={1} />
            <NbOption title="Option 2" value={2} />
            <NbOption title="Option 3" value={3} />
            <NbOption title="Option 4" value={4} />
          </NbSelect>
        </div>
      </NbCardBody>
    </NbCard>
  );
};

export { SelectStatuses };
