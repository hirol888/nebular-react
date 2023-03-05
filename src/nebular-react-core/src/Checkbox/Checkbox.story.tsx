import React, { useState } from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import { ControlStatusExample, ExampleItemsRows } from '../Shared';
import { Checkbox } from './Checkbox';

export default { title: 'Checkbox' };

interface CheckboxState {
  checked: boolean;
  indeterminate: boolean;
}

export function Showcase() {
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <>
      <Checkbox onCheck={(value) => setChecked(value)} checked={checked}>
        Toggle me
      </Checkbox>
      <Card.Body>
        <label>Checked: </label>
        <span>{checked.toString()}</span>
      </Card.Body>
    </>
  );
}

export function Disabled() {
  return (
    <ExampleItemsRows>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox checked indeterminate disabled>
        Indeterminate disabled
      </Checkbox>
      <Checkbox checked disabled>
        Checked disabled
      </Checkbox>
    </ExampleItemsRows>
  );
}

export function Indeterminate() {
  const [checkboxState, setCheckboxState] = useState<CheckboxState>({
    checked: false,
    indeterminate: true
  });

  return (
    <ExampleItemsRows>
      <Checkbox
        indeterminate={checkboxState.indeterminate}
        checked={checkboxState.checked}
        onCheck={(value) => setCheckboxState({ checked: value, indeterminate: false })}
      >
        Indeterminate
      </Checkbox>
      <Button onClick={() => setCheckboxState({ checked: false, indeterminate: true })}>
        Set Indeterminate
      </Button>
    </ExampleItemsRows>
  );
}

export function Status() {
  return (
    <ExampleItemsRows>
      <Checkbox status="basic">Basic</Checkbox>
      <Checkbox status="primary">Primary</Checkbox>
      <Checkbox status="success">Success</Checkbox>
      <Checkbox status="danger">Danger</Checkbox>
      <Checkbox status="warning">Warning</Checkbox>
      <Checkbox status="info">Info</Checkbox>
      <ControlStatusExample>
        <Checkbox status="control">Control</Checkbox>
      </ControlStatusExample>
    </ExampleItemsRows>
  );
}
