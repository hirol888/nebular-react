import classNames from 'classnames';
import React, { useState } from 'react';
import {
  CalendarPickerContext,
  DEFAULT_LOCALE,
  NbCalendarCellProps,
  NbCalendarDayPicker,
  NbCalendarMonthPicker,
  NbCalendarPageableNavigation,
  NbCalendarSize,
  NbCalendarViewMode,
  NbCalendarViewModeValues,
  NbCalendarYearPicker,
  NbCalRange,
  useCalendarModel,
  useDateService
} from '../calendar-kit';
import { NbCard, NbCardBody, NbCardHeader } from '../card';

export type NbBaseCalendarProps = {
  locale?: string;
  boundingMonth?: boolean;
  activeViewMode?: NbCalendarViewModeValues;
  min?: Date;
  max?: Date;
  filter?: (date: Date) => boolean;
  size?: NbCalendarSize;
  visibleDate?: Date;
  date: Date | NbCalRange;
  showNavigation?: boolean;
  showWeekNumber?: boolean;
  weekNumberSymbol?: string;
  dateChange?: (date: Date | NbCalRange) => void;
  dayCellType?: React.FC<NbCalendarCellProps>;
  monthCellType?: React.FC<NbCalendarCellProps>;
  yearCellType?: React.FC<NbCalendarCellProps>;
};

const NbBaseCalendar: React.FC<NbBaseCalendarProps> = ({
  locale = DEFAULT_LOCALE,
  boundingMonth = true,
  activeViewMode = 'date',
  min,
  max,
  filter,
  size = 'medium',
  visibleDate = new Date(),
  date,
  showNavigation = true,
  showWeekNumber = false,
  weekNumberSymbol,
  dateChange,
  dayCellType,
  monthCellType,
  yearCellType
}) => {
  const dateService = useDateService(locale);
  const calendarModel = useCalendarModel(locale);
  const [activeViewModelValue, setActiveViewModelValue] = useState<NbCalendarViewModeValues>(activeViewMode);
  const [visibleDateValue, setVisibleDateValue] = useState<Date>(visibleDate);
  const [selectedValue, setSelectedValue] = useState<Date | NbCalRange>(date);

  const prevMonth = () => changeVisibleMonth(-1);
  const nextMonth = () => changeVisibleMonth(1);
  const prevYear = () => changeVisibleYear(-1);
  const nextYear = () => changeVisibleYear(1);
  const prevYears = () => changeVisibleYears(-1);
  const nextYears = () => changeVisibleYears(1);

  const changeVisibleMonth = (direction: number) => {
    const _visibleDate = dateService.addMonths(visibleDateValue, direction);
    setVisibleDateValue(_visibleDate);
  };

  const changeVisibleYear = (direction: number) => {
    const _visibleDate = dateService.addYears(visibleDateValue, direction);
    setVisibleDateValue(_visibleDate);
  };

  const changeVisibleYears = (direction: number) => {
    const _visibleDate = dateService.addYears(visibleDateValue, direction * calendarModel.getYearsInView());
    setVisibleDateValue(_visibleDate);
  };

  const navigatePrev = () => {
    switch (activeViewModelValue) {
      case 'date':
        return prevMonth();
      case 'month':
        return prevYear();
      case 'year':
        return prevYears();
    }
  };

  const navigateNext = () => {
    switch (activeViewModelValue) {
      case 'date':
        return nextMonth();
      case 'month':
        return nextYear();
      case 'year':
        return nextYears();
    }
  };

  const handleDateChange = (_date: Date) => {
    if (date instanceof Date) {
      setSelectedValue(_date);
      dateChange && dateChange(_date);
    } else {
      if (selectionStarted()) {
        selectEnd(_date);
      } else {
        selectStart(_date);
      }
    }
  };

  const handleMonthChange = (_date: Date) => {
    setVisibleDateValue(_date);
    setActiveViewModelValue('date');
  };

  const handleYearChange = (_date: Date) => {
    setVisibleDateValue(_date);
    setActiveViewModelValue('month');
  };

  const handleChangeMode = () => {
    if (activeViewModelValue === 'date') {
      setActiveViewModelValue('year');
    } else {
      setActiveViewModelValue('date');
    }
  };

  // #region range
  const selectionStarted = (): boolean => {
    const { start, end } = selectedValue as NbCalRange;
    return !!(start && !end);
  };

  const selectStart = (start: Date) => {
    selectRange({ start });
  };

  const selectEnd = (date: Date) => {
    const { start } = selectedValue as NbCalRange;

    if (dateService.compareDates(date, start!) > 0) {
      selectRange({ start, end: date });
    } else {
      selectRange({ start: date, end: start });
    }
  };

  const selectRange = (range: NbCalRange) => {
    setSelectedValue(range);
    dateChange && dateChange(range);
  };
  // #endregion

  return (
    <div
      className={classNames('nb-base-calendar', {
        'has-navigation': showNavigation,
        'has-week-number': showWeekNumber,
        'size-large': size === 'large'
      })}
    >
      <NbCard>
        {showNavigation && (
          <NbCardHeader className="calendar-navigation">
            <NbCalendarViewMode date={visibleDateValue} viewMode={activeViewModelValue} changeMode={handleChangeMode} />
            <NbCalendarPageableNavigation prev={navigatePrev} next={navigateNext} />
          </NbCardHeader>
        )}
        <CalendarPickerContext.Provider
          value={{
            locale,
            min,
            max,
            filter,
            size,
            selectedValue,
            visibleDate: visibleDateValue,
            dateChange: handleDateChange,
            monthChange: handleMonthChange,
            yearChange: handleYearChange,
            dayCellType,
            monthCellType,
            yearCellType
          }}
        >
          {activeViewModelValue === 'date' && (
            <NbCardBody>
              <NbCalendarDayPicker
                boundingMonths={boundingMonth}
                showWeekNumber={showWeekNumber}
                weekNumberSymbol={weekNumberSymbol}
              />
            </NbCardBody>
          )}
          {activeViewModelValue === 'month' && <NbCalendarMonthPicker month={visibleDateValue} />}
          {activeViewModelValue === 'year' && <NbCalendarYearPicker year={visibleDateValue} />}
        </CalendarPickerContext.Provider>
      </NbCard>
    </div>
  );
};

export { NbBaseCalendar };
