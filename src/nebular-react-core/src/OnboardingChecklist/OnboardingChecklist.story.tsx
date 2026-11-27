import React, { useRef, useState } from 'react';
import { Button } from '../Button';
import { OnboardingChecklist } from './OnboardingChecklist';
import type { OnboardingChecklistTask } from './OnboardingChecklist';

export default { title: 'OnboardingChecklist', component: OnboardingChecklist };

export function WorkspaceSetup() {
  const settings = useRef<HTMLButtonElement>(null);
  const [tasks, setTasks] = useState<OnboardingChecklistTask[]>([
    {
      id: 'profile',
      title: 'Create your profile',
      description: 'Your colleagues use your profile to identify you.',
      status: 'completed'
    },
    {
      id: 'workspace',
      title: 'Review workspace settings',
      description: 'Take a short tour of the workspace controls.',
      action: {
        type: 'tour',
        label: 'Start tour',
        completeOnFinish: true,
        steps: [
          {
            title: 'Workspace settings',
            target: () => settings.current,
            content: 'Open these settings to set the workspace name and timezone.'
          }
        ]
      }
    },
    {
      id: 'help',
      title: 'Review the setup resources',
      action: { type: 'link', label: 'Open resources', href: '#setup-resources' }
    }
  ]);

  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: '44rem' }}>
      <Button ref={settings} type="button" appearance="outline">
        Settings
      </Button>
      <OnboardingChecklist
        tasks={tasks}
        onTaskStatusChange={(id, status) =>
          setTasks((current) =>
            current.map((task) => (task.id === id ? { ...task, status } : task))
          )
        }
      />
      <section id="setup-resources">
        <h3>Setup resources</h3>
        <p>
          Check available roles and choose a default notification channel before inviting your team.
        </p>
      </section>
    </div>
  );
}
