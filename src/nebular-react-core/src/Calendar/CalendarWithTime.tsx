import { Moment } from 'moment';
import React, { useState } from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import { DEFAULT_LOCALE, useDateFns, useCalendar } from '@nebular-react/hooks';
import { BaseCalendarProps } from './types';
import { CalendarActions, CalendarViewModeType } from './calendar-kit';
import { Card } from '../Card';
import { Calendar } from './Calendar';
import useStyles, { CalendarWithTimeStylesParams } from './CalendarWithTime.style';
import { TimeList, TimeListProps } from '../Timepicker/TimeList';

export type CalendarWithTimeStylesNames = Selectors<typeof useStyles>;

export interface CalendarWithTimeProps<TDate extends Date | Moment = Date>
  extends DefaultProps<CalendarWithTimeStylesNames, CalendarWithTimeStylesParams>,
    BaseCalendarProps<TDate>,
    React.ComponentPropsWithoutRef<'div'> {
  date?: TDate;
  startView?: CalendarViewModeType;
  onDateChange?: (date: TDate, close: boolean) => void;
  timeListProps?: Partial<Omit<TimeListProps<TDate>, 'showFooter'>>;
  timeListTitle?: string;
  opened?: boolean;
}

const defaultProps: Partial<CalendarWithTimeProps> = {
  locale: DEFAULT_LOCALE,
  boundingMonth: true,
  startView: 'date',
  size: 'medium',
  showNavigation: true,
  weekNumberSymbol: '#',
  showWeekNumber: false,
  dateType: 'native',
  timeListProps: {
    twelveHoursFormat: false
  },
  opened: false
};

function CalendarWithTime<TDate extends Date | Moment = Date>(props: CalendarWithTimeProps<TDate>) {
  const {
    locale,
    boundingMonth,
    startView,
    min,
    max,
    date,
    filter,
    size,
    visibleDate,
    showNavigation,
    weekNumberSymbol,
    showWeekNumber,
    dayCellComponent,
    monthCellComponent,
    yearCellComponent,
    dateType,
    timeListProps,
    timeListTitle,
    opened,
    onDateChange,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps<CalendarWithTimeProps<TDate>>(
    defaultProps as CalendarWithTimeProps<TDate>,
    props
  );
  const { classes, cx } = useStyles(
    { size },
    { name: 'calendar-with-time', classNames, styles, unstyled }
  );

  const dateFns = useDateFns<TDate>(locale);
  const calendarFns = useCalendar<TDate>(locale);

  const [dateValue, setDateValue] = useState<TDate>(
    date || (calendarFns.getResetTime(dateType) as TDate)
  );

  const handleDateChange = (_date: TDate) => {
    const hours = dateFns.getHours(dateValue);
    const minutes = dateFns.getMinutes(dateValue);
    const seconds = dateFns.getSeconds(dateValue);
    const milliseconds = dateFns.getMilliseconds(dateValue);

    let newDate = dateFns.setHours(_date, hours);
    newDate = dateFns.setMinutes(newDate, minutes);
    newDate = dateFns.setMinutes(newDate, minutes);
    newDate = dateFns.setSeconds(newDate, seconds);
    newDate = dateFns.setMilliseconds(newDate, milliseconds);

    setDateValue(newDate);
    typeof onDateChange === 'function' && onDateChange(newDate, false);
  };

  const handleTimeChange = (selectedTime: { time: TDate; save?: boolean }) => {
    let newDate = (
      dateType === 'moment'
        ? dateFns.clone(dateValue as Moment)
        : new Date((dateValue as Date).getTime())
    ) as TDate;

    newDate = dateFns.setHours(newDate, dateFns.getHours(selectedTime.time));
    newDate = dateFns.setMinutes(newDate, dateFns.getMinutes(selectedTime.time));
    newDate = dateFns.setSeconds(newDate, dateFns.getSeconds(selectedTime.time));
    newDate = dateFns.setMilliseconds(newDate, dateFns.getMilliseconds(selectedTime.time));

    setDateValue(newDate);
    typeof onDateChange === 'function' && onDateChange(newDate, false);
  };

  return (
    <Card className={cx(classes.root, className)}>
      <Card.Body className={cx(classes.pickerBody)}>
        <Calendar<TDate>
          boundingMonth={boundingMonth}
          startView={startView}
          date={dateValue}
          min={min}
          max={max}
          filter={filter}
          dayCellComponent={dayCellComponent}
          monthCellComponent={monthCellComponent}
          yearCellComponent={yearCellComponent}
          size={size}
          visibleDate={visibleDate}
          showNavigation={showNavigation}
          showWeekNumber={showWeekNumber}
          weekNumberSymbol={weekNumberSymbol}
          dateType={dateType}
          onDateChange={handleDateChange}
        />
        <div
          className={cx(classes.timepickerSection, {
            [classes.singleColumn]: timeListProps.singleColumn,
            [classes.multipleColumns]: !timeListProps.singleColumn
          })}
        >
          <div className={cx(classes.pickerTitle)}>{timeListTitle}</div>
          <TimeList<TDate>
            {...timeListProps}
            showFooter={false}
            date={dateValue}
            onSelectTime={handleTimeChange}
            opened={opened}
          />
        </div>
      </Card.Body>
      <Card.Footer className={cx(classes.pickerFooter)}>
        <CalendarActions
          saveValue={() => typeof onDateChange === 'function' && onDateChange(dateValue, true)}
          {...timeListProps.calendarActionsProps}
        />
      </Card.Footer>
    </Card>
  );
}

export { CalendarWithTime };
