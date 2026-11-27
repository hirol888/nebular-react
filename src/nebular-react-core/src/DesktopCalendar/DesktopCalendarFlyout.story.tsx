import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DesktopCalendarFlyout } from './DesktopCalendarFlyout';

const anchorRect = { left: 320, top: 180, width: 160, height: 32 };

const meta: Meta<typeof DesktopCalendarFlyout> = {
  title: 'Desktop/DesktopCalendarFlyout',
  component: DesktopCalendarFlyout,
  args: {
    open: true,
    onClose: () => undefined,
    anchorRect,
    placement: 'bottom'
  }
};

export default meta;
type Story = StoryObj<typeof DesktopCalendarFlyout>;

function InteractiveExample() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(() => new Date());

  return (
    <div style={{ padding: '4rem' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        Open calendar
      </button>
      <DesktopCalendarFlyout
        open={open}
        onClose={() => setOpen(false)}
        anchorRect={triggerRef.current?.getBoundingClientRect()}
        placement="bottom"
        date={date}
        onDateChange={setDate}
      />
    </div>
  );
}

export const Default: Story = {};

export const Interactive: Story = {
  render: () => <InteractiveExample />
};

export const PlacementTop: Story = {
  args: {
    placement: 'top'
  }
};
