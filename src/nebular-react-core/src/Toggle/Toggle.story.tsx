import React, { useState } from 'react';
import { ControlStatusExample, ExampleItemsCol } from '../Shared';
import { Card } from '../Card';
import { Toggle } from './Toggle';

export default { title: 'Toggle' };

export function Showcase() {
  const [checked, setChecked] = useState<boolean>(false);
  return (
    <Card>
      <Card.Body>
        <Toggle checked={checked} onCheckedChange={() => setChecked(!checked)} />
      </Card.Body>
    </Card>
  );
}

export function Disabled() {
  return (
    <Card>
      <Card.Body>
        <ExampleItemsCol>
          <Toggle disabled />
          <Toggle checked disabled />
        </ExampleItemsCol>
      </Card.Body>
    </Card>
  );
}

export function LabelPosition() {
  return (
    <Card>
      <Card.Body>
        <ExampleItemsCol>
          <Toggle labelPosition="start">Label Start</Toggle>
          <Toggle labelPosition="end">Label End</Toggle>
          <Toggle labelPosition="right">Label Right</Toggle>
          <Toggle labelPosition="left">Label Left</Toggle>
          <Toggle disabled>Label Default Disabled</Toggle>
        </ExampleItemsCol>
      </Card.Body>
    </Card>
  );
}

export function Status() {
  const [basicChecked, setBasicChecked] = useState<boolean>(false);
  const [primaryChecked, setPrimaryChecked] = useState<boolean>(false);
  const [successChecked, setSuccessChecked] = useState<boolean>(false);
  const [infoChecked, setInfoChecked] = useState<boolean>(false);
  const [warningChecked, setWarningChecked] = useState<boolean>(false);
  const [dangerChecked, setDangerChecked] = useState<boolean>(false);
  const [controlChecked, setControlChecked] = useState<boolean>(false);
  return (
    <Card>
      <Card.Body>
        <ExampleItemsCol>
          <Toggle
            status="basic"
            checked={basicChecked}
            onCheckedChange={() => setBasicChecked(!basicChecked)}
          >
            Basic
          </Toggle>
          <Toggle
            status="primary"
            checked={primaryChecked}
            onCheckedChange={() => setPrimaryChecked(!primaryChecked)}
          >
            Primary
          </Toggle>
          <Toggle
            status="success"
            checked={successChecked}
            onCheckedChange={() => setSuccessChecked(!successChecked)}
          >
            Success
          </Toggle>
          <Toggle
            status="info"
            checked={infoChecked}
            onCheckedChange={() => setInfoChecked(!infoChecked)}
          >
            Info
          </Toggle>
          <Toggle
            status="warning"
            checked={warningChecked}
            onCheckedChange={() => setWarningChecked(!warningChecked)}
          >
            Warning
          </Toggle>
          <Toggle
            status="danger"
            checked={dangerChecked}
            onCheckedChange={() => setDangerChecked(!dangerChecked)}
          >
            Danger
          </Toggle>
          <ControlStatusExample>
            <Toggle
              status="control"
              checked={controlChecked}
              onCheckedChange={() => setControlChecked(!controlChecked)}
            >
              Control
            </Toggle>
          </ControlStatusExample>
        </ExampleItemsCol>
      </Card.Body>
    </Card>
  );
}
