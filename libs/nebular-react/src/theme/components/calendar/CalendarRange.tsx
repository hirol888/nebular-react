import { Moment } from 'moment';
import React from 'react';
import {
  NbDateTypes,
  NbCalendarCellProps,
  NbCalendarSize,
  NbCalendarViewModeValues,
  NbCalRange,
  NbPickerType
} from '../calendar-kit';
import { DEFAULT_LOCALE } from '../calendar-kit/hooks/date-moment';
import { NbBaseCalendar } from './BaseCalendar';
import { NbCalendarRangeDayCell } from './CalendarRangeDayCell';
import { NbCalendarRangeMonthCell } from './CalendarRangeMonthCell';
import { NbCalendarRangeYearCell } from './CalendarRangeYearCell';

export type NbCalendarRangeProps<D extends Date | Moment> = {
  locale?: string;
  range?: NbCalRange<D>;
  min?: D;
  max?: D;
  filter?: (date: D) => boolean;
  startView?: NbCalendarViewModeValues;
  boundingMonth?: boolean;
  visibleDate?: D;
  showNavigation?: boolean;
  size?: NbCalendarSize;
  showWeekNumber?: boolean;
  weekNumberSymbol?: string;
  rangeChange?: (range: NbCalRange<D>) => void;
  dayCellType?: React.FC<NbCalendarCellProps<D>>;
  monthCellType?: React.FC<NbCalendarCellProps<D>>;
  yearCellType?: React.FC<NbCalendarCellProps<D>>;
  dateType?: NbDateTypes;
};

function NbCalendarRange<D extends Date | Moment>({
  locale = DEFAULT_LOCALE,
  range = { start: null, end: null },
  min,
  max,
  filter,
  startView = 'date',
  boundingMonth = true,
  visibleDate,
  showNavigation = true,
  size = 'medium',
  showWeekNumber = false,
  weekNumberSymbol = '#',
  rangeChange,
  dayCellType,
  monthCellType,
  yearCellType,
  dateType = NbDateTypes.Date
}: NbCalendarRangeProps<D>) {
  return (
    <NbBaseCalendar
      locale={locale}
      date={range}
      dateChange={(range) => rangeChange && rangeChange(range as NbCalRange<D>)}
      min={min}
      max={max}
      filter={filter}
      activeViewMode={startView}
      boundingMonth={boundingMonth}
      visibleDate={visibleDate}
      showNavigation={showNavigation}
      size={size}
      showWeekNumber={showWeekNumber}
      weekNumberSymbol={weekNumberSymbol}
      dayCellType={dayCellType ?? NbCalendarRangeDayCell}
      monthCellType={monthCellType ?? NbCalendarRangeMonthCell}
      yearCellType={yearCellType ?? NbCalendarRangeYearCell}
      dateType={dateType}
      pickerType={NbPickerType.Range}
    />
  );
}

export { NbCalendarRange };
