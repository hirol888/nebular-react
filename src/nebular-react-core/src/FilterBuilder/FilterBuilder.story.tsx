import React, { useState } from 'react';
import { FilterBuilder, applyFilterBuilderGroup } from './FilterBuilder';
import type {
  FilterBuilderConjunction,
  FilterBuilderField,
  FilterBuilderGroup,
  FilterBuilderRule
} from './FilterBuilder';

export default { title: 'FilterBuilder', component: FilterBuilder };

const fields: FilterBuilderField[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'age', label: 'Age', type: 'number' },
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Editor', value: 'editor' },
      { label: 'Viewer', value: 'viewer' }
    ]
  },
  { key: 'active', label: 'Active', type: 'boolean' }
];

export function Showcase() {
  const [rules, setRules] = useState<FilterBuilderRule[]>([
    { id: 'showcase-name', field: 'name', operator: 'contains', value: 'ali' }
  ]);
  const [appliedRules, setAppliedRules] = useState<FilterBuilderRule[]>([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <FilterBuilder
        fields={fields}
        value={rules}
        onChange={setRules}
        onApply={setAppliedRules}
        onReset={() => setRules([])}
      />

      <pre>{JSON.stringify(appliedRules, null, 2)}</pre>
    </div>
  );
}

export function WithConjunction() {
  const [conjunction, setConjunction] = useState<FilterBuilderConjunction>('or');
  const [rules, setRules] = useState<FilterBuilderRule[]>([
    { id: 'conjunction-role', field: 'role', operator: 'equals', value: 'admin' },
    { id: 'conjunction-age', field: 'age', operator: 'gte', value: '30' }
  ]);

  return (
    <FilterBuilder
      fields={fields}
      value={rules}
      onChange={setRules}
      conjunction={conjunction}
      onConjunctionChange={setConjunction}
    />
  );
}

export function MaxRules() {
  const [rules, setRules] = useState<FilterBuilderRule[]>([
    { id: 'max-rules-role', field: 'role', operator: 'equals', value: 'admin' }
  ]);

  return (
    <FilterBuilder
      fields={fields}
      value={rules}
      onChange={setRules}
      maxRules={3}
      onApply={setRules}
      onReset={() => setRules([])}
    />
  );
}

const groupedFilter: FilterBuilderGroup = {
  type: 'group',
  id: 'users',
  conjunction: 'and',
  children: [
    { id: 'active', field: 'active', operator: 'equals', value: 'true' },
    {
      type: 'group',
      id: 'role-group',
      conjunction: 'or',
      children: [
        { id: 'admin', field: 'role', operator: 'equals', value: 'admin' },
        { id: 'editor', field: 'role', operator: 'equals', value: 'editor' }
      ]
    }
  ]
};

const users = [
  { name: 'Ana', age: 40, role: 'admin', active: true },
  { name: 'Bruno', age: 30, role: 'editor', active: false },
  { name: 'Cíntia', age: 28, role: 'editor', active: true },
  { name: 'David', age: 29, role: 'viewer', active: true }
];

export function NestedGroups() {
  const [group, setGroup] = useState(groupedFilter);
  const [appliedGroup, setAppliedGroup] = useState(groupedFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <FilterBuilder
        fields={fields}
        group={group}
        maxGroupDepth={2}
        onGroupChange={setGroup}
        onGroupApply={setAppliedGroup}
      />
      <output>
        Matching users:{' '}
        {applyFilterBuilderGroup(users, appliedGroup)
          .map(({ name }) => name)
          .join(', ') || 'None'}
      </output>
    </div>
  );
}
