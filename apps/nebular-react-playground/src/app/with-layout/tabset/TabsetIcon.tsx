import { NbCard, NbCardBody, NbTab, NbTabSet } from '@nebular-react';
import './tabset.scoped.scss';

export function TabsetIcon() {
  return (
    <>
      <NbCard>
        <NbCardBody>
          <NbTabSet>
            <NbTab tabIcon="person-outline">
              <p>
                List of <strong>users</strong>
              </p>
            </NbTab>
            <NbTab tabIcon={{ icon: 'bell-outline', pack: 'eva' }}>
              <p>
                List of <strong>orders</strong>
              </p>
            </NbTab>
            <NbTab tabIcon="email-outline">
              <p>
                List of <strong>transactions</strong>
              </p>
            </NbTab>
          </NbTabSet>
        </NbCardBody>
      </NbCard>
      <NbCard>
        <NbCardBody>
          <NbTabSet fullWidth>
            <NbTab tabIcon="person-outline">
              <p>
                List of <strong>users</strong>
              </p>
            </NbTab>
            <NbTab tabIcon="bell-outline">
              <p>
                List of <strong>orders</strong>
              </p>
            </NbTab>
            <NbTab tabIcon="email-outline">
              <p>
                List of <strong>transactions</strong>
              </p>
            </NbTab>
          </NbTabSet>
        </NbCardBody>
      </NbCard>
      <NbCard>
        <NbCardBody>
          <NbTabSet>
            <NbTab tabTitle="Users" tabIcon="person-outline" responsive>
              <p>
                List of <strong>users</strong>
              </p>
            </NbTab>
            <NbTab tabTitle="Orders" tabIcon="bell-outline" responsive>
              <p>
                List of <strong>orders</strong>
              </p>
            </NbTab>
            <NbTab tabTitle="transactions" tabIcon="email-outline" responsive>
              <p>
                List of <strong>transactions</strong>
              </p>
            </NbTab>
          </NbTabSet>
        </NbCardBody>
      </NbCard>
    </>
  );
}
