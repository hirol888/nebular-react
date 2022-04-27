import React from 'react';
import {
  DEFAULT_LOCALE,
  NbCalendarCellProps,
  NbCalendarSize,
  NbCalendarViewModeValues,
  NbCalRange
} from '../calendar-kit';
import { NbBaseCalendar } from './BaseCalendar';

export type NbCalendarRangeProps = {
  locale?: string;
  range?: NbCalRange;
  min?: Date;
  max?: Date;
  filter?: (date: Date) => boolean;
  startView?: NbCalendarViewModeValues;
  boundingMonth?: boolean;
  visibleDate?: Date;
  showNavigation?: boolean;
  size?: NbCalendarSize;
  showWeekNumber?: boolean;
  weekNumberSymbol?: string;
  rangeChange?: (range: NbCalRange) => void;
  dayCellType?: React.FC<NbCalendarCellProps>;
  monthCellType?: React.FC<NbCalendarCellProps>;
  yearCellType?: React.FC<NbCalendarCellProps>;
};

const NbCalendarRange: React.FC<NbCalendarRangeProps> = ({
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
  yearCellType
}) => {
  return (
    <NbBaseCalendar
      locale={locale}
      date={range}
      dateChange={(range) => rangeChange && rangeChange(range as NbCalRange)}
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
      dayCellType={dayCellType}
      monthCellType={monthCellType}
      yearCellType={yearCellType}
    />
  );
};

export { NbCalendarRange };
