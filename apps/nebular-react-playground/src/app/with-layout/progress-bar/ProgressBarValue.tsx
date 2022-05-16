import { NbCard, NbCardBody, NbProgressBar } from '@nebular-react';
import './progress-bar-size.scoped.scss';

export function ProgressBarValue() {
  return (
    <NbCard>
      <NbCardBody>
        <NbProgressBar value={40} status="primary" displayValue></NbProgressBar>
        <NbProgressBar value={60} status="primary">
          Custom value
        </NbProgressBar>
      </NbCardBody>
    </NbCard>
  );
}
