import React from 'react';
import { ControlStatusExample } from '../Shared';
import { Alert } from './Alert';

export default { title: 'Alert' };

export function Showcase() {
  return (
    <Alert status="success" closable>
      You have been successfully authenticated!
    </Alert>
  );
}

export function Accent() {
  return (
    <>
      <Alert accent="basic">Basic. You have been successfully authenticated!</Alert>
      <Alert accent="primary">Primary. You have been successfully authenticated!</Alert>
      <Alert accent="success">Success. You have been successfully authenticated!</Alert>
      <Alert accent="info">Info. You have been successfully authenticated!</Alert>
      <Alert accent="warning">Warning. You have been successfully authenticated!</Alert>
      <Alert accent="danger">Danger. You have been successfully authenticated!</Alert>
      <ControlStatusExample>
        <Alert accent="control">Control. You have been successfully authenticated!</Alert>
      </ControlStatusExample>
    </>
  );
}
