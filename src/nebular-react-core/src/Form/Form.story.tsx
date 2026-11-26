import React, { useState } from 'react';
import { ExampleItemsCol, ExampleItemsRows } from '../Shared';
import { Input } from '../Input';
import { FormControl } from '../FormControl';
import { Button } from '../Button';
import { Form } from './Form';
import { useForm } from './useForm';

export default { title: 'Form', component: Form };

export function Showcase() {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null);

  const form = useForm({
    initialValues: { email: '', password: '' },
    rules: {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Enter a valid email address'
      },
      password: { required: true, minLength: 8 }
    },
    onSubmit: (values) => setSubmitted(values)
  });

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <Form form={form} ariaLabel="Sign in">
        <FormControl label="Email" htmlFor="showcase-email" error={form.errors.email}>
          <Input id="showcase-email" {...form.getInputProps('email')} />
        </FormControl>

        <FormControl label="Password" htmlFor="showcase-password" error={form.errors.password}>
          <Input id="showcase-password" type="password" {...form.getInputProps('password')} />
        </FormControl>

        <Button type="submit" fullWidth disabled={form.submitting}>
          {form.submitting ? 'Signing in' : 'Sign in'}
        </Button>
      </Form>

      {submitted && <span>Submitted: {JSON.stringify(submitted)}</span>}
    </ExampleItemsCol>
  );
}

export function WithRules() {
  const form = useForm({
    initialValues: { username: 'ne', age: 15, inviteCode: '' },
    rules: {
      username: { required: true, minLength: 3, maxLength: 12 },
      age: { min: 18, max: 120, message: 'You must be at least 18 years old' },
      inviteCode: {
        required: true,
        validate: (value) =>
          String(value).startsWith('ALL-') ? undefined : 'The code must start with ALL-'
      }
    },
    onSubmit: () => undefined
  });

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <Form form={form} ariaLabel="Profile form">
        <FormControl label="Username" htmlFor="rules-username" error={form.errors.username}>
          <Input id="rules-username" {...form.getInputProps('username')} />
        </FormControl>

        <FormControl label="Age" htmlFor="rules-age" error={form.errors.age}>
          <Input id="rules-age" type="number" {...form.getInputProps('age', { type: 'number' })} />
        </FormControl>

        <FormControl label="Invite code" htmlFor="rules-invite" error={form.errors.inviteCode}>
          <Input id="rules-invite" placeholder="ALL-0000" {...form.getInputProps('inviteCode')} />
        </FormControl>

        <Button type="submit">Validate</Button>
        <Button type="button" appearance="outline" onClick={() => form.reset()}>
          Reset
        </Button>
      </Form>
    </ExampleItemsCol>
  );
}

export function AsyncSubmit() {
  const [finished, setFinished] = useState(0);

  const form = useForm({
    initialValues: { email: 'user@example.com' },
    rules: {
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
    },
    onSubmit: async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 1200);
      });
    },
    onSuccess: () => setFinished((total) => total + 1)
  });

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <Form form={form} ariaLabel="Async form">
        <FormControl label="Email" htmlFor="async-email" error={form.errors.email}>
          <Input id="async-email" {...form.getInputProps('email')} />
        </FormControl>

        <Button type="submit" disabled={form.submitting}>
          {form.submitting ? 'Sending' : 'Send'}
        </Button>
      </Form>

      <span>Successful submissions: {finished}</span>
    </ExampleItemsCol>
  );
}

type Contact = {
  email: string;
  label: string;
};

type ContactsValues = {
  name: string;
  contacts: Contact[];
};

export function FieldArray() {
  const form = useForm<ContactsValues>({
    initialValues: {
      name: '',
      contacts: [{ email: 'first@example.com', label: 'Work' }]
    },
    rules: {
      name: { required: true },
      contacts: { required: true, message: 'Add at least one contact' }
    },
    onSubmit: () => undefined
  });
  const contacts = form.useFieldArray('contacts');

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <Form form={form} ariaLabel="Contacts form">
        <FormControl label="Name" htmlFor="field-array-name" error={form.errors.name}>
          <Input id="field-array-name" {...form.getInputProps('name')} />
        </FormControl>

        {contacts.fields.map((contact, index) => (
          <FormControl key={index} label={`Contact ${index + 1}`} error={form.errors.contacts}>
            <ExampleItemsRows>
              <Input
                aria-label={`Contact ${index + 1} email`}
                placeholder="user@example.com"
                value={contact.email}
                onChange={(event) =>
                  contacts.update(index, { ...contact, email: event.target.value })
                }
              />
              <Button
                type="button"
                appearance="outline"
                status="danger"
                onClick={() => contacts.remove(index)}
              >
                Remove
              </Button>
              <Button
                type="button"
                appearance="ghost"
                disabled={index === 0}
                onClick={() => contacts.move(index, index - 1)}
              >
                Up
              </Button>
              <Button
                type="button"
                appearance="ghost"
                disabled={index === contacts.fields.length - 1}
                onClick={() => contacts.move(index, index + 1)}
              >
                Down
              </Button>
            </ExampleItemsRows>
          </FormControl>
        ))}

        <ExampleItemsRows>
          <Button type="button" onClick={() => contacts.append({ email: '', label: 'Personal' })}>
            Append contact
          </Button>
          <Button
            type="button"
            appearance="outline"
            onClick={() => contacts.prepend({ email: '', label: 'Primary' })}
          >
            Prepend contact
          </Button>
          <Button
            type="button"
            appearance="outline"
            onClick={() => contacts.insert(0, { email: 'inserted@example.com', label: 'Inserted' })}
          >
            Insert first
          </Button>
          <Button type="button" appearance="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </ExampleItemsRows>

        <Button type="submit">Save</Button>
      </Form>

      <span>Values: {JSON.stringify(form.values)}</span>
    </ExampleItemsCol>
  );
}

export function AsyncValidation() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    initialValues: { username: 'nebular' },
    rules: {
      username: {
        required: true,
        minLength: 3,
        validate: async (value) => {
          await new Promise((resolve) => {
            setTimeout(resolve, 700);
          });

          return ['admin', 'root', 'nebular'].includes(String(value))
            ? 'This username is already taken'
            : undefined;
        }
      }
    },
    onSubmit: () => setSubmitted(true)
  });

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <Form form={form} ariaLabel="Async validation form">
        <FormControl
          label="Username"
          htmlFor="async-validation-username"
          error={form.errors.username}
        >
          <Input id="async-validation-username" {...form.getInputProps('username')} />
        </FormControl>

        <Button type="submit" disabled={form.validating}>
          {form.validating ? 'Checking availability' : 'Create account'}
        </Button>
      </Form>

      <span>Submitted: {String(submitted)}</span>
    </ExampleItemsCol>
  );
}
