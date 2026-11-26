import React, { useRef, useState } from 'react';

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export type MaybePromise<T> = T | Promise<T>;

export type FieldArrayItem<V> = V extends (infer I)[] ? I : never;

export interface FormSchema<T> {
  validate(values: T): MaybePromise<FormErrors<T>>;
}

export interface FormRule<T> {
  /** Rejects empty values (`''`, `null`, `undefined`, `false` and empty arrays). */
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  /** Message used when any of the built-in checks fails. */
  message?: string;
  validate?(value: unknown, values: T): MaybePromise<string | null | undefined>;
}

export interface UseFormOptions<T extends Record<string, unknown>> {
  initialValues: T;
  validate?(values: T): MaybePromise<FormErrors<T>>;
  schema?: FormSchema<T>;
  rules?: Partial<Record<keyof T, FormRule<T>>>;
  onSubmit?(values: T): void | Promise<void>;
  onSuccess?(): void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export type FormInputType = 'text' | 'checkbox' | 'number';

export interface UseFieldArrayReturn<T extends Record<string, unknown>, K extends keyof T> {
  fields: T[K] extends (infer I)[] ? I[] : never;
  append(item: FieldArrayItem<T[K]>): void;
  prepend(item: FieldArrayItem<T[K]>): void;
  insert(index: number, item: FieldArrayItem<T[K]>): void;
  remove(index: number): void;
  move(from: number, to: number): void;
  replace(items: FieldArrayItem<T[K]>[]): void;
  update(index: number, item: FieldArrayItem<T[K]>): void;
}

export interface UseFormReturn<T extends Record<string, unknown>> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  submitting: boolean;
  validating: boolean;
  isValid: boolean;
  setValue<K extends keyof T>(key: K, value: T[K]): void;
  setValues(values: Partial<T>): void;
  setError(key: keyof T, error?: string): void;
  reset(values?: T): void;
  validateField(key: keyof T): string | undefined;
  validateAsync(): Promise<boolean>;
  handleSubmit(event?: React.FormEvent, onSuccess?: () => void): Promise<void>;
  useFieldArray<K extends keyof T>(name: K): UseFieldArrayReturn<T, K>;
  getInputProps<K extends keyof T>(
    key: K,
    options?: { type?: FormInputType }
  ): Record<string, unknown>;
}

interface ValidationResult<T> {
  errors: FormErrors<T>;
  async: Promise<FormErrors<T>> | null;
}

const REQUIRED_MESSAGE = 'This field is required.';
const PATTERN_MESSAGE = 'Invalid format.';

const isPromiseLike = <V>(value: unknown): value is Promise<V> =>
  typeof value === 'object' && value !== null && typeof (value as Promise<V>).then === 'function';

const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === false) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
};

const toComparableNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const getLength = (value: unknown): number | undefined => {
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length;
  }

  return undefined;
};

const getRuleError = <T extends Record<string, unknown>>(
  value: unknown,
  rule?: FormRule<T>
): string | undefined => {
  if (!rule) {
    return undefined;
  }

  if (isEmptyValue(value)) {
    return rule.required ? (rule.message ?? REQUIRED_MESSAGE) : undefined;
  }

  if (typeof rule.minLength === 'number') {
    const length = getLength(value);

    if (length !== undefined && length < rule.minLength) {
      return rule.message ?? `Must be at least ${rule.minLength} characters.`;
    }
  }

  if (typeof rule.maxLength === 'number') {
    const length = getLength(value);

    if (length !== undefined && length > rule.maxLength) {
      return rule.message ?? `Must be at most ${rule.maxLength} characters.`;
    }
  }

  const numericValue = toComparableNumber(value);

  if (typeof rule.min === 'number' && numericValue !== undefined && numericValue < rule.min) {
    return rule.message ?? `Must be at least ${rule.min}.`;
  }

  if (typeof rule.max === 'number' && numericValue !== undefined && numericValue > rule.max) {
    return rule.message ?? `Must be at most ${rule.max}.`;
  }

  if (rule.pattern) {
    rule.pattern.lastIndex = 0;

    if (!rule.pattern.test(String(value))) {
      return rule.message ?? PATTERN_MESSAGE;
    }
  }

  return undefined;
};

const evaluateRule = <T extends Record<string, unknown>>(
  value: unknown,
  values: T,
  rule?: FormRule<T>
): MaybePromise<string | undefined> => {
  const ruleError = getRuleError(value, rule);

  if (ruleError) {
    return ruleError;
  }

  if (!rule || isEmptyValue(value) || typeof rule.validate !== 'function') {
    return undefined;
  }

  const customError = rule.validate(value, values);

  if (isPromiseLike<string | null | undefined>(customError)) {
    return customError.then((message) =>
      typeof message === 'string' && message.length > 0 ? message : undefined
    );
  }

  return typeof customError === 'string' && customError.length > 0 ? customError : undefined;
};

const mergeErrors = <T extends Record<string, unknown>>(
  target: FormErrors<T>,
  source?: FormErrors<T> | null
): void => {
  if (!source) {
    return;
  }

  (Object.keys(source) as Array<keyof T>).forEach((key) => {
    const message = source[key];

    if (message) {
      target[key] = message;
    }
  });
};

const cleanErrors = <T extends Record<string, unknown>>(errors: FormErrors<T>): FormErrors<T> => {
  const result: FormErrors<T> = {};

  mergeErrors(result, errors);

  return result;
};

export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validate,
    schema,
    rules,
    onSubmit,
    onSuccess,
    validateOnChange = true,
    validateOnBlur = true
  } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);

  const valuesRef = useRef<T>(initialValues);
  const initialValuesRef = useRef<T>(initialValues);
  initialValuesRef.current = initialValues;

  /**
   * Runs every configured validator lazily. While all validators are synchronous the whole
   * validation stays synchronous; as soon as one returns a promise the remaining validators are
   * awaited in order, preserving the precedence: rules -> validate -> schema.
   */
  const collectValidation = (nextValues: T): ValidationResult<T> => {
    const nextErrors: FormErrors<T> = {};
    const operations: Array<() => MaybePromise<FormErrors<T>>> = [];

    if (rules) {
      (Object.keys(rules) as Array<keyof T>).forEach((key) => {
        operations.push(() => {
          const ruleError = evaluateRule(nextValues[key], nextValues, rules[key]);

          if (isPromiseLike<string | undefined>(ruleError)) {
            return ruleError.then((message) =>
              message ? ({ [key]: message } as FormErrors<T>) : ({} as FormErrors<T>)
            );
          }

          return ruleError ? ({ [key]: ruleError } as FormErrors<T>) : ({} as FormErrors<T>);
        });
      });
    }

    if (typeof validate === 'function') {
      operations.push(() => validate(nextValues) ?? {});
    }

    if (schema) {
      operations.push(() => schema.validate(nextValues) ?? {});
    }

    for (let index = 0; index < operations.length; index += 1) {
      const result = operations[index]();

      if (isPromiseLike<FormErrors<T>>(result)) {
        const pendingErrors = operations.slice(index + 1).reduce<Promise<FormErrors<T>>>(
          (chain, operation) =>
            chain.then(async (accumulatedErrors) => {
              mergeErrors(accumulatedErrors, await operation());

              return accumulatedErrors;
            }),
          result.then((firstErrors) => {
            const accumulatedErrors: FormErrors<T> = { ...nextErrors };
            mergeErrors(accumulatedErrors, firstErrors);

            return accumulatedErrors;
          })
        );

        return {
          errors: nextErrors,
          async: pendingErrors.then((finalErrors) => ({ ...finalErrors }))
        };
      }

      mergeErrors(nextErrors, result);
    }

    return { errors: nextErrors, async: null };
  };

  const validateValues = (nextValues: T): FormErrors<T> => {
    const { errors: nextErrors, async: pendingErrors } = collectValidation(nextValues);

    pendingErrors?.catch(() => undefined);

    return { ...nextErrors };
  };

  const applyValues = (nextValues: T) => {
    valuesRef.current = nextValues;
    setValuesState(nextValues);
  };

  const applyError = (key: keyof T, message?: string) => {
    setErrorsState((previous) => {
      const nextErrors = { ...previous };

      if (message) {
        nextErrors[key] = message;
      } else {
        delete nextErrors[key];
      }

      return nextErrors;
    });
  };

  const markTouched = (key: keyof T) => {
    setTouchedState((previous) => ({ ...previous, [key]: true }));
  };

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    const nextValues = { ...valuesRef.current, [key]: value } as T;
    applyValues(nextValues);

    if (validateOnChange) {
      applyError(key, validateValues(nextValues)[key]);
    }
  };

  const setValues = (partialValues: Partial<T>) => {
    const nextValues = { ...valuesRef.current, ...partialValues } as T;
    applyValues(nextValues);

    if (validateOnChange) {
      const nextErrors = validateValues(nextValues);

      (Object.keys(partialValues) as Array<keyof T>).forEach((key) => {
        applyError(key, nextErrors[key]);
      });
    }
  };

  const setError = (key: keyof T, error?: string) => {
    applyError(key, error);
  };

  const reset = (nextValues?: T) => {
    applyValues(nextValues ?? initialValuesRef.current);
    setErrorsState({});
    setTouchedState({});
    setSubmitting(false);
    setValidating(false);
  };

  const validateField = (key: keyof T): string | undefined => {
    const message = validateValues(valuesRef.current)[key];
    applyError(key, message);

    return message;
  };

  const validateAsync = async (): Promise<boolean> => {
    const { errors: syncErrors, async: pendingErrors } = collectValidation(valuesRef.current);

    if (!pendingErrors) {
      const nextErrors = cleanErrors(syncErrors);
      setErrorsState(nextErrors);

      return Object.keys(nextErrors).length === 0;
    }

    setValidating(true);

    try {
      const nextErrors = cleanErrors(await pendingErrors);
      setErrorsState(nextErrors);

      return Object.keys(nextErrors).length === 0;
    } finally {
      setValidating(false);
    }
  };

  const submitValues = async (submittedValues: T, successCallback?: () => void) => {
    setSubmitting(true);

    try {
      if (typeof onSubmit === 'function') {
        await onSubmit(submittedValues);
      }

      (successCallback ?? onSuccess)?.();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (
    event?: React.FormEvent,
    successCallback?: () => void
  ): Promise<void> => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    const submittedValues = valuesRef.current;
    const nextTouched: Partial<Record<keyof T, boolean>> = {};

    (Object.keys(submittedValues) as Array<keyof T>).forEach((key) => {
      nextTouched[key] = true;
    });

    const { errors: syncErrors, async: pendingErrors } = collectValidation(submittedValues);

    if (!pendingErrors) {
      const nextErrors = cleanErrors(syncErrors);

      setErrorsState(nextErrors);
      setTouchedState(nextTouched);

      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      await submitValues(submittedValues, successCallback);

      return;
    }

    setValidating(true);

    try {
      const nextErrors = cleanErrors(await pendingErrors);

      setErrorsState(nextErrors);
      setTouchedState(nextTouched);

      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      await submitValues(submittedValues, successCallback);
    } finally {
      setValidating(false);
    }
  };

  const useFieldArray = <K extends keyof T>(name: K): UseFieldArrayReturn<T, K> => {
    const currentValue = valuesRef.current[name];
    const fields = (Array.isArray(currentValue) ? currentValue : []) as FieldArrayItem<T[K]>[];

    const readItems = (): FieldArrayItem<T[K]>[] => {
      const value = valuesRef.current[name];

      return Array.isArray(value) ? [...(value as FieldArrayItem<T[K]>[])] : [];
    };

    const commit = (nextItems: FieldArrayItem<T[K]>[]) => {
      const nextValues = { ...valuesRef.current, [name]: nextItems } as T;
      applyValues(nextValues);
      markTouched(name);

      if (validateOnChange) {
        applyError(name, validateValues(nextValues)[name]);
      }
    };

    return {
      fields: fields as unknown as UseFieldArrayReturn<T, K>['fields'],

      append: (item) => {
        commit([...readItems(), item]);
      },

      prepend: (item) => {
        commit([item, ...readItems()]);
      },

      insert: (index, item) => {
        const items = readItems();
        const position = Math.min(Math.max(index, 0), items.length);

        commit([...items.slice(0, position), item, ...items.slice(position)]);
      },

      remove: (index) => {
        const items = readItems();

        if (index < 0 || index >= items.length) {
          return;
        }

        commit(items.filter((_, itemIndex) => itemIndex !== index));
      },

      move: (from, to) => {
        const items = readItems();

        if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) {
          return;
        }

        const [movedItem] = items.splice(from, 1);
        items.splice(to, 0, movedItem);

        commit(items);
      },

      replace: (items) => {
        commit([...items]);
      },

      update: (index, item) => {
        const items = readItems();

        if (index < 0 || index >= items.length) {
          return;
        }

        items[index] = item;

        commit(items);
      }
    };
  };

  const getInputProps = (
    key: keyof T,
    inputOptions: { type?: FormInputType } = {}
  ): Record<string, unknown> => {
    const type = inputOptions.type ?? 'text';
    const error = errors[key];
    const errorId = `${String(key)}-error`;
    const value = values[key];

    const handleChange = (eventOrValue: unknown) => {
      let nextValue: unknown = eventOrValue;

      if (typeof eventOrValue === 'object' && eventOrValue !== null && 'target' in eventOrValue) {
        const { target } = eventOrValue as {
          target: { type?: string; value?: string; checked?: boolean };
        };

        if (target.type === 'checkbox') {
          nextValue = target.checked;
        } else if (type === 'number') {
          nextValue = target.value === '' ? '' : Number(target.value);
        } else {
          nextValue = target.value;
        }
      }

      setValue(key, nextValue as T[keyof T]);
    };

    const handleBlur = () => {
      markTouched(key);

      if (validateOnBlur) {
        validateField(key);
      }
    };

    const inputProps: Record<string, unknown> = {
      name: String(key),
      type,
      onChange: handleChange,
      onBlur: handleBlur,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? errorId : undefined
    };

    if (type === 'checkbox') {
      inputProps.checked = Boolean(value);
      inputProps.value = Boolean(value);
    } else {
      inputProps.value = value === null || value === undefined ? '' : value;
    }

    if (error) {
      inputProps.error = error;
    }

    return inputProps;
  };

  const derivedErrors = cleanErrors(validateValues(values));
  const isValid = Object.keys(errors).length === 0 && Object.keys(derivedErrors).length === 0;

  return {
    values,
    errors,
    touched,
    submitting,
    validating,
    isValid,
    setValue,
    setValues,
    setError,
    reset,
    validateField,
    validateAsync,
    handleSubmit,
    useFieldArray,
    getInputProps
  };
}
