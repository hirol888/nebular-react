import React, { useState } from 'react';
import { ComponentOrCustomStatus } from '@nebular-react/styles';
import { Button } from '../Button';
import { ControlStatusExample, ExampleItemsRows } from '../Shared';
import { Card } from '../Card';
import { Radio } from './Radio';

export default { title: 'Radio' };

export function Showcase() {
  const [selectedValue, setSelectedValue] = useState<string>('orange');

  return (
    <Card>
      <Card.Header>Selected: {selectedValue}</Card.Header>
      <Card.Body>
        <Radio.Group value={selectedValue} onChange={(value: string) => setSelectedValue(value)}>
          <Radio label="Apple" value="apple" name="fruit" />
          <Radio label="Orange" value="orange" name="fruit" />
          <Radio label="Peach" value="peach" name="fruit" />
        </Radio.Group>
      </Card.Body>
    </Card>
  );
}

export function Disabled() {
  const [selectedValue, setSelectedValue] = useState<string>('orange');
  const [disabled, setDisabled] = useState<boolean>(false);

  return (
    <Card>
      <Card.Header>Selected: {selectedValue}</Card.Header>
      <Card.Body>
        <Radio.Group
          value={selectedValue}
          disabled={disabled}
          onChange={(value: string) => setSelectedValue(value)}
        >
          <Radio label="Apple" value="apple" name="fruit" />
          <Radio label="Orange" value="orange" name="fruit" />
          <Radio label="Peach" value="peach" name="fruit" />
        </Radio.Group>
      </Card.Body>
      <Card.Footer>
        <ExampleItemsRows>
          <Button status="primary" onClick={() => setDisabled(false)}>
            Enable
          </Button>
          <Button status="warning" onClick={() => setDisabled(true)}>
            Disable
          </Button>
        </ExampleItemsRows>
      </Card.Footer>
    </Card>
  );
}

export function Status() {
  const statuses: ComponentOrCustomStatus[] = [
    'basic',
    'primary',
    'success',
    'warning',
    'danger',
    'info',
    'control'
  ];

  return (
    <Card>
      <Card.Body>
        <ExampleItemsRows>
          {statuses.map((status, index) =>
            status === 'control' ? (
              <ControlStatusExample>
                <Radio.Group key={`radio-group-${index}`} status={status}>
                  <Radio label="Apple" value="apple" name={`fruit-${index}`} />
                  <Radio label="Orange" value="orange" name={`fruit-${index}`} />
                  <Radio label="Peach" value="peach" name={`fruit-${index}`} />
                </Radio.Group>
              </ControlStatusExample>
            ) : (
              <Radio.Group key={`radio-group-${index}`} status={status}>
                <Radio label="Apple" value="apple" name={`fruit-${index}`} />
                <Radio label="Orange" value="orange" name={`fruit-${index}`} />
                <Radio label="Peach" value="peach" name={`fruit-${index}`} />
              </Radio.Group>
            )
          )}
        </ExampleItemsRows>
      </Card.Body>
    </Card>
  );
}
