import React, { forwardRef, useId, useState } from 'react';
import { createStyles, useComponentDefaultProps, useNebularLocale } from '@nebular-react/styles';
import { Input } from '../Input';
import { FormControl } from '../FormControl';
import { Button } from '../Button';
import { CronVisualEditor } from './CronVisualEditor';

export type CronLocale = 'pt-BR' | 'en-US';

export interface CronPreset {
  key?: string;
  label: string;
  value: string;
}

export const CRON_PRESETS: CronPreset[] = [
  { key: 'everyMinute', label: 'Every minute', value: '* * * * *' },
  { key: 'everyHour', label: 'Every hour', value: '0 * * * *' },
  { key: 'daily', label: 'Daily at 09:00', value: '0 9 * * *' },
  { key: 'weekly', label: 'Weekly on Monday', value: '30 8 * * 1' },
  { key: 'monthly', label: 'Monthly on day 1', value: '0 0 1 * *' }
];

const useStyles = createStyles(() => ({
  presets: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--cron-input-presets-gap, 0.25rem)'
  }
}));

const FIELD_BOUNDS: Array<[number, number]> = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 7]
];

const isValidFieldPart = (part: string, bounds: [number, number]): boolean => {
  const [min, max] = bounds;

  if (part === '*') {
    return true;
  }

  const stepMatch = /^\*\/(\d+)$/.exec(part);

  if (stepMatch) {
    const step = Number(stepMatch[1]);

    return step >= 1 && step <= max;
  }

  const rangeMatch = /^(\d+)-(\d+)(?:\/(\d+))?$/.exec(part);

  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    const step = rangeMatch[3] === undefined ? undefined : Number(rangeMatch[3]);

    if (start < min || end > max || start > end) {
      return false;
    }

    return step === undefined || (step >= 1 && step <= max);
  }

  if (!/^\d+$/.test(part)) {
    return false;
  }

  const value = Number(part);

  return value >= min && value <= max;
};

const isValidField = (field: string, index: number): boolean =>
  field.split(',').every((part) => part.length > 0 && isValidFieldPart(part, FIELD_BOUNDS[index]));

/** Validates a five-field cron expression (`minute hour day month weekday`). */
export function isValidCron(expression: string | null | undefined): boolean {
  if (typeof expression !== 'string') {
    return false;
  }

  const fields = expression.trim().split(/\s+/);

  if (fields.length !== 5) {
    return false;
  }

  return fields.every((field, index) => isValidField(field, index));
}

const WEEKDAYS_PT: Array<{ article: string; name: string }> = [
  { article: 'Todo', name: 'domingo' },
  { article: 'Toda', name: 'segunda-feira' },
  { article: 'Toda', name: 'terça-feira' },
  { article: 'Toda', name: 'quarta-feira' },
  { article: 'Toda', name: 'quinta-feira' },
  { article: 'Toda', name: 'sexta-feira' },
  { article: 'Todo', name: 'sábado' }
];

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const isPlainNumber = (value: string): boolean => /^\d+$/.test(value);

const formatTime = (hour: string, minute: string): string =>
  `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

/** Returns a human readable description of a cron expression. */
export function describeCron(
  expression: string | null | undefined,
  locale: CronLocale = 'pt-BR'
): string {
  const text = typeof expression === 'string' ? expression.trim() : '';

  if (!isValidCron(text)) {
    return typeof expression === 'string' ? expression : '';
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = text.split(/\s+/);
  const isPortuguese = locale === 'pt-BR';
  const everyDay = dayOfMonth === '*' && month === '*' && dayOfWeek === '*';

  if (text === '* * * * *') {
    return isPortuguese ? 'A cada minuto' : 'Every minute';
  }

  const minuteStep = /^\*\/(\d+)$/.exec(minute);

  if (minuteStep && hour === '*' && everyDay) {
    const amount = Number(minuteStep[1]);

    if (amount === 1) {
      return isPortuguese ? 'A cada minuto' : 'Every minute';
    }

    return isPortuguese ? `A cada ${amount} minutos` : `Every ${amount} minutes`;
  }

  const hourStep = /^\*\/(\d+)$/.exec(hour);

  if (isPlainNumber(minute) && hourStep && everyDay) {
    const amount = Number(hourStep[1]);

    return isPortuguese ? `A cada ${amount} horas` : `Every ${amount} hours`;
  }

  if (isPlainNumber(minute) && isPlainNumber(hour)) {
    const time = formatTime(hour, minute);

    if (everyDay) {
      return isPortuguese ? `Todos os dias às ${time}` : `Every day at ${time}`;
    }

    if (dayOfMonth === '*' && month === '*' && isPlainNumber(dayOfWeek)) {
      const weekday = Number(dayOfWeek) % 7;

      if (isPortuguese) {
        const { article, name } = WEEKDAYS_PT[weekday];

        return `${article} ${name} às ${time}`;
      }

      return `Every ${WEEKDAYS_EN[weekday]} at ${time}`;
    }

    if (month === '*' && dayOfWeek === '*' && isPlainNumber(dayOfMonth)) {
      return isPortuguese
        ? `Todo mês no dia ${dayOfMonth} às ${time}`
        : `Every month on day ${dayOfMonth} at ${time}`;
    }
  }

  if (isPlainNumber(minute) && hour === '*' && everyDay) {
    if (minute === '0') {
      return isPortuguese ? 'A cada hora' : 'Every hour';
    }

    return isPortuguese
      ? `A cada hora aos ${minute.padStart(2, '0')} minutos`
      : `Every hour at minute ${minute.padStart(2, '0')}`;
  }

  return text;
}

export interface CronInputProps {
  /** Identifier of the cron input for labels and validation links. */
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  label?: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  withAsterisk?: boolean;
  ariaLabel?: string;
  /** Renders the shortcut buttons that fill the field with common expressions. */
  presets?: boolean;
  /** Replaces the default shortcut list. */
  presetItems?: CronPreset[];
  locale?: CronLocale;
  /** Adds controls for common schedules while retaining the editable cron string. */
  withVisualEditor?: boolean;
  /** Validate a nonempty expression. Return false or a custom error message for invalid input. */
  validate?(expression: string): boolean | string;
  /** Render caller-provided scheduling information for a valid, nonempty expression. */
  renderPreview?(expression: string): React.ReactNode;
}

const defaultProps: Partial<CronInputProps> = {
  presets: true
};

const INVALID_MESSAGES: Record<CronLocale, string> = {
  'pt-BR': 'Expressão cron inválida',
  'en-US': 'Invalid cron expression'
};

const _CronInput = forwardRef<HTMLInputElement, CronInputProps>((props, ref) => {
  const {
    id,
    value,
    defaultValue,
    onChange,
    label,
    description,
    error,
    disabled,
    required,
    withAsterisk,
    ariaLabel,
    presets,
    presetItems,
    locale: localeProp,
    withVisualEditor,
    validate,
    renderPreview
  } = useComponentDefaultProps(defaultProps, props);
  const { locale: providerLocale, hasLocale, t } = useNebularLocale();
  const locale: CronLocale =
    localeProp ?? (hasLocale && providerLocale.toLowerCase().startsWith('en') ? 'en-US' : 'pt-BR');
  const activePresets =
    presetItems ??
    CRON_PRESETS.map((preset) => ({
      ...preset,
      label: preset.key ? t(`cron.${preset.key}`, preset.label) : preset.label
    }));

  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '');
  const currentValue = value !== undefined ? value : internalValue;
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;

  const hasValue = currentValue.trim().length > 0;
  const validStandardExpression = hasValue && isValidCron(currentValue);
  const validation = hasValue ? (validate?.(currentValue) ?? validStandardExpression) : true;
  const validationMessage =
    validation === true
      ? undefined
      : (typeof validation === 'string' && validation) ||
        t('cron.invalid', INVALID_MESSAGES[locale]);
  const shownError = error ?? validationMessage;
  const describedBy = [description ? descriptionId : undefined, shownError ? errorId : undefined]
    .filter(Boolean)
    .join(' ');

  const commit = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    typeof onChange === 'function' && onChange(nextValue);
  };

  const { classes, cx } = useStyles();

  return (
    <FormControl
      label={label}
      description={description && <span id={descriptionId}>{description}</span>}
      required={required}
      withAsterisk={withAsterisk}
      htmlFor={inputId}
      error={shownError ? <span id={errorId}>{shownError}</span> : undefined}
    >
      <Input
        ref={ref}
        id={inputId}
        aria-label={ariaLabel}
        aria-invalid={shownError ? true : undefined}
        aria-describedby={describedBy || undefined}
        aria-required={required || undefined}
        disabled={disabled}
        value={currentValue}
        onChange={(event) => commit(event.target.value)}
      />

      {withVisualEditor && (
        <CronVisualEditor
          expression={currentValue}
          validStandardExpression={validStandardExpression}
          locale={locale}
          disabled={disabled}
          onChange={commit}
        />
      )}

      {presets && (
        <div className={cx(classes.presets)}>
          {activePresets.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              size="small"
              appearance="outline"
              disabled={disabled}
              onClick={() => commit(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}
      {hasValue && validation === true && !shownError && renderPreview?.(currentValue)}
    </FormControl>
  );
});

_CronInput.displayName = 'CronInput';

export { _CronInput as CronInput };
