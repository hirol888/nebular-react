import React from 'react';
import { ExampleItemsCol } from '../Shared';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { InputGroup } from './InputGroup';

export default { title: 'InputGroup', component: InputGroup };

export function Showcase() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <InputGroup before="https://" after=".com">
        <Input type="text" placeholder="Domain" />
      </InputGroup>

      <InputGroup before={<Icon icon="search-outline" pack="nebular-essentials" />}>
        <Input type="text" placeholder="Search" />
      </InputGroup>

      <InputGroup after={<Button appearance="ghost">Search</Button>}>
        <Input type="text" placeholder="Query" />
      </InputGroup>

      <InputGroup before="$" after="USD" orientation="horizontal">
        <Input type="text" placeholder="Amount" />
      </InputGroup>

      <InputGroup before="From" after="To" orientation="vertical">
        <Input type="text" placeholder="Range" />
      </InputGroup>

      <InputGroup before="$" after="USD" disabled>
        <Input type="text" placeholder="Disabled" disabled />
      </InputGroup>
    </ExampleItemsCol>
  );
}
