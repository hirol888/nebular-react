import type { Meta, StoryObj } from '@storybook/react';
import { DesktopLayoutTemplates, type DesktopLayoutSnapshot } from '@nebular-react/core';

const snapshot: DesktopLayoutSnapshot = {
  version: 2,
  windows: [
    {
      id: 'notes',
      appId: 'notes',
      title: 'Notes',
      x: 40,
      y: 40,
      width: 480,
      height: 360,
      minimized: false,
      maximized: false,
      zIndex: 1
    }
  ]
};

const meta: Meta<typeof DesktopLayoutTemplates> = {
  title: 'Layout/DesktopLayoutTemplates',
  component: DesktopLayoutTemplates,
  args: {
    templates: [
      {
        id: 'focus',
        name: 'Focus',
        description: 'One editor window and no distractions.',
        snapshot
      },
      {
        id: 'support',
        name: 'Support',
        description: 'Tickets, chat and customer details side by side.',
        snapshot
      }
    ],
    activeTemplateId: 'focus'
  }
};

export default meta;
type Story = StoryObj<typeof DesktopLayoutTemplates>;

export const Default: Story = {};

export const Empty: Story = {
  args: { templates: [] }
};

export const WithActions: Story = {
  args: {
    onCreate: () => undefined,
    onApply: () => undefined,
    onDelete: () => undefined
  }
};
