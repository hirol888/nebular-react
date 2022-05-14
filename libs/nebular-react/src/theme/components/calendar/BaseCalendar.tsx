import classNames from 'classnames';
import { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import {
  CalendarPickerContext,
  NbDateTypes,
  NbCalendarCellProps,
  NbCalendarDayPicker,
  NbCalendarMonthPicker,
  NbCalendarPageableNavigation,
  NbCalendarSize,
  NbCalendarViewMode,
  NbCalendarViewModeValues,
  NbCalendarYearPicker,
  NbCalRange,
  NbPickerType
} from '../calendar-kit';
import { useCalendarModelService, useDateService } from '../calendar-kit/hooks';
import { DEFAULT_LOCALE } from '../calendar-kit/hooks/date-moment';
import { NbCard, NbCardBody, NbCardHeader } from '../card';

export type NbBaseCalendarProps<D extends Date | Moment> = {
  locale?: string;
  boundingMonth?: boolean;
  activeViewMode?: NbCalendarViewModeValues;
  min?: D;
  max?: D;
  filter?: (date: D) => boolean;
  size?: NbCalendarSize;
  visibleDate?: D;
  date?: D | NbCalRange<D>;
  showNavigation?: boolean;
  showWeekNumber?: boolean;
  weekNumberSymbol?: string;
  dateChange?: (date: D | NbCalRange<D>) => void;
  dayCellType?: React.FC<NbCalendarCellProps<D>>;
  monthCellType?: React.FC<NbCalendarCellProps<D>>;
  yearCellType?: React.FC<NbCalendarCellProps<D>>;
  dateType?: NbDateTypes;
  pickerType?: NbPickerType;
};

function NbBaseCalendar<D extends Date | Moment>({
  locale = DEFAULT_LOCALE,
  boundingMonth = true,
  activeViewMode = 'date',
  min,
  max,
  filter,
  size = 'medium',
  visibleDate,
  date,
  showNavigation = true,
  showWeekNumber = false,
  weekNumberSymbol,
  dateChange,
  dayCellType,
  monthCellType,
  yearCellType,
  dateType = NbDateTypes.Date,
  pickerType = NbPickerType.Date
}: NbBaseCalendarProps<D>) {
  const dateService = useDateService(locale, dateType);
  const _visibleDate = visibleDate ?? (dateService.today() as D);
  const calendarModelService = useCalendarModelService(locale, dateType);
  const [activeViewModelValue, setActiveViewModelValue] = useState<NbCalendarViewModeValues>(activeViewMode);
  const [visibleDateValue, setVisibleDateValue] = useState<D>(_visibleDate);
  const [selectedValue, setSelectedValue] = useState<D | NbCalRange<D> | undefined>(date);

  const prevMonth = () => changeVisibleMonth(-1);
  const nextMonth = () => changeVisibleMonth(1);
  const prevYear = () => changeVisibleYear(-1);
  const nextYear = () => changeVisibleYear(1);
  const prevYears = () => changeVisibleYears(-1);
  const nextYears = () => changeVisibleYears(1);

  useEffect(() => {
    visibleDate && setVisibleDateValue(visibleDate);
  }, [visibleDate]);

  useEffect(() => {
    setSelectedValue(date);
  }, [date]);

  const changeVisibleMonth = (direction: number) => {
    const _visibleDate = dateService.addMonths(visibleDateValue, direction);
    setVisibleDateValue(_visibleDate as D);
  };

  const changeVisibleYear = (direction: number) => {
    const _visibleDate = dateService.addYears(visibleDateValue, direction);
    setVisibleDateValue(_visibleDate as D);
  };

  const changeVisibleYears = (direction: number) => {
    const _visibleDate = dateService.addYears(visibleDateValue, direction * calendarModelService.getYearsInView());
    setVisibleDateValue(_visibleDate as D);
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

  const handleDateChange = (_date: D) => {
    if (pickerType === NbPickerType.Date) {
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

  const handleMonthChange = (_date: D) => {
    setVisibleDateValue(_date);
    setActiveViewModelValue('date');
  };

  const handleYearChange = (_date: D) => {
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
    const { start, end } = selectedValue as NbCalRange<D>;
    return !!(start && !end);
  };

  const selectStart = (start: D) => {
    selectRange({ start });
  };

  const selectEnd = (date: D) => {
    const { start } = selectedValue as NbCalRange<D>;

    if (dateService.compareDates(date, start!) > 0) {
      selectRange({ start, end: date });
    } else {
      selectRange({ start: date, end: start });
    }
  };

  const selectRange = (range: NbCalRange<D>) => {
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
            yearCellType,
            dateType,
            pickerType
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
}

export { NbBaseCalendar };
