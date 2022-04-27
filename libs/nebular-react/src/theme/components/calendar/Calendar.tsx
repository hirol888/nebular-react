import React from 'react';
import { DEFAULT_LOCALE, NbCalendarCellProps, NbCalendarSize, NbCalendarViewModeValues } from '../calendar-kit';
import { NbBaseCalendar } from './BaseCalendar';

export type NbCalendarProps = {
  locale?: string;
  boundingMonth?: boolean;
  startView?: NbCalendarViewModeValues;
  min?: Date;
  max?: Date;
  filter?: (date: Date) => boolean;
  size?: NbCalendarSize;
  visibleDate?: Date;
  showNavigation?: boolean;
  date: Date;
  showWeekNumber?: boolean;
  weekNumberSymbol?: string;
  dateChange?: (date: Date) => void;
  dayCellType?: React.FC<NbCalendarCellProps>;
  monthCellType?: React.FC<NbCalendarCellProps>;
  yearCellType?: React.FC<NbCalendarCellProps>;
};

const NbCalendar: React.FC<NbCalendarProps> = ({
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
  yearCellType
}) => {
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
      dateChange={(date) => dateChange && dateChange(date as Date)}
      dayCellType={dayCellType}
      monthCellType={monthCellType}
      yearCellType={yearCellType}
    />
  );
};

export { NbCalendar };
