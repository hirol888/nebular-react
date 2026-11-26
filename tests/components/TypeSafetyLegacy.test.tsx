import React from 'react';
import { render, screen } from '@testing-library/react';
import { Action, Badge, ButtonGroup, Card, ChartLegend, LineChart } from '@nebular-react/core';
import type {
  ButtonGroupProps,
  ChartSeries,
  ChatMessageFileType,
  ChatMessageType,
  Option,
  OptionInternal
} from '@nebular-react/core';

const textOption: OptionInternal = { type: 'option', label: 'Alpha', value: 'alpha' };
const publicOption: Option = { type: 'option', label: 'Beta', value: 'beta' };

// @ts-expect-error option values are required strings
const missingValueOption: Option = { type: 'option', label: 'Gamma' };

const invalidOptionValue: Option = {
  type: 'option',
  label: 'Delta',
  // @ts-expect-error option values must be strings
  value: 42
};

const imageFileAttachment: ChatMessageFileType = {
  url: 'https://cdn.test/a.png',
  type: 'image/png'
};
const iconFileAttachment: ChatMessageFileType = {
  url: 'https://cdn.test/b.zip',
  icon: 'file-text-outline'
};

const chatMessages: ChatMessageType[] = [
  { message: 'Hello', sender: 'Jane Roe', files: [imageFileAttachment, iconFileAttachment] },
  { message: 'Bye', reply: true }
];

const invalidChatFile: ChatMessageType = {
  message: 'Broken attachment',
  files: [
    // @ts-expect-error chat files must expose a string url
    { type: 'image/png' }
  ]
};

const invalidChatFileIcon: ChatMessageType = {
  message: 'Broken icon',
  files: [
    // @ts-expect-error chat file icons must be strings
    { url: 'https://cdn.test/b.zip', icon: true }
  ]
};

const invalidChatFilesProp: ChatMessageType = {
  message: 'Broken files prop',
  // @ts-expect-error chat files must be an array of file attachments
  files: 'https://cdn.test/a.png'
};

const readSingleGroupValue = (pressed: string | null): string => pressed ?? '';
const singleGroupProps: ButtonGroupProps = {
  pressed: 'bold',
  onChange: readSingleGroupValue
};

const readMultipleGroupValues = (pressed: string[]): number => pressed.length;
const multipleGroupProps: ButtonGroupProps<true> = {
  multiple: true,
  pressed: ['bold', 'italic'],
  onChange: readMultipleGroupValues
};

const invalidMultipleGroupProps: ButtonGroupProps<true> = {
  multiple: true,
  // @ts-expect-error multiple mode expects an array of pressed values
  pressed: 'bold'
};

const chartSeries: ChartSeries[] = [{ name: 'Revenue', data: [12, 19] }];
const chartClasses: Record<string, string> = {
  legend: 'legend',
  legendItem: 'item',
  legendSwatch: 'swatch'
};
const chartCx = (...values: (string | undefined)[]): string => values.filter(Boolean).join(' ');

const legendTree = <ChartLegend series={chartSeries} classes={chartClasses} cx={chartCx} />;

const invalidLegendTree = (
  <ChartLegend
    series={chartSeries}
    // @ts-expect-error legend classes must be string values
    classes={{ legend: 1 }}
    cx={chartCx}
  />
);

const cardTree = (
  <Card>
    <Card.Header>Overview</Card.Header>
    <Card.Body>Body</Card.Body>
    <Card.Footer>Footer</Card.Footer>
  </Card>
);

const actionTree = (
  <Action badge={<Badge text="3" />} icon={<span aria-hidden="true">i</span>}>
    Inbox
  </Action>
);

describe('legacy components type safety', () => {
  it('LegacyComponents_Render_ShouldRenderTypedContracts', () => {
    render(
      <Card>
        <Card.Header>Overview</Card.Header>
        <Card.Body>
          <ButtonGroup<true> multiple pressed={['bold']} onChange={() => undefined}>
            <ButtonGroup.Toggle value="bold">Bold</ButtonGroup.Toggle>
          </ButtonGroup>
          {actionTree}
          <LineChart labels={['Jan', 'Feb']} series={chartSeries} />
        </Card.Body>
      </Card>
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bold/ })).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();

    expect(textOption.value).toBe('alpha');
    expect(publicOption.value).toBe('beta');
    expect(missingValueOption.label).toBe('Gamma');
    expect(invalidOptionValue.value).toBe(42);

    expect(chatMessages[0].files).toHaveLength(2);
    expect(invalidChatFile.message).toBe('Broken attachment');
    expect(invalidChatFileIcon.message).toBe('Broken icon');
    expect(invalidChatFilesProp.message).toBe('Broken files prop');

    expect(singleGroupProps.pressed).toBe('bold');
    expect(multipleGroupProps.pressed).toEqual(['bold', 'italic']);
    expect(invalidMultipleGroupProps.multiple).toBe(true);

    expect(legendTree).toBeDefined();
    expect(invalidLegendTree).toBeDefined();
    expect(cardTree).toBeDefined();
  });
});
