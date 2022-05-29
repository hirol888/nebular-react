import { NbCard, NbCardBody, NbTab, NbTabSet } from '@nebular-react';
import './tabset.scoped.scss';

export function TabsetBadge() {
  return (
    <NbCard>
      <NbCardBody>
        <NbTabSet>
          <NbTab tabTitle="Users" badgeText="99+" badgeStatus="danger">
            <p>
              List of <strong>users</strong>
            </p>
          </NbTab>
          <NbTab tabTitle="Orders" badgeText="12" badgePosition="bottom right" badgeStatus="warning">
            <p>
              List of <strong>orders</strong>
            </p>
          </NbTab>
          <NbTab tabTitle="Transactions" badgeText="new" badgePosition="top right" badgeStatus="success">
            <p>
              List of <strong>transactions</strong>
            </p>
          </NbTab>
          <NbTab tabTitle="Notifications" badgeDot badgePosition="center start" badgeStatus="danger">
            <p>
              List of <strong>notifications</strong>
            </p>
          </NbTab>
        </NbTabSet>
      </NbCardBody>
    </NbCard>
  );
}
