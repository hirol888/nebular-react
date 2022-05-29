import { NbCard, NbCardBody, NbRouteTab, NbRouteTabset } from '@nebular-react';
import { Route } from 'react-router-dom';
import {
  RouteTabsetShowcaseChild1,
  RouteTabsetShowcaseChild2,
  RouteTabsetShowcaseChild3,
  RouteTabsetShowcaseChild4
} from './components/RouteTabsetChildren';

export function RouteTabsetShowcase() {
  const tabs: NbRouteTab[] = [
    {
      tabTitle: 'Users',
      tabIcon: 'person',
      route: <Route path="tab1" element={<RouteTabsetShowcaseChild1 />}></Route>,
      link: {
        to: 'tab1'
      }
    },
    {
      tabTitle: 'Orders',
      tabIcon: 'paper-plane-outline',
      responsive: true,
      route: <Route path="tab2" element={<RouteTabsetShowcaseChild2 />}></Route>,
      link: {
        to: 'tab2'
      }
    },
    {
      tabTitle: 'Query params',
      tabIcon: 'flash-outline',
      responsive: true,
      route: <Route path="tab3" element={<RouteTabsetShowcaseChild3 />}></Route>,
      link: {
        to: 'tab3?param1=123456&param2=test'
      }
    },
    {
      tabTitle: 'Transaction',
      tabIcon: 'flash-outline',
      disabled: true,
      responsive: true,
      route: <Route path="tab4" element={<RouteTabsetShowcaseChild4 />}></Route>,
      link: {
        to: 'tab4'
      }
    }
  ];

  return (
    <NbCard>
      <NbCardBody>
        <NbRouteTabset fullWidth tabs={tabs}></NbRouteTabset>
      </NbCardBody>
    </NbCard>
  );
}
