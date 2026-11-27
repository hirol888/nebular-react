import React, { useId, useRef, useState } from 'react';
import { Button } from '../Button';
import { FormControl } from '../FormControl';
import { Input } from '../Input';
import { FormErrorSummary, type FormErrorSummaryItem } from './FormErrorSummary';

export default { title: 'FormErrorSummary', component: FormErrorSummary };

function ContactForm({ initiallyInvalid }: { initiallyInvalid: boolean }) {
  const nameId = useId();
  const emailId = useId();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrorSummaryItem[]>(
    initiallyInvalid
      ? [
          { fieldId: nameId, message: 'Enter your name' },
          { fieldId: emailId, message: 'Enter a valid email address' }
        ]
      : []
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '');
    const email = String(data.get('email') ?? '');
    const nextErrors: FormErrorSummaryItem[] = [];

    if (!name.trim()) nextErrors.push({ fieldId: nameId, message: 'Enter your name' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.push({ fieldId: emailId, message: 'Enter a valid email address' });
    }

    setErrors(nextErrors);
    setSubmitted(nextErrors.length === 0);
    if (nextErrors.length > 0) summaryRef.current?.focus();
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: 390 }}
    >
      <FormErrorSummary ref={summaryRef} errors={errors} title="Check your contact details" />
      <FormControl label="Full name" htmlFor={nameId}>
        <Input
          id={nameId}
          name="name"
          autoComplete="name"
          aria-invalid={errors.some(({ fieldId }) => fieldId === nameId) || undefined}
          required
          fullWidth
        />
      </FormControl>
      <FormControl label="Email address" htmlFor={emailId}>
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.some(({ fieldId }) => fieldId === emailId) || undefined}
          required
          fullWidth
        />
      </FormControl>
      <Button
        type="submit"
        status="primary"
        styles={{
          root: {
            '--button-filled-primary-background-color': 'var(--color-primary-600, #274bdb)',
            '--button-filled-primary-focus-background-color': 'var(--color-primary-700, #1a34b8)',
            '--button-filled-primary-hover-background-color': 'var(--color-primary-700, #1a34b8)'
          }
        }}
      >
        Save contact details
      </Button>
      {submitted && <div role="status">Contact details saved.</div>}
    </form>
  );
}

export function Showcase() {
  return <ContactForm initiallyInvalid />;
}

export function AfterSubmit() {
  return <ContactForm initiallyInvalid={false} />;
}
