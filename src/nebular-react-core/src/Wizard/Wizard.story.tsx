import React, { useState } from 'react';
import { ExampleItemsCol } from '../Shared';
import { Card } from '../Card';
import { Input } from '../Input';
import { FormControl } from '../FormControl';
import { Wizard, WizardStep } from './Wizard';

export default { title: 'Wizard', component: Wizard };

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const wait = (duration: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, duration);
  });

export function Showcase() {
  const [completed, setCompleted] = useState(false);

  const steps: WizardStep[] = [
    {
      key: 'account',
      title: 'Account',
      description: 'Create the account that will own the workspace.',
      content: <p>Pick a username and a password to get started.</p>
    },
    {
      key: 'workspace',
      title: 'Workspace',
      description: 'Name the workspace your team will use.',
      content: <p>Workspaces group projects, members and billing.</p>
    },
    {
      key: 'review',
      title: 'Review',
      description: 'Confirm the information before finishing.',
      content: <p>Everything is ready. Finish to create the workspace.</p>
    }
  ];

  return (
    <Card>
      <Card.Body>
        <Wizard
          ariaLabel="Workspace setup"
          steps={steps}
          onComplete={() => setCompleted(true)}
          onCancel={() => setCompleted(false)}
        />

        {completed && <span>Wizard completed.</span>}
      </Card.Body>
    </Card>
  );
}

export function WithValidation() {
  const [email, setEmail] = useState('');
  const [completed, setCompleted] = useState(false);

  const steps: WizardStep[] = [
    {
      key: 'identity',
      title: 'Identity',
      description: 'The email is checked remotely before moving forward.',
      content: (
        <FormControl label="Email" htmlFor="wizard-email">
          <Input
            id="wizard-email"
            placeholder="user@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormControl>
      ),
      validate: async () => {
        await wait(700);

        return isValidEmail(email);
      }
    },
    {
      key: 'preferences',
      title: 'Preferences',
      description: 'Optional step: no validation is performed here.',
      content: <p>Choose the notifications you want to receive.</p>,
      optional: true
    },
    {
      key: 'confirm',
      title: 'Confirm',
      description: 'The last step validates synchronously.',
      content: <p>Review the information and finish the wizard.</p>,
      validate: () => email.length > 0
    }
  ];

  return (
    <Card>
      <Card.Body>
        <Wizard
          ariaLabel="Validated wizard"
          steps={steps}
          onComplete={() => setCompleted(true)}
          onCancel={() => setCompleted(false)}
        />

        {completed && <span>Wizard completed.</span>}
      </Card.Body>
    </Card>
  );
}

export function Vertical() {
  const [completed, setCompleted] = useState(false);

  const steps: WizardStep[] = [
    {
      key: 'plan',
      title: 'Plan',
      description: 'Pick the plan that fits the team.',
      content: <p>Starter, Team and Enterprise plans are available.</p>
    },
    {
      key: 'billing',
      title: 'Billing',
      description: 'Add the payment method used for the subscription.',
      content: <p>Invoices are issued on the first day of every month.</p>
    },
    {
      key: 'done',
      title: 'Done',
      description: 'Confirm the subscription.',
      content: <p>The subscription starts immediately after finishing.</p>
    }
  ];

  return (
    <Card>
      <Card.Body>
        <ExampleItemsCol style={{ alignItems: 'stretch' }}>
          <Wizard
            ariaLabel="Vertical wizard"
            orientation="vertical"
            steps={steps}
            onComplete={() => setCompleted(true)}
            onCancel={() => setCompleted(false)}
          />

          {completed && <span>Wizard completed.</span>}
        </ExampleItemsCol>
      </Card.Body>
    </Card>
  );
}
