import React from 'react';
import { Moment } from 'moment';
import { DEFAULT_LOCALE } from '@nebular-react/hooks';
import { DefaultProps, useComponentDefaultProps } from '@nebular-react/styles';
import { BaseCalendar } from './BaseCalendar';
import { BaseCalendarProps } from './types';
import { CalendarViewModeType } from './calendar-kit';

export interface CalendarProps<TDate extends Date | Moment = Date>
  extends DefaultProps,
    BaseCalendarProps<TDate>,
    React.ComponentPropsWithoutRef<'div'> {
  date?: TDate;
  startView?: CalendarViewModeType;
  onDateChange?: (date: TDate) => void;
}

const defaultProps: Partial<CalendarProps> = {
  locale: DEFAULT_LOCALE,
  boundingMonth: true,
  startView: 'date',
  size: 'medium',
  showNavigation: true,
  showWeekNumber: false,
  weekNumberSymbol: '#',
  dateType: 'native'
};

function Calendar<TDate extends Date | Moment = Date>(props: CalendarProps<TDate>) {
  const {
    locale,
    boundingMonth,
    startView,
    min,
    max,
    filter,
    size,
    visibleDate,
    showNavigation,
    date,
    showWeekNumber,
    weekNumberSymbol,
    onDateChange,
    dayCellComponent,
    monthCellComponent,
    yearCellComponent,
    dateType,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps<CalendarProps<TDate>>(defaultProps as CalendarProps<TDate>, props);

  return (
    <BaseCalendar<TDate>
      locale={locale}
      boundingMonth={boundingMonth}
      activeViewMode={startView}
      min={min}
      max={max}
      date={date}
      filter={filter}
      size={size}
      visibleDate={visibleDate}
      showNavigation={showNavigation}
      showWeekNumber={showWeekNumber}
      weekNumberSymbol={weekNumberSymbol}
      onDateChange={(_date) => typeof onDateChange === 'function' && onDateChange(_date as TDate)}
      dayCellComponent={dayCellComponent}
      monthCellComponent={monthCellComponent}
      yearCellComponent={yearCellComponent}
      classNames={classNames}
      styles={styles}
      unstyled={unstyled}
      calendarType="date"
      dateType={dateType}
      {...others}
    />
  );
}

Calendar.displayName = '@nebular-react/core/Calendar';

export { Calendar };
