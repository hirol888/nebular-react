import React, { useState } from 'react';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { ExampleItemsCol, OptionGroup, Option } from '../Shared';
import { Select } from './Select';

export default { title: 'Select', component: Select };

const data: Option[] = [
  { type: 'option', label: 'Apple', value: 'Apple' },
  { type: 'option', label: 'Orange', value: 'Orange' },
  { type: 'option', label: 'Banana', value: 'Banana' },
  { type: 'option', label: 'Mango', value: 'Mango' },
  { type: 'option', label: 'Cherry', value: 'Cherry' },
  { type: 'option', label: 'Grape', value: 'Grape' },
  { type: 'option', label: 'Lemon', value: 'Lemon' },
  { type: 'option', label: 'Plum', value: 'Plum' },
  { type: 'option', label: 'Strawberry', value: 'Strawberry' },
  { type: 'option', label: 'Peach', value: 'Peach' },
  { type: 'option', label: 'Raspberry', value: 'Raspberry' }
];

export function Showcase() {
  return (
    <Select
      options={data}
      defaultSelected={{ type: 'option', label: 'Apple', value: 'Apple' }}
      placeholder="select"
    />
  );
}

export function Disabled() {
  const optionsDisabledData: Option[] = [
    { type: 'option', label: 'Option 0', value: '0' },
    { type: 'option', label: 'Option 1', value: '1' },
    { type: 'option', label: 'Option 2', value: '2', disabled: true },
    { type: 'option', label: 'Option 3', value: '3' },
    { type: 'option', label: 'Option 4', value: '4', disabled: true }
  ];
  return (
    <Card>
      <Card.Body>
        <ExampleItemsCol>
          <Select options={data} appearance="hero" placeholder="Disabled" disabled />
          <Select options={optionsDisabledData} placeholder="Disabled Options" />
        </ExampleItemsCol>
      </Card.Body>
    </Card>
  );
}

export function Filled() {
  return (
    <ExampleItemsCol>
      <Select options={data} placeholder="Primary" status="primary" appearance="filled" />
      <Select options={data} placeholder="Info" status="info" appearance="filled" />
      <Select options={data} placeholder="Success" status="success" appearance="filled" />
      <Select options={data} placeholder="Warning" status="warning" appearance="filled" />
      <Select options={data} placeholder="Danger" status="danger" appearance="filled" />
    </ExampleItemsCol>
  );
}

export function Hero() {
  return (
    <ExampleItemsCol>
      <Select options={data} placeholder="Primary" status="primary" appearance="hero" />
      <Select options={data} placeholder="Info" status="info" appearance="hero" />
      <Select options={data} placeholder="Success" status="success" appearance="hero" />
      <Select options={data} placeholder="Warning" status="warning" appearance="hero" />
      <Select options={data} placeholder="Danger" status="danger" appearance="hero" />
    </ExampleItemsCol>
  );
}

export function Outline() {
  return (
    <ExampleItemsCol>
      <Select options={data} placeholder="Primary" status="primary" appearance="outline" />
      <Select options={data} placeholder="Info" status="info" appearance="outline" />
      <Select options={data} placeholder="Success" status="success" appearance="outline" />
      <Select options={data} placeholder="Warning" status="warning" appearance="outline" />
      <Select options={data} placeholder="Danger" status="danger" appearance="outline" />
    </ExampleItemsCol>
  );
}

export function Size() {
  return (
    <ExampleItemsCol>
      <Select options={data} placeholder="Tiny" size="tiny" />
      <Select options={data} placeholder="Small" size="small" />
      <Select options={data} placeholder="Medium" size="medium" />
      <Select options={data} placeholder="Large" size="large" />
      <Select options={data} placeholder="Giant" size="giant" />
    </ExampleItemsCol>
  );
}

export function Multiple() {
  return <Select options={data} placeholder="Multiple Select" multiple />;
}

export function Deselect() {
  return <Select options={data} placeholder="select" allowDeselect initiallyOpened />;
}

export function Group() {
  const groupData: (Option | OptionGroup)[] = [
    {
      type: 'group',
      label: 'Group 1',
      options: [
        { type: 'option', label: 'Option 11', value: '11' },
        { type: 'option', label: 'Option 12', value: '12' },
        { type: 'option', label: 'Option 13', value: '13', disabled: true },
        { type: 'option', label: 'Option 14', value: '14' }
      ]
    },
    {
      type: 'group',
      label: 'Group 2',
      disabled: true,
      options: [
        { type: 'option', label: 'Option 21', value: '21' },
        { type: 'option', label: 'Option 22', value: '22' },
        { type: 'option', label: 'Option 23', value: '23' },
        { type: 'option', label: 'Option 24', value: '24' }
      ]
    },
    {
      type: 'group',
      label: 'Group 3',
      options: [
        { type: 'option', label: 'Option 31', value: '31' },
        { type: 'option', label: 'Option 32', value: '32' },
        { type: 'option', label: 'Option 33', value: '33', disabled: true },
        { type: 'option', label: 'Option 34', value: '34' }
      ]
    }
  ];

  return <Select options={groupData} placeholder="Select Groups" />;
}

export function CustomLabel() {
  const [selectedValue, setSelectedValue] = useState<string>(null);

  const handler = (selectedOptions: Option[]) => {
    setSelectedValue(selectedOptions.length > 0 ? selectedOptions[0].value : null);
  };

  return (
    <Select
      options={data}
      placeholder="Custom Label"
      allowDeselect
      onSelect={handler}
      customLabel={<div>Selected: {selectedValue}</div>}
    />
  );
}

export function WithIcon() {
  return <Select options={data} placeholder="With Icon" icon={<Icon icon="star" />} />;
}

export function Searchable() {
  return <Select options={data} placeholder="Searchable" searchable />;
}

export function Virtualized() {
  const longData: Option[] = Array.from({ length: 1000 }, (_, index) => ({
    type: 'option',
    label: `Option ${index}`,
    value: String(index)
  }));

  return (
    <Select
      options={longData}
      placeholder="Virtualized select"
      searchable
      virtualized
      virtualizedMaxHeight={320}
    />
  );
}

export function VirtualizedGroups() {
  const groupedData: OptionGroup[] = Array.from({ length: 50 }, (_group, groupIndex) => ({
    type: 'group',
    label: `Group ${groupIndex}`,
    options: Array.from({ length: 10 }, (_option, optionIndex) => ({
      type: 'option',
      label: `Option ${groupIndex * 10 + optionIndex}`,
      value: String(groupIndex * 10 + optionIndex)
    }))
  }));

  return (
    <Select
      options={groupedData}
      placeholder="Virtualized groups"
      searchable
      virtualized
      virtualizedMaxHeight={320}
    />
  );
}

const people: Option[] = [
  { type: 'option', label: 'Ada Lovelace', value: 'ada' },
  { type: 'option', label: 'Grace Hopper', value: 'grace' },
  { type: 'option', label: 'Alan Turing', value: 'alan' }
];

const peopleMeta: Record<string, { role: string; badge: string; initials: string }> = {
  ada: { role: 'Engineering', badge: 'Admin', initials: 'AL' },
  grace: { role: 'Research', badge: 'Owner', initials: 'GH' },
  alan: { role: 'Science', badge: 'Member', initials: 'AT' }
};

const optionAvatarStyle: React.CSSProperties = {
  alignItems: 'center',
  background: 'var(--color-primary-transparent-300, rgba(51, 102, 255, 0.16))',
  borderRadius: '50%',
  color: 'var(--color-primary-500, #3366ff)',
  display: 'inline-flex',
  flex: '0 0 auto',
  fontSize: '0.75rem',
  fontWeight: 700,
  height: '2rem',
  justifyContent: 'center',
  width: '2rem'
};

const optionTextStyle: React.CSSProperties = {
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  minWidth: 0
};

const optionBadgeStyle: React.CSSProperties = {
  background: 'var(--color-basic-transparent-300, rgba(143, 155, 179, 0.16))',
  borderRadius: '0.75rem',
  fontSize: '0.6875rem',
  fontWeight: 600,
  padding: '0.125rem 0.5rem'
};

export function RenderOption() {
  return (
    <Select
      options={people}
      placeholder="Select a person"
      multiple
      renderOption={(option) => {
        const meta = peopleMeta[option.value];

        return (
          <span style={{ alignItems: 'center', display: 'flex', gap: '0.75rem', width: '100%' }}>
            <span style={optionAvatarStyle}>{meta?.initials ?? option.label?.slice(0, 2)}</span>
            <span style={optionTextStyle}>
              <strong>{option.label}</strong>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{meta?.role}</span>
            </span>
            {meta?.badge && <span style={optionBadgeStyle}>{meta.badge}</span>}
          </span>
        );
      }}
    />
  );
}

export function AsyncSearch() {
  const [options, setOptions] = useState<Option[]>(data);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setLoading(true);

    setTimeout(() => {
      setOptions(data.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())));
      setLoading(false);
    }, 300);
  };

  return (
    <ExampleItemsCol>
      <div>Selected: {selected ?? 'none'}</div>
      <Select
        options={options}
        placeholder="Async search"
        searchable
        loading={loading}
        onSearchChange={handleSearch}
        onSelect={(value) => setSelected(Array.isArray(value) ? value.join(', ') : String(value))}
      />
    </ExampleItemsCol>
  );
}
