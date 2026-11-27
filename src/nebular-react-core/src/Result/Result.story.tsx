import React from 'react';
import { Result } from './Result';

export default { title: 'Result', component: Result };

export function Statuses() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
      <Result status="success" title="Payment completed" subTitle="Your order is confirmed" />
      <Result status="error" title="Payment failed" subTitle="The card was declined" />
      <Result status="info" title="Processing" subTitle="This may take a few minutes" />
      <Result status="warning" title="Check your data" subTitle="Some fields need attention" />
    </div>
  );
}

export function HttpErrors() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
      <Result status="404" title="Not found" subTitle="The page does not exist" />
      <Result status="403" title="Forbidden" subTitle="You do not have access" />
      <Result status="500" title="Server error" subTitle="Something went wrong" />
    </div>
  );
}

export function WithExtra() {
  return (
    <Result
      status="success"
      title="Changes saved"
      subTitle="Your profile was updated successfully"
      extra={
        <>
          <button type="button">Continue</button>
          <button type="button">View profile</button>
        </>
      }
    >
      <p>Updated at 12:00 PM</p>
    </Result>
  );
}
