import { NbCard, NbCardBody, NbProgressBar } from '@nebular-react';

export function ProgressBarShowcase() {
  return (
    <NbCard>
      <NbCardBody>
        <NbProgressBar value={40}></NbProgressBar>
      </NbCardBody>
    </NbCard>
  );
}
