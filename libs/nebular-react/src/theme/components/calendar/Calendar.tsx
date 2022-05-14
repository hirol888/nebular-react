import { Moment } from 'moment';
import React from 'react';
import {
  NbDateTypes,
  NbCalendarCellProps,
  NbCalendarSize,
  NbCalendarViewModeValues,
  NbCalendarDayCell,
  NbCalendarMonthCell,
  NbCalendarYearCell
} from '../calendar-kit';
import { DEFAULT_LOCALE } from '../calendar-kit/hooks/date-moment';
import { NbBaseCalendar } from './BaseCalendar';

export type NbCalendarProps<D extends Date | Moment> = {
  locale?: string;
  boundingMonth?: boolean;
  startView?: NbCalendarViewModeValues;
  min?: D;
  max?: D;
  filter?: (date: D) => boolean;
  size?: NbCalendarSize;
  visibleDate?: D;
  showNavigation?: boolean;
  date?: D;
  showWeekNumber?: boolean;
  weekNumberSymbol?: string;
  dateChange?: (date: D) => void;
  dayCellType?: React.FC<NbCalendarCellProps<D>>;
  monthCellType?: React.FC<NbCalendarCellProps<D>>;
  yearCellType?: React.FC<NbCalendarCellProps<D>>;
  dateType?: NbDateTypes;
};

function NbCalendar<D extends Date | Moment>({
  locale = DEFAULT_LOCALE,
  boundingMonth = true,
  startView = 'date',
  min,
  max,
  filter,
  size = 'medium',
  visibleDate,
  showNavigation = true,
  date,
  showWeekNumber = false,
  weekNumberSymbol = '#',
  dateChange,
  dayCellType,
  monthCellType,
  yearCellType,
  dateType = NbDateTypes.Date
}: NbCalendarProps<D>) {
  return (
    <NbBaseCalendar
      locale={locale}
      boundingMonth={boundingMonth}
      activeViewMode={startView}
      date={date}
      min={min}
      max={max}
      filter={filter}
      size={size}
      visibleDate={visibleDate}
      showNavigation={showNavigation}
      showWeekNumber={showWeekNumber}
      weekNumberSymbol={weekNumberSymbol}
      dateChange={(date) => dateChange && dateChange(date as D)}
      dayCellType={dayCellType ?? NbCalendarDayCell}
      monthCellType={monthCellType ?? NbCalendarMonthCell}
      yearCellType={yearCellType ?? NbCalendarYearCell}
      dateType={dateType}
    />
  );
}

export { NbCalendar };
