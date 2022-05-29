import { NbCard, NbCardBody, NbTab, NbTabSet, NbTabTitle } from '@nebular-react';
import './tabset.scoped.scss';

export function TabsetTitle() {
  return (
    <NbCard>
      <NbCardBody>
        <NbTabSet>
          <NbTab>
            <NbTabTitle>
              <span>Orders</span>
            </NbTabTitle>
            <p>
              List of <strong>orders</strong>
            </p>
          </NbTab>
          <NbTab>
            <NbTabTitle>
              <span>Transactions</span>
            </NbTabTitle>
            <p>
              List of <strong>transactions</strong>
            </p>
          </NbTab>
        </NbTabSet>
      </NbCardBody>
    </NbCard>
  );
}
