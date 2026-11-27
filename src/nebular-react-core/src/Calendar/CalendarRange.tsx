import React from 'react';
import { Moment } from 'moment';
import { DefaultProps, useComponentDefaultProps } from '@nebular-react/styles';
import { DEFAULT_LOCALE } from '@nebular-react/hooks';
import {
  CalendarRangeDayCell,
  CalendarRangeMonthCell,
  CalendarRangeYearCell,
  CalendarViewModeType,
  DateRange
} from './calendar-kit';
import { BaseCalendarProps } from './types';
import { BaseCalendar } from './BaseCalendar';
import { useDefaultLocale } from '../Shared/hooks';

export interface CalendarRangeProps<TDate extends Date | Moment = Date>
  extends DefaultProps, BaseCalendarProps<TDate>, React.ComponentPropsWithoutRef<'div'> {
  range?: DateRange<TDate>;
  startView?: CalendarViewModeType;
  onRangeChange?: (range: DateRange<TDate>) => void;
}

const defaultProps: Partial<CalendarRangeProps> = {
  locale: DEFAULT_LOCALE,
  boundingMonth: true,
  startView: 'date',
  size: 'medium',
  showNavigation: true,
  showWeekNumber: false,
  weekNumberSymbol: '#',
  dateType: 'native'
};

function CalendarRange<TDate extends Date | Moment = Date>(props: CalendarRangeProps<TDate>) {
  const defaultLocale = useDefaultLocale(props.locale);
  const {
    locale,
    boundingMonth,
    startView,
    timeZone,
    min,
    max,
    filter,
    disabledDates,
    size,
    visibleDate,
    showNavigation,
    range,
    showWeekNumber,
    weekNumberSymbol,
    onRangeChange,
    dayCellComponent,
    monthCellComponent,
    yearCellComponent,
    dateType,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps<CalendarRangeProps<TDate>>(
    { ...(defaultProps as CalendarRangeProps<TDate>), locale: defaultLocale },
    props
  );

  return (
    <BaseCalendar<TDate>
      locale={locale}
      boundingMonth={boundingMonth}
      activeViewMode={startView}
      timeZone={timeZone}
      min={min}
      max={max}
      date={range}
      filter={filter}
      disabledDates={disabledDates}
      size={size}
      visibleDate={visibleDate}
      showNavigation={showNavigation}
      showWeekNumber={showWeekNumber}
      weekNumberSymbol={weekNumberSymbol}
      onDateChange={(_range) =>
        typeof onRangeChange === 'function' && onRangeChange(_range as DateRange<TDate>)
      }
      dayCellComponent={dayCellComponent ?? CalendarRangeDayCell}
      monthCellComponent={monthCellComponent ?? CalendarRangeMonthCell}
      yearCellComponent={yearCellComponent ?? CalendarRangeYearCell}
      classNames={classNames}
      styles={styles}
      unstyled={unstyled}
      calendarType="range"
      dateType={dateType}
      {...others}
    />
  );
}

CalendarRange.displayName = 'CalendarRange';

export { CalendarRange };
