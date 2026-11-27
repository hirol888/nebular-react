import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DesktopWidgets, type DesktopWidget } from './DesktopWidgets';

const widgets: DesktopWidget[] = [
  {
    id: 'clock',
    title: 'Clock',
    description: 'Local time',
    content: <div style={{ fontSize: '1.8rem', fontWeight: 600, lineHeight: 1.1 }}>09:41</div>
  },
  {
    id: 'notes',
    title: 'Quick notes',
    description: 'A scratchpad that stays on the desktop.',
    defaultCollapsed: true,
    content: (
      <p style={{ margin: 0 }}>
        Review the weekly plan, reply to Ana and prepare the release notes before the standup.
      </p>
    )
  }
];

const meta: Meta<typeof DesktopWidgets> = {
  title: 'Desktop/DesktopWidgets',
  component: DesktopWidgets,
  args: {
    widgets
  }
};

export default meta;
type Story = StoryObj<typeof DesktopWidgets>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    widgets: []
  }
};

export const WithClose: Story = {
  args: {
    onClose: () => undefined
  }
};
