import { NbCard, NbCardBody, NbProgressBar } from '@nebular-react';
import './progress-bar-size.scoped.scss';

export function ProgressBarSize() {
  return (
    <NbCard>
      <NbCardBody>
        <NbProgressBar value={20} size="tiny">
          tiny
        </NbProgressBar>
        <NbProgressBar value={40} size="small">
          small
        </NbProgressBar>
        <NbProgressBar value={60} size="medium">
          medium
        </NbProgressBar>
        <NbProgressBar value={80} size="large">
          large
        </NbProgressBar>
        <NbProgressBar value={100} size="giant">
          giant
        </NbProgressBar>
      </NbCardBody>
    </NbCard>
  );
}
