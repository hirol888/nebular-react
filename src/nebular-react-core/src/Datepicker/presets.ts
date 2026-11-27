import { Moment } from 'moment';
import { DateFns, DateType } from '@nebular-react/hooks';
import { DatePreset, DateRangePreset } from './types';

/**
 * Built-in presets for single-date pickers.
 */
export function createDatePresets<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  dateType: DateType = 'native',
  labels: { today?: string } = {}
): DatePreset<TDate>[] {
  return [
    {
      label: labels.today ?? 'Today',
      getValue: () => dateFns.today(dateType)
    }
  ];
}

/**
 * Built-in presets for range pickers.
 */
export function createRangePresets<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  dateType: DateType = 'native',
  labels: { today?: string; last7Days?: string; thisMonth?: string } = {}
): DateRangePreset<TDate>[] {
  const today = () => dateFns.today(dateType);

  return [
    {
      label: labels.today ?? 'Today',
      getValue: () => ({ start: today(), end: today() })
    },
    {
      label: labels.last7Days ?? 'Last 7 days',
      getValue: () => ({ start: dateFns.addDays(today(), -6), end: today() })
    },
    {
      label: labels.thisMonth ?? 'This month',
      getValue: () => ({ start: dateFns.getMonthStart(today()), end: today() })
    }
  ];
}
