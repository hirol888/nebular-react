import React, { useEffect, useState } from 'react';
import { Moment } from 'moment';
import { DEFAULT_LOCALE, useCalendar, useDateFns, useUncontrolled } from '@nebular-react/hooks';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import {
  CalendarDayPicker,
  CalendarMonthPicker,
  CalendarPageableNavigation,
  CalendarViewMode,
  CalendarViewModeType,
  CalendarYearPicker,
  DateRange
} from './calendar-kit';
import { Card } from '../Card';
import useStyles, { BaseCalendarStylesParams } from './BaseCalendar.style';
import { BaseCalendarProps, CalendarType } from './types';
import { CalendarPickerContext } from './calendar-kit/CalendarPicker.context';

export type BaseCalendarStylesNames = Selectors<typeof useStyles>;

export interface BaseCalendarComponentProps<TDate extends Date | Moment = Date>
  extends DefaultProps<BaseCalendarStylesNames, BaseCalendarStylesParams>,
    BaseCalendarProps<TDate> {
  activeViewMode?: CalendarViewModeType;
  date?: TDate | DateRange<TDate>;
  onDateChange?: (date: TDate | DateRange<TDate>) => void;
  calendarType: CalendarType;
}

const defaultProps: Partial<BaseCalendarComponentProps> = {
  locale: DEFAULT_LOCALE,
  boundingMonth: true,
  activeViewMode: 'date',
  size: 'medium',
  showNavigation: true,
  showWeekNumber: false,
  dateType: 'native'
};

function BaseCalendar<TDate extends Date | Moment>(props: BaseCalendarComponentProps<TDate>) {
  const {
    locale,
    boundingMonth,
    activeViewMode,
    min,
    max,
    filter,
    size,
    visibleDate,
    date,
    showNavigation,
    showWeekNumber,
    weekNumberSymbol,
    onDateChange,
    dayCellComponent,
    monthCellComponent,
    yearCellComponent,
    dateType,
    calendarType,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps<BaseCalendarComponentProps<TDate>>(
    defaultProps as BaseCalendarComponentProps<TDate>,
    props
  );
  const { classes, cx } = useStyles(
    { size },
    { name: 'base-calendar', classNames, styles, unstyled }
  );
  const dateFns = useDateFns<TDate>(locale);
  const calendarFns = useCalendar<TDate>(locale);
  const [activeViewModeValue, setActiveViewModeValue] =
    useState<CalendarViewModeType>(activeViewMode);
  const [visibleDateValue, setVisibleDateValue] = useState<TDate>(
    visibleDate ?? (dateFns.today(dateType) as TDate)
  );

  const [dateValue, setDateValue] = useUncontrolled<TDate | DateRange<TDate> | undefined>({
    value: date,
    defaultValue: undefined,
    finalValue: undefined,
    onChange: onDateChange
  });

  // const [selectedValue, setSelectedValue] = useState<TDate | DateRange<TDate> | undefined>(defaultDate);

  const prevMonth = () => changeVisibleMonth(-1);
  const nextMonth = () => changeVisibleMonth(1);
  const prevYear = () => changeVisibleYear(-1);
  const nextYear = () => changeVisibleYear(1);
  const prevYears = () => changeVisibleYears(-1);
  const nextYears = () => changeVisibleYears(1);

  useEffect(() => {
    visibleDate && setVisibleDateValue(visibleDate);
  }, [visibleDate]);

  const changeVisibleMonth = (direction: number) => {
    const _visibleDate = dateFns.addMonths(visibleDateValue, direction);
    setVisibleDateValue(_visibleDate as TDate);
  };

  const changeVisibleYear = (direction: number) => {
    const _visibleDate = dateFns.addYears(visibleDateValue, direction);
    setVisibleDateValue(_visibleDate as TDate);
  };

  const changeVisibleYears = (direction: number) => {
    const _visibleDate = dateFns.addYears(
      visibleDateValue,
      direction * calendarFns.getYearsInView()
    );
    setVisibleDateValue(_visibleDate as TDate);
  };

  const navigatePrev = () => {
    switch (activeViewModeValue) {
      case 'date':
        return prevMonth();
      case 'month':
        return prevYear();
      case 'year':
        return prevYears();
    }
  };

  const navigateNext = () => {
    switch (activeViewModeValue) {
      case 'date':
        return nextMonth();
      case 'month':
        return nextYear();
      case 'year':
        return nextYears();
    }
  };

  const handleDateChange = (_date: TDate) => {
    if (calendarType === 'date') {
      setDateValue(_date);
    } else if (selectionStarted()) {
      selectEnd(_date);
    } else {
      selectStart(_date);
    }
  };

  const handleMonthChange = (_date: TDate) => {
    setVisibleDateValue(_date);
    setActiveViewModeValue('date');
  };

  const handleYearChange = (_date: TDate) => {
    setVisibleDateValue(_date);
    setActiveViewModeValue('month');
  };

  const handleChangeMode = () => {
    if (activeViewModeValue === 'date') {
      setActiveViewModeValue('year');
    } else {
      setActiveViewModeValue('date');
    }
  };

  // #region range
  const selectionStarted = (): boolean => {
    if (!dateValue) {
      return false;
    }
    const { start, end } = dateValue as DateRange<TDate>;
    return !!(start && !end);
  };

  const selectStart = (start: TDate) => {
    selectRange({ start });
  };

  const selectEnd = (_date: TDate) => {
    const { start } = dateValue as DateRange<TDate>;

    if (dateFns.compareDates(_date, start!) > 0) {
      selectRange({ start, end: _date });
    } else {
      selectRange({ start: _date, end: start });
    }
  };

  const selectRange = (range: DateRange<TDate>) => {
    setDateValue(range);
  };
  // #endregion

  return (
    <div
      className={cx(classes.root, className, size, {
        'has-navigation': showNavigation,
        'has-week-number': showWeekNumber
      })}
      {...others}
    >
      <Card>
        {showNavigation && (
          <Card.Header className={cx(classes.calendarNavigation)}>
            <CalendarViewMode<TDate>
              date={visibleDateValue}
              viewMode={activeViewModeValue}
              onChangeMode={handleChangeMode}
            />
            <CalendarPageableNavigation prev={navigatePrev} next={navigateNext} />
          </Card.Header>
        )}
        <CalendarPickerContext.Provider
          value={{
            locale,
            min,
            max,
            filter,
            size,
            selectedValue: dateValue,
            visibleDate: visibleDateValue,
            onDateChange: handleDateChange,
            onMonthChange: handleMonthChange,
            onYearChange: handleYearChange,
            dayCellComponent,
            monthCellComponent,
            yearCellComponent,
            dateType
          }}
        >
          {activeViewModeValue === 'date' && (
            <Card.Body>
              <CalendarDayPicker<TDate>
                boundingMonths={boundingMonth}
                showWeekNumber={showWeekNumber}
                weekNumberSymbol={weekNumberSymbol}
                classNames={classNames}
                styles={styles}
                unstyled={unstyled}
              />
            </Card.Body>
          )}
          {activeViewModeValue === 'month' && (
            <CalendarMonthPicker<TDate>
              month={visibleDateValue}
              classNames={classNames}
              styles={styles}
              unstyled={unstyled}
            />
          )}
          {activeViewModeValue === 'year' && (
            <CalendarYearPicker<TDate>
              year={visibleDateValue}
              classNames={classNames}
              styles={styles}
              unstyled={unstyled}
            />
          )}
        </CalendarPickerContext.Provider>
      </Card>
    </div>
  );
}

BaseCalendar.displayName = '@nebular-react/core/BaseCalendar';

export { BaseCalendar };
