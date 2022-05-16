import { NbAction, NbActions, NbCard, NbCardBody, NbComponentOrCustomStatus, NbProgressBar } from '@nebular-react';
import { useEffect, useState } from 'react';
import './progress-bar-interactive.scoped.scss';

export function ProgressBarInteractive() {
  const [value, setValue] = useState<number>(25);
  const getStatus = (): NbComponentOrCustomStatus => {
    if (value <= 25) {
      return 'danger';
    } else if (value <= 50) {
      return 'warning';
    } else if (value <= 75) {
      return 'info';
    } else {
      return 'success';
    }
  };
  const [status, setStatus] = useState<NbComponentOrCustomStatus>(getStatus());

  const setNewValue = (newValue: number) => {
    setValue(Math.min(Math.max(newValue, 0), 100));
  };

  useEffect(() => {
    setStatus(getStatus());
  }, [value]);

  return (
    <NbCard>
      <NbCardBody>
        <div className="container">
          <NbActions size="medium">
            <NbAction icon="minus-outline" onClick={() => setNewValue(value - 25)}></NbAction>
          </NbActions>
          <NbProgressBar value={value} status={status} displayValue></NbProgressBar>
          <NbActions size="medium">
            <NbAction icon="plus-outline" onClick={() => setNewValue(value + 25)}></NbAction>
          </NbActions>
        </div>
      </NbCardBody>
    </NbCard>
  );
}
