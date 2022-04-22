import React, { useRef } from 'react';
import { CheckboxRef, NbCard, NbCardBody, NbCheckbox } from '@nebular-react';

const CheckboxIndeterminate: React.FC = () => {
  const ref = useRef<CheckboxRef>(null);

  return (
    <NbCard>
      <NbCardBody>
        <NbCheckbox indeterminate={true} ref={ref}>
          Indeterminate
        </NbCheckbox>
        <button onClick={() => ref.current?.setIndeterminate(true)}>
          Set indeterminate
        </button>
      </NbCardBody>
    </NbCard>
  );
};

export { CheckboxIndeterminate };
