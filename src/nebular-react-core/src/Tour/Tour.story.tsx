import React, { useRef, useState } from 'react';
import { Button } from '../Button';
import { Tour } from './Tour';
import type { TourStep } from './Tour';

export default { title: 'Tour', component: Tour };

const cardStyle: React.CSSProperties = {
  padding: '1rem 1.25rem',
  border: '1px solid #e4e9f2',
  borderRadius: '0.5rem',
  backgroundColor: '#ffffff',
  color: '#222b45',
  fontSize: '0.875rem'
};

export function Showcase() {
  const [opened, setOpened] = useState<boolean>(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      target: () => dashboardRef.current,
      title: 'Dashboard',
      content: 'Here you can follow the main metrics of your workspace in real time.',
      placement: 'bottom'
    },
    {
      target: () => reportsRef.current,
      title: 'Reports',
      content: 'Generate and export detailed reports whenever you need them.',
      placement: 'bottom'
    },
    {
      target: () => settingsRef.current,
      title: 'Settings',
      content: 'Customize the workspace, invite teammates and manage permissions.',
      placement: 'top'
    }
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Button status="primary" onClick={() => setOpened(true)}>
          Start tour
        </Button>
        <span style={{ fontSize: '0.8125rem' }}>
          Use the keyboard arrows to move between steps.
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div ref={dashboardRef} style={cardStyle}>
          Dashboard
        </div>
        <div ref={reportsRef} style={cardStyle}>
          Reports
        </div>
        <div ref={settingsRef} style={cardStyle}>
          Settings
        </div>
      </div>

      <Tour
        steps={steps}
        opened={opened}
        onOpenChange={setOpened}
        onClose={() => setOpened(false)}
        onFinish={() => setOpened(false)}
        ariaLabel="Workspace tour"
      />
    </>
  );
}

export function Controlled() {
  const [opened, setOpened] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(0);
  const steps: TourStep[] = [
    { title: 'Welcome', content: 'This tour is fully controlled by the parent component.' },
    {
      title: 'Navigation',
      content: 'The parent decides which step is rendered through the activeStep prop.'
    },
    {
      title: 'Done',
      content: 'Finishing the tour calls onFinish, so the parent can persist the state.'
    }
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Button appearance="ghost" onClick={() => setOpened(true)}>
          Open tour
        </Button>
        <Button appearance="ghost" onClick={() => setActiveStep((step) => Math.max(0, step - 1))}>
          Previous step
        </Button>
        <Button
          appearance="ghost"
          onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}
        >
          Next step
        </Button>
        <span style={{ fontSize: '0.8125rem' }}>Current step: {activeStep + 1}</span>
      </div>

      <Tour
        steps={steps}
        opened={opened}
        activeStep={activeStep}
        onOpenChange={setOpened}
        onStepChange={setActiveStep}
        onFinish={() => setOpened(false)}
        onClose={() => setOpened(false)}
        ariaLabel="Controlled tour"
      />
    </>
  );
}
