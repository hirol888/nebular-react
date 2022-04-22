import { NbAutocomplete, NbCard, NbCardBody, NbOption, NbOptionGroup } from '@nebular-react';
import React, { useState } from 'react';
import * as _ from 'lodash';

const AutocompleteGroup: React.FC = () => {
  const initialGroups = [
    {
      name: 'Group 1',
      children: ['Option 11', 'Option 12', 'Option 13']
    },
    {
      name: 'Group 2',
      children: ['Option 21', 'Option 22', 'Option 23']
    },
    {
      name: 'Group 3',
      children: ['Option 31', 'Option 32', 'Option 33']
    }
  ];
  const [groups, setGroups] = useState<{ name: string; children: string[] }[]>(initialGroups);

  const onChange = (value: string) => {
    const newGroups = initialGroups
      .map((g) => {
        return {
          name: g.name,
          children: g.children.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
        };
      })
      .filter((g) => g.children.length);
    setGroups(newGroups);
  };

  return (
    <NbCard size="medium">
      <NbCardBody>
        <NbAutocomplete placeholder="Enter value" type="text" onChange={(event) => onChange(event as string)}>
          {groups.map((g) => {
            return (
              <NbOptionGroup title={g.name} key={_.uniqueId('group-')}>
                {g.children.map((o) => {
                  return <NbOption key={_.uniqueId('option-')} value={o} title={o}></NbOption>;
                })}
              </NbOptionGroup>
            );
          })}
        </NbAutocomplete>
      </NbCardBody>
    </NbCard>
  );
};

export { AutocompleteGroup };
