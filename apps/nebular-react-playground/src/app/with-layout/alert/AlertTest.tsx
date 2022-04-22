import React, { useState } from 'react';
import { NbAlert, NbComponentOrCustomStatus, NbComponentSize, NbComponentStatus } from '@nebular-react';
import * as _ from 'lodash';

const AlertTest: React.FC = () => {
  const sizes: NbComponentSize[] = ['tiny', 'small', 'medium', 'large', 'giant'];
  const statuses: NbComponentOrCustomStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];
  const accents: NbComponentStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];

  const alerts: { size: NbComponentSize; status: NbComponentOrCustomStatus }[] = [];
  const accentAlerts: {
    status: NbComponentOrCustomStatus;
    accent: NbComponentStatus;
  }[] = [];

  statuses.forEach((status) => {
    sizes.forEach((size) => {
      alerts.push({ size, status });
    });
  });

  statuses.forEach((status) => {
    accents.forEach((accent) => {
      accentAlerts.push({
        status,
        accent
      });
    });
  });

  const [alertsArray, setAlertsArray] =
    useState<{ size: NbComponentSize; status: NbComponentOrCustomStatus }[]>(alerts);

  const onClose = (alert: { size: NbComponentSize; status: NbComponentOrCustomStatus }) => {
    const index = alertsArray.indexOf(alert);
    if (index >= 0) {
      alertsArray.splice(index, 1);
    }

    setAlertsArray([...alertsArray]);
  };

  return (
    <>
      {alertsArray.map((alert) => {
        return (
          <NbAlert
            key={_.uniqueId('alert-')}
            size={alert.size}
            status={alert.status}
            closable
            onClose={() => onClose(alert)}
          >
            Success message!
          </NbAlert>
        );
      })}
      {accentAlerts.map((alert) => {
        return (
          <NbAlert key={_.uniqueId('accent-alert-')} size="small" status={alert.status} accent={alert.accent}>
            Success message!
          </NbAlert>
        );
      })}
    </>
  );
};

export { AlertTest };
