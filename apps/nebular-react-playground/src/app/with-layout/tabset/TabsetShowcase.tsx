import { NbCard, NbCardBody, NbTab, NbTabSet } from '@nebular-react';
import './tabset.scoped.scss';

export function TabsetShowcase() {
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
          <NbTab tabTitle="Transactions" disabled>
            <p>
              List of <strong>transactions</strong>
            </p>
          </NbTab>
        </NbTabSet>
      </NbCardBody>
    </NbCard>
  );
}
