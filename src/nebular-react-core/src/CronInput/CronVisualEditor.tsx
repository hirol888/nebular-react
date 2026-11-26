import React, { useId } from 'react';
import { createStyles } from '@nebular-react/styles';
import { Checkbox } from '../Checkbox';
import { Fieldset } from '../Fieldset';
import { FormControl } from '../FormControl';
import { Input } from '../Input';
import { NativeSelect } from '../NativeSelect';
import type { CronLocale } from './CronInput';

type Frequency = 'none' | 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';

interface CronFields {
  frequency: Frequency;
  interval: number;
  minute: number;
  hour: number;
  monthDay: number;
  weekDays: number[];
}

const initialFields: CronFields = {
  frequency: 'custom',
  interval: 1,
  minute: 0,
  hour: 9,
  monthDay: 1,
  weekDays: [1]
};

const labels = {
  'en-US': {
    legend: 'Visual schedule',
    frequency: 'Frequency',
    interval: 'Minute interval',
    minute: 'Minute of the hour',
    time: 'Time',
    monthDay: 'Day of the month',
    weekDays: 'Days of the week',
    custom: 'Edit the expression to change this schedule or choose a frequency to replace it.',
    frequencies: {
      none: 'No schedule',
      minutely: 'By minute',
      hourly: 'Hourly',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      custom: 'Custom expression'
    },
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  'pt-BR': {
    legend: 'Agendamento visual',
    frequency: 'Frequência',
    interval: 'Intervalo em minutos',
    minute: 'Minuto da hora',
    time: 'Horário',
    monthDay: 'Dia do mês',
    weekDays: 'Dias da semana',
    custom:
      'Edite a expressão para alterar o agendamento ou selecione uma frequência para substituí-lo.',
    frequencies: {
      none: 'Sem agendamento',
      minutely: 'Por minuto',
      hourly: 'A cada hora',
      daily: 'Diária',
      weekly: 'Semanal',
      monthly: 'Mensal',
      custom: 'Expressão personalizada'
    },
    days: [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ]
  }
};

const useStyles = createStyles(() => ({
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 10rem), 1fr))',
    gap: 'var(--cron-input-visual-gap, 0.75rem)'
  },
  days: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--cron-input-visual-gap, 0.75rem)'
  },
  hint: { color: 'var(--text-basic-color, #222b45)', margin: 0, fontSize: '0.875rem' }
}));

function parseFields(expression: string, valid: boolean): CronFields {
  if (expression.trim() === '') return { ...initialFields, frequency: 'none' };
  if (!valid) return initialFields;

  const [minute, hour, day, month, weekDay] = expression.trim().split(/\s+/);
  if (month !== '*') return initialFields;

  if (hour === '*' && day === '*' && weekDay === '*') {
    if (minute === '*') return { ...initialFields, frequency: 'minutely' };
    const step = /^\*\/(\d+)$/.exec(minute);
    if (step) return { ...initialFields, frequency: 'minutely', interval: Number(step[1]) };
    if (/^\d+$/.test(minute)) {
      return { ...initialFields, frequency: 'hourly', minute: Number(minute) };
    }
  }

  if (!/^\d+$/.test(hour) || !/^\d+$/.test(minute)) return initialFields;
  const time = { ...initialFields, hour: Number(hour), minute: Number(minute) };
  if (day === '*' && weekDay === '*') return { ...time, frequency: 'daily' };
  if (day === '*' && /^\d+(,\d+)*$/.test(weekDay)) {
    const weekDays = Array.from(new Set(weekDay.split(',').map((part) => Number(part) % 7)));
    return { ...time, frequency: 'weekly', weekDays };
  }
  if (weekDay === '*' && /^\d+$/.test(day)) {
    return { ...time, frequency: 'monthly', monthDay: Number(day) };
  }
  return initialFields;
}

function formatFields(fields: CronFields): string {
  const { frequency, interval, minute, hour, monthDay, weekDays } = fields;
  switch (frequency) {
    case 'minutely':
      return interval === 1 ? '* * * * *' : `*/${interval} * * * *`;
    case 'hourly':
      return `${minute} * * * *`;
    case 'daily':
      return `${minute} ${hour} * * *`;
    case 'weekly':
      return `${minute} ${hour} * * ${[...weekDays].sort((a, b) => a - b).join(',')}`;
    case 'monthly':
      return `${minute} ${hour} ${monthDay} * *`;
    default:
      return '';
  }
}

interface CronVisualEditorProps {
  expression: string;
  validStandardExpression: boolean;
  locale: CronLocale;
  disabled?: boolean;
  onChange(expression: string): void;
}

function CronVisualEditor(props: CronVisualEditorProps) {
  const { expression, validStandardExpression, locale, disabled, onChange } = props;
  const { classes } = useStyles();
  const text = labels[locale];
  const id = useId();
  const fields = parseFields(expression, validStandardExpression);
  const { frequency } = fields;
  const update = (next: Partial<CronFields>) => onChange(formatFields({ ...fields, ...next }));
  const usesTime = frequency === 'daily' || frequency === 'weekly' || frequency === 'monthly';
  const time = `${String(fields.hour).padStart(2, '0')}:${String(fields.minute).padStart(2, '0')}`;

  const numberControls = {
    minutely: { field: 'interval', label: text.interval, min: 1, max: 59 },
    hourly: { field: 'minute', label: text.minute, min: 0, max: 59 },
    monthly: { field: 'monthDay', label: text.monthDay, min: 1, max: 31 }
  } as const;
  const number =
    frequency === 'minutely' || frequency === 'hourly' || frequency === 'monthly'
      ? numberControls[frequency]
      : undefined;

  return (
    <Fieldset legend={text.legend} disabled={disabled}>
      <div className={classes.controls}>
        <NativeSelect
          label={text.frequency}
          value={frequency}
          data={Object.entries(text.frequencies)
            .filter(([key]) => key !== 'custom' || frequency === 'custom')
            .map(([key, label]) => ({ value: key, label, disabled: key === 'custom' }))}
          onChange={(next) => update({ frequency: next as Frequency })}
        />
        {usesTime && (
          <FormControl label={text.time} htmlFor={`${id}-time`}>
            <Input
              id={`${id}-time`}
              type="time"
              fullWidth
              value={time}
              onChange={(event) => {
                if (!event.currentTarget.value) return;
                const [hour, minute] = event.currentTarget.value.split(':').map(Number);
                update({ hour, minute });
              }}
            />
          </FormControl>
        )}
        {number && (
          <FormControl label={number.label} htmlFor={`${id}-${number.field}`}>
            <Input
              id={`${id}-${number.field}`}
              type="number"
              min={number.min}
              max={number.max}
              step={1}
              fullWidth
              value={fields[number.field]}
              onChange={(event) => {
                const next = event.currentTarget.valueAsNumber;
                if (Number.isInteger(next) && next >= number.min && next <= number.max) {
                  update({ [number.field]: next });
                }
              }}
            />
          </FormControl>
        )}
      </div>
      {frequency === 'custom' && <p className={classes.hint}>{text.custom}</p>}
      {frequency === 'weekly' && (
        <Fieldset legend={text.weekDays} withBorder={false}>
          <div className={classes.days}>
            {text.days.map((day, index) => {
              const checked = fields.weekDays.includes(index);
              return (
                <Checkbox
                  key={day}
                  checked={checked}
                  disabled={disabled || (checked && fields.weekDays.length === 1)}
                  onCheck={(next) =>
                    update({
                      weekDays: next
                        ? [...fields.weekDays, index]
                        : fields.weekDays.filter((entry) => entry !== index)
                    })
                  }
                >
                  {day}
                </Checkbox>
              );
            })}
          </div>
        </Fieldset>
      )}
    </Fieldset>
  );
}

export { CronVisualEditor };
