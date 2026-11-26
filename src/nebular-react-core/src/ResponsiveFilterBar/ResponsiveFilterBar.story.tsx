import React, { useState } from 'react';
import {
  FilterBuilder,
  FILTER_BUILDER_OPERATOR_LABELS,
  type FilterBuilderField,
  type FilterBuilderRule
} from '../FilterBuilder';
import { ResponsiveFilterBar, type ResponsiveFilterBarLayout } from './ResponsiveFilterBar';

export default { title: 'ResponsiveFilterBar', component: ResponsiveFilterBar };

const fields: FilterBuilderField[] = [
  { key: 'name', label: 'Name', type: 'text' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Open', value: 'open' },
      { label: 'Completed', value: 'completed' }
    ]
  },
  { key: 'team', label: 'Team', type: 'text' }
];

const views = [
  {
    id: 'open',
    label: 'Open requests',
    rules: [{ id: 'status', field: 'status', operator: 'equals', value: 'open' }]
  },
  {
    id: 'finance',
    label: 'Finance team',
    rules: [{ id: 'team', field: 'team', operator: 'equals', value: 'Finance' }]
  }
] satisfies { id: string; label: string; rules: FilterBuilderRule[] }[];

const initialRules: FilterBuilderRule[] = [...views[0].rules, ...views[1].rules];

function Example({ layout }: { layout: ResponsiveFilterBarLayout }) {
  const [draft, setDraft] = useState(initialRules);
  const [applied, setApplied] = useState(initialRules);
  const [viewId, setViewId] = useState('');
  const updateFilters = (rules: FilterBuilderRule[]) => {
    setDraft(rules);
    setApplied(rules);
    setViewId('');
  };

  return (
    <div style={{ width: '100%', maxWidth: layout === 'drawer' ? 390 : 800 }}>
      <ResponsiveFilterBar
        layout={layout}
        filters={applied.map(({ id, field, operator, value }) => {
          const definition = fields.find(({ key }) => key === field);
          return {
            id,
            label: [
              definition?.label ?? field,
              FILTER_BUILDER_OPERATOR_LABELS[operator],
              definition?.options?.find((option) => option.value === value)?.label ?? value
            ]
              .filter(Boolean)
              .join(' ')
          };
        })}
        onRemoveFilter={(id) => updateFilters(applied.filter((filter) => filter.id !== id))}
        onClearFilters={() => updateFilters([])}
        savedViews={views}
        selectedViewId={viewId}
        onSelectView={(id) => {
          const view = views.find((saved) => saved.id === id);
          if (view) {
            updateFilters(view.rules);
            setViewId(id);
          }
        }}
        editor={(close) => (
          <FilterBuilder
            fields={fields}
            value={draft}
            onChange={setDraft}
            onApply={(rules) => {
              updateFilters(rules);
              close();
            }}
          />
        )}
      />
    </div>
  );
}

export function Showcase() {
  return <Example layout="auto" />;
}

export function Mobile() {
  return <Example layout="drawer" />;
}
