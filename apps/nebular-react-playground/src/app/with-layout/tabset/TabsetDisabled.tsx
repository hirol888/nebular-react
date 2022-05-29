import { NbCard, NbCardBody, NbTab, NbTabSet } from '@nebular-react';
import './tabset.scoped.scss';

export function TabsetDisabled() {
  return (
    <NbCard>
      <NbCardBody>
        <NbTabSet>
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
          <NbTab tabTitle="Disabled Tab" disabled></NbTab>
        </NbTabSet>
      </NbCardBody>
    </NbCard>
  );
}
