import React from 'react';
import { NbCheckbox } from '@nebular-react';

const CheckboxTest: React.FC = () => {
  return (
    <>
      <div>
        <NbCheckbox id="first"></NbCheckbox>
      </div>
      <div>
        <NbCheckbox id="second" checked={true}>
          Checked
        </NbCheckbox>
      </div>
      <div>
        <NbCheckbox id="disabled" disabled={true}>
          Disabled
        </NbCheckbox>
      </div>
      <div>
        <NbCheckbox checked={true} disabled={true}>
          Disabled, checked
        </NbCheckbox>
      </div>
      <div>
        <NbCheckbox id="success" status="success">
          Success
        </NbCheckbox>
      </div>
      <div>
        <NbCheckbox id="warning" status="warning">
          Warning
        </NbCheckbox>
      </div>
      <div>
        <NbCheckbox id="danger" status="danger">
          Danger
        </NbCheckbox>
      </div>
    </>
  );
};

export { CheckboxTest };
