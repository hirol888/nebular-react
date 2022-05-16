import { NbCard, NbCardBody, NbProgressBar } from '@nebular-react';
import './progress-bar-status.scoped.scss';

export function ProgressBarStatus() {
  return (
    <NbCard>
      <NbCardBody>
        <NbProgressBar value={20} status="basic">
          basic
        </NbProgressBar>
        <NbProgressBar value={30} status="primary">
          primary
        </NbProgressBar>
        <NbProgressBar value={50} status="info">
          info
        </NbProgressBar>
        <NbProgressBar value={60} status="success">
          success
        </NbProgressBar>
        <NbProgressBar value={70} status="warning">
          warning
        </NbProgressBar>
        <NbProgressBar value={80} status="danger">
          danger
        </NbProgressBar>
        <div className="control-status-example">
          <NbProgressBar value={90} status="control">
            control
          </NbProgressBar>
        </div>
      </NbCardBody>
    </NbCard>
  );
}
