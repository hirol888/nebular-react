import React from 'react';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button, Form, FormControl, Input, useForm } from '@nebular-react/core';

type ProfileValues = {
  name: string;
  email: string;
  age: number;
  accepted: boolean;
};

const profileInitialValues: ProfileValues = { name: '', email: '', age: 0, accepted: false };

const renderProfileHook = (options: Record<string, unknown> = {}) =>
  renderHook(() =>
    useForm<ProfileValues>({
      initialValues: profileInitialValues,
      rules: {
        name: { required: true, minLength: 3 },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
      },
      ...options
    })
  );

function LoginForm({
  onSubmit,
  onSuccess
}: {
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onSuccess?: () => void;
}) {
  const form = useForm({
    initialValues: { email: '', password: '', remember: false },
    rules: {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Enter a valid email'
      },
      password: { required: true, minLength: 6 }
    },
    onSubmit
  });

  return (
    <Form form={form} onSuccess={onSuccess} ariaLabel="Login form">
      <FormControl label="Email" htmlFor="login-email" error={form.errors.email}>
        <Input id="login-email" {...form.getInputProps('email')} />
      </FormControl>

      <FormControl label="Password" htmlFor="login-password" error={form.errors.password}>
        <Input id="login-password" {...form.getInputProps('password')} type="password" />
      </FormControl>

      <label htmlFor="login-remember">
        <input id="login-remember" {...form.getInputProps('remember', { type: 'checkbox' })} />
        Remember me
      </label>

      <Button type="submit">{form.submitting ? 'Signing in' : 'Sign in'}</Button>
      <Button type="button" onClick={() => form.reset()}>
        Reset
      </Button>

      <span data-testid="values">{JSON.stringify(form.values)}</span>
      <span data-testid="touched">{JSON.stringify(form.touched)}</span>
      <span data-testid="valid">{String(form.isValid)}</span>
    </Form>
  );
}

describe('useForm', () => {
  it('useForm_InitialValues_ShouldExposeInitialState', () => {
    const { result } = renderProfileHook();

    expect(result.current.values).toEqual(profileInitialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.submitting).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  it('useForm_SetValue_ShouldUpdateValueAndValidateOnChange', () => {
    const { result } = renderProfileHook();

    act(() => result.current.setValue('name', 'ab'));

    expect(result.current.values.name).toBe('ab');
    expect(result.current.errors.name).toBe('Must be at least 3 characters.');

    act(() => result.current.setValue('name', 'Alice'));

    expect(result.current.values.name).toBe('Alice');
    expect(result.current.errors.name).toBeUndefined();
  });

  it('useForm_SetValue_ShouldSkipValidationWhenValidateOnChangeIsFalse', () => {
    const { result } = renderProfileHook({ validateOnChange: false });

    act(() => result.current.setValue('name', 'ab'));

    expect(result.current.values.name).toBe('ab');
    expect(result.current.errors.name).toBeUndefined();
  });

  it('useForm_SetValues_ShouldUpdateMultipleValues', () => {
    const { result } = renderProfileHook();

    act(() => result.current.setValues({ name: 'Alice', email: 'alice@example.com', age: 30 }));

    expect(result.current.values).toEqual({
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
      accepted: false
    });
    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBeUndefined();
  });

  it('useForm_ValidateField_ShouldReturnErrorAndStoreIt', () => {
    const { result } = renderProfileHook();
    let message: string | undefined;

    act(() => {
      message = result.current.validateField('name');
    });

    expect(message).toBe('This field is required.');
    expect(result.current.errors.name).toBe('This field is required.');
  });

  it('useForm_ValidateField_ShouldApplyCustomMessage', () => {
    const { result } = renderProfileHook();

    act(() => result.current.setValue('email', 'not-an-email'));

    expect(result.current.errors.email).toBe('Invalid email');
  });

  it('useForm_SetError_ShouldStoreAndClearCustomError', () => {
    const { result } = renderHook(() => useForm({ initialValues: { email: '' } }));

    expect(result.current.isValid).toBe(true);

    act(() => result.current.setError('email', 'Email already used'));

    expect(result.current.errors.email).toBe('Email already used');
    expect(result.current.isValid).toBe(false);

    act(() => result.current.setError('email'));

    expect(result.current.errors.email).toBeUndefined();
    expect(result.current.isValid).toBe(true);
  });

  it('useForm_HandleSubmit_ShouldCallOnSubmitWhenValid', async () => {
    const onSubmit = jest.fn();
    const { result } = renderProfileHook({
      initialValues: { ...profileInitialValues, name: 'Alice', email: 'alice@example.com' },
      onSubmit
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      age: 0,
      accepted: false
    });
  });

  it('useForm_HandleSubmit_ShouldBlockSubmitAndTouchFieldsWhenInvalid', async () => {
    const onSubmit = jest.fn();
    const { result } = renderProfileHook({ onSubmit });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBe('This field is required.');
    expect(result.current.errors.email).toBe('Invalid email');
    expect(result.current.touched.email).toBe(true);
    expect(result.current.touched.name).toBe(true);
  });

  it('useForm_HandleSubmit_ShouldCallValidateOptionAndAllowCustomErrors', async () => {
    const onSubmit = jest.fn();
    const validate = jest.fn(() => ({ email: 'Email is blocked' }));
    const { result } = renderProfileHook({
      initialValues: { ...profileInitialValues, name: 'Alice', email: 'blocked@example.com' },
      validate,
      onSubmit
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(validate).toHaveBeenCalled();
    expect(result.current.errors.email).toBe('Email is blocked');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('useForm_HandleSubmit_ShouldToggleSubmittingAndCallOnSuccess', async () => {
    let resolveSubmit: () => void = () => undefined;
    const onSubmit = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useForm({ initialValues: { email: 'alice@example.com' }, onSubmit, onSuccess })
    );

    let submitPromise: Promise<void> = Promise.resolve();

    act(() => {
      submitPromise = result.current.handleSubmit();
    });

    expect(result.current.submitting).toBe(true);

    await act(async () => {
      resolveSubmit();
      await submitPromise;
    });

    expect(result.current.submitting).toBe(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('useForm_Reset_ShouldRestoreInitialValuesAndClearState', async () => {
    const { result } = renderProfileHook();

    act(() => result.current.setValue('name', 'ab'));
    act(() => result.current.setValue('email', 'alice@example.com'));

    await act(async () => {
      await result.current.handleSubmit();
    });

    act(() => result.current.reset());

    expect(result.current.values).toEqual(profileInitialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.submitting).toBe(false);
  });

  it('useForm_GetInputProps_ShouldExposeBindings', () => {
    const { result } = renderProfileHook();

    const emailProps = result.current.getInputProps('email');
    const rememberProps = result.current.getInputProps('accepted', { type: 'checkbox' });

    expect(emailProps.name).toBe('email');
    expect(emailProps.value).toBe('');
    expect(rememberProps.name).toBe('accepted');
    expect(rememberProps.checked).toBe(false);

    act(() => (emailProps.onChange as (value: string) => void)('alice@example.com'));

    expect(result.current.values.email).toBe('alice@example.com');

    act(() =>
      (rememberProps.onChange as (value: unknown) => void)({
        target: { type: 'checkbox', checked: true, value: 'on' }
      })
    );

    expect(result.current.values.accepted).toBe(true);

    act(() => (emailProps.onBlur as () => void)());

    expect(result.current.touched.email).toBe(true);
  });

  it('useForm_GetInputProps_ShouldExposeAriaAttributesWhenFieldHasError', () => {
    const { result } = renderProfileHook();

    act(() => {
      result.current.validateField('email');
    });

    const emailProps = result.current.getInputProps('email');

    expect(emailProps.error).toBe('Invalid email');
    expect(emailProps['aria-invalid']).toBe(true);
    expect(emailProps['aria-describedby']).toBe('email-error');
  });
});

describe('Form', () => {
  it('Form_SubmitInvalid_ShouldRenderErrorSummaryAndNotCallOnSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(
        screen
          .getAllByRole('alert')
          .some((alert) => alert.textContent?.includes('Please fix the errors below.'))
      ).toBe(true)
    );

    expect(onSubmit).not.toHaveBeenCalled();
    expect(JSON.parse(screen.getByTestId('touched').textContent as string)).toEqual({
      email: true,
      password: true,
      remember: true
    });
    expect(screen.getAllByText('This field is required.').length).toBeGreaterThan(0);
  });

  it('Form_SubmitValid_ShouldSubmitValuesAndCallOnSuccess', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const onSuccess = jest.fn();

    render(<LoginForm onSubmit={onSubmit} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret1');
    await user.click(screen.getByRole('checkbox', { name: /remember me/i }));

    expect(screen.getByTestId('valid')).toHaveTextContent('true');

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'secret1',
      remember: true
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('valid')).toHaveTextContent('true');
  });

  it('Form_SubmitInvalidThenFix_ShouldRemoveErrorSummary', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn(() => undefined);

    render(<LoginForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(screen.getByText('Please fix the errors below.')).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('Please fix the errors below.')).not.toBeInTheDocument();
  });

  it('Form_ResetButton_ShouldClearValuesAndTouchedState', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={jest.fn()} />);

    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByTestId('touched')).not.toHaveTextContent('{}'));

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByTestId('touched')).toHaveTextContent('{}');
    expect(screen.queryByText('Please fix the errors below.')).not.toBeInTheDocument();
  });

  it('Form_NoValidateDefault_ShouldDisableNativeValidation', () => {
    render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByRole('form', { name: 'Login form' })).toHaveAttribute('novalidate');
  });

  it('Form_InputWithoutErrors_ShouldNotExposeAriaInvalid', () => {
    render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
  });

  it('Form_hasNoA11yViolations', async () => {
    const { container } = render(<LoginForm onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@example.com' } });

    expect(await axe(container)).toHaveNoViolations();
  });
});

type Contact = { email: string; label: string };

type FieldArrayValues = {
  tags: string[];
  contacts: Contact[];
};

const fieldArrayInitialValues: FieldArrayValues = { tags: ['alpha'], contacts: [] };

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

const renderFieldArrayHook = () =>
  renderHook(() => useForm<FieldArrayValues>({ initialValues: fieldArrayInitialValues }));

describe('useFieldArray', () => {
  it('useFieldArray_Append_ShouldAddItemToTheEndAndMarkTouched', () => {
    const { result } = renderFieldArrayHook();

    act(() => result.current.useFieldArray('tags').append('beta'));

    expect(result.current.values.tags).toEqual(['alpha', 'beta']);
    expect(result.current.useFieldArray('tags').fields).toEqual(['alpha', 'beta']);
    expect(result.current.touched.tags).toBe(true);
  });

  it('useFieldArray_PrependAndInsert_ShouldPlaceItemsAtExpectedPositions', () => {
    const { result } = renderFieldArrayHook();

    act(() => result.current.useFieldArray('tags').prepend('omega'));
    act(() => result.current.useFieldArray('tags').insert(1, 'beta'));

    expect(result.current.values.tags).toEqual(['omega', 'beta', 'alpha']);
    expect(result.current.useFieldArray('tags').fields).toEqual(['omega', 'beta', 'alpha']);
  });

  it('useFieldArray_RemoveAndUpdate_ShouldMutateItems', () => {
    const { result } = renderHook(() =>
      useForm<FieldArrayValues>({ initialValues: { tags: ['a', 'b', 'c'], contacts: [] } })
    );

    act(() => result.current.useFieldArray('tags').remove(1));
    expect(result.current.values.tags).toEqual(['a', 'c']);

    act(() => result.current.useFieldArray('tags').update(0, 'z'));
    expect(result.current.values.tags).toEqual(['z', 'c']);
    expect(result.current.touched.tags).toBe(true);
  });

  it('useFieldArray_Move_ShouldReorderItems', () => {
    const { result } = renderHook(() =>
      useForm<FieldArrayValues>({ initialValues: { tags: ['a', 'b', 'c'], contacts: [] } })
    );

    act(() => result.current.useFieldArray('tags').move(0, 2));

    expect(result.current.values.tags).toEqual(['b', 'c', 'a']);
  });

  it('useFieldArray_Replace_ShouldSwapTheWholeArray', () => {
    const { result } = renderFieldArrayHook();

    act(() => result.current.useFieldArray('tags').replace(['x', 'y']));

    expect(result.current.values.tags).toEqual(['x', 'y']);
    expect(result.current.useFieldArray('tags').fields).toEqual(['x', 'y']);
  });

  it('useFieldArray_ObjectItems_ShouldSupportEveryOperation', () => {
    const { result } = renderFieldArrayHook();

    act(() =>
      result.current.useFieldArray('contacts').append({ email: 'first@example.com', label: 'Work' })
    );
    act(() =>
      result.current
        .useFieldArray('contacts')
        .append({ email: 'second@example.com', label: 'Home' })
    );
    act(() => result.current.useFieldArray('contacts').move(1, 0));
    act(() =>
      result.current
        .useFieldArray('contacts')
        .update(1, { email: 'first@example.com', label: 'Personal' })
    );

    expect(result.current.values.contacts).toEqual([
      { email: 'second@example.com', label: 'Home' },
      { email: 'first@example.com', label: 'Personal' }
    ]);

    act(() =>
      result.current
        .useFieldArray('contacts')
        .replace([{ email: 'third@example.com', label: 'Work' }])
    );

    expect(result.current.values.contacts).toEqual([{ email: 'third@example.com', label: 'Work' }]);
  });

  it('useFieldArray_Append_ShouldClearRequiredError', () => {
    const { result } = renderHook(() =>
      useForm<FieldArrayValues>({
        initialValues: { tags: [], contacts: [] },
        rules: { contacts: { required: true, message: 'Add a contact' } }
      })
    );

    act(() => {
      result.current.validateField('contacts');
    });

    expect(result.current.errors.contacts).toBe('Add a contact');

    act(() =>
      result.current.useFieldArray('contacts').append({ email: 'first@example.com', label: 'Work' })
    );

    expect(result.current.errors.contacts).toBeUndefined();
    expect(result.current.touched.contacts).toBe(true);
  });

  it('useFieldArray_OutOfRangeOperations_ShouldKeepTheArrayUntouched', () => {
    const { result } = renderFieldArrayHook();

    act(() => result.current.useFieldArray('tags').remove(5));
    act(() => result.current.useFieldArray('tags').update(5, 'ignored'));
    act(() => result.current.useFieldArray('tags').move(0, 5));

    expect(result.current.values.tags).toEqual(['alpha']);
  });
});

describe('useForm async validation', () => {
  it('useForm_HandleSubmit_ShouldExposeValidatingWhileAwaitingAsyncRule', async () => {
    const gate = createDeferred<string | null>();
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'alice@example.com' },
        rules: { email: { validate: () => gate.promise } },
        onSubmit
      })
    );

    let submitPromise: Promise<void> = Promise.resolve();

    act(() => {
      submitPromise = result.current.handleSubmit();
    });

    expect(result.current.validating).toBe(true);

    await act(async () => {
      gate.resolve('Email already taken');
      await submitPromise;
    });

    expect(result.current.validating).toBe(false);
    expect(result.current.errors.email).toBe('Email already taken');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('useForm_HandleSubmit_ShouldSubmitAfterAsyncRulePasses', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'alice@example.com' },
        rules: { email: { validate: () => Promise.resolve(null) } },
        onSubmit
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.validating).toBe(false);
    expect(result.current.errors.email).toBeUndefined();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('useForm_ValidateAsync_ShouldResolveFalseAndStoreAsyncErrors', async () => {
    const validate = jest.fn(async () => ({ email: 'Blocked by the server' }));
    const { result } = renderHook(() =>
      useForm({ initialValues: { email: 'alice@example.com' }, validate })
    );

    let valid = true;

    await act(async () => {
      valid = await result.current.validateAsync();
    });

    expect(validate).toHaveBeenCalled();
    expect(valid).toBe(false);
    expect(result.current.validating).toBe(false);
    expect(result.current.errors.email).toBe('Blocked by the server');
  });

  it('useForm_ValidateAsync_ShouldResolveTrueWhenValid', async () => {
    const { result } = renderHook(() =>
      useForm({ initialValues: { email: 'alice@example.com' }, validate: async () => ({}) })
    );

    let valid = false;

    await act(async () => {
      valid = await result.current.validateAsync();
    });

    expect(valid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('useForm_Schema_ShouldOverrideRuleErrors', async () => {
    const schema = { validate: jest.fn(() => ({ email: 'Blocked by schema' })) };
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'not-an-email' },
        rules: {
          email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
        },
        schema
      })
    );

    await act(async () => {
      await result.current.validateAsync();
    });

    expect(schema.validate).toHaveBeenCalled();
    expect(result.current.errors.email).toBe('Blocked by schema');
  });

  it('useForm_Schema_ShouldSupportAsyncValidationOnSubmit', async () => {
    const onSubmit = jest.fn();
    const schema = { validate: jest.fn(async () => ({ email: 'Email not allowed' })) };
    const { result } = renderHook(() =>
      useForm({ initialValues: { email: 'alice@example.com' }, schema, onSubmit })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.email).toBe('Email not allowed');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

function AddressForm({ onSubmit = jest.fn() }: { onSubmit?: (values: unknown) => void }) {
  const form = useForm<FieldArrayValues>({
    initialValues: { tags: [], contacts: [] },
    rules: {
      tags: { required: true, message: 'Add at least one tag' },
      contacts: { required: true, message: 'Add at least one contact' }
    },
    onSubmit
  });
  const contacts = form.useFieldArray('contacts');

  return (
    <Form form={form} ariaLabel="Address form">
      <FormControl label="Contacts" error={form.errors.contacts}>
        {contacts.fields.map((contact, index) => (
          <div key={index}>
            <Input
              aria-label={`Contact ${index + 1}`}
              value={contact.email}
              onChange={(event) =>
                contacts.update(index, { ...contact, email: event.target.value })
              }
            />
            <Button type="button" onClick={() => contacts.remove(index)}>
              Remove contact {index + 1}
            </Button>
          </div>
        ))}
      </FormControl>

      <Button type="button" onClick={() => contacts.append({ email: '', label: 'Personal' })}>
        Add contact
      </Button>

      <Button type="submit">Save</Button>

      <span data-testid="contacts">{JSON.stringify(form.values.contacts)}</span>
      <span data-testid="touched">{JSON.stringify(form.touched)}</span>
    </Form>
  );
}

function AsyncRuleForm({ validateEmail }: { validateEmail: () => Promise<string | null> }) {
  const form = useForm({
    initialValues: { email: 'alice@example.com' },
    rules: { email: { validate: validateEmail } },
    onSubmit: jest.fn()
  });

  return (
    <Form form={form} ariaLabel="Async validation form">
      <FormControl label="Email" htmlFor="async-rule-email" error={form.errors.email}>
        <Input id="async-rule-email" {...form.getInputProps('email')} />
      </FormControl>

      <Button type="submit">Send</Button>

      <span data-testid="validating">{String(form.validating)}</span>
    </Form>
  );
}

describe('Form field arrays and async validation', () => {
  it('Form_FieldArray_ShouldAppendUpdateAndRemoveRows', async () => {
    const user = userEvent.setup();

    render(<AddressForm />);

    await user.click(screen.getByRole('button', { name: 'Add contact' }));

    expect(screen.getByLabelText('Contact 1')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Contact 1'), 'alice@example.com');

    expect(JSON.parse(screen.getByTestId('contacts').textContent as string)).toEqual([
      { email: 'alice@example.com', label: 'Personal' }
    ]);

    await user.click(screen.getByRole('button', { name: 'Remove contact 1' }));

    expect(screen.queryByLabelText('Contact 1')).not.toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId('contacts').textContent as string)).toEqual([]);
  });

  it('Form_FieldArray_ShouldMarkArrayAsTouched', async () => {
    const user = userEvent.setup();

    render(<AddressForm />);

    await user.click(screen.getByRole('button', { name: 'Add contact' }));

    expect(JSON.parse(screen.getByTestId('touched').textContent as string)).toEqual({
      contacts: true
    });
  });

  it('Form_AsyncRule_ShouldExposeValidatingAndRenderAsyncError', async () => {
    const user = userEvent.setup();
    const gate = createDeferred<string | null>();

    render(<AsyncRuleForm validateEmail={() => gate.promise} />);

    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByTestId('validating')).toHaveTextContent('true');
    expect(screen.getByRole('form', { name: 'Async validation form' })).toHaveAttribute(
      'aria-busy',
      'true'
    );

    await act(async () => {
      gate.resolve('Email already taken');
    });

    await waitFor(() =>
      expect(screen.getAllByText('Email already taken').length).toBeGreaterThan(0)
    );

    expect(screen.getByTestId('validating')).toHaveTextContent('false');
    expect(screen.getByRole('form', { name: 'Async validation form' })).not.toHaveAttribute(
      'aria-busy'
    );
  });

  it('Form_FieldArray_hasNoA11yViolations', async () => {
    const user = userEvent.setup();
    const { container } = render(<AddressForm />);

    await user.click(screen.getByRole('button', { name: 'Add contact' }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
