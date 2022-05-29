import { NbCard, NbCardBody, NbTab, NbTabSet } from '@nebular-react';
import './tabset.scoped.scss';

export function TabsetWidth() {
  return (
    <NbCard>
      <NbCardBody>
        <NbTabSet fullWidth>
          <NbTab tabTitle="Users">
            <p>
              List of <strong>users</strong>
            </p>
          </NbTab>
          <NbTab tabTitle="Orders">
            <p>
              List of <strong>orders</strong>
            </p>
          </NbTab>
        </NbTabSet>
      </NbCardBody>
    </NbCard>
  );
}
