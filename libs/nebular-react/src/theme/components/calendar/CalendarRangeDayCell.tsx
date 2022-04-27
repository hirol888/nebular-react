import classNames from 'classnames';
import React, { useContext } from 'react';
import { CalendarPickerContext, NbCalendarCellProps, NbCalRange, useDateService } from '../calendar-kit';

const NbCalendarRangeDayCell: React.FC<NbCalendarCellProps> = ({ date, onSelect }) => {
  const { locale, size, selectedValue, min, max, filter, visibleDate } = useContext(CalendarPickerContext);
  const dateService = useDateService(locale);

  const hasRange = (): boolean => {
    return !!(selectedValue && (selectedValue as NbCalRange).start && (selectedValue as NbCalRange).end);
  };

  const isInRange = (): boolean => {
    if (date && hasRange()) {
      const isGreaterThanStart = dateService.compareDates(date, (selectedValue as NbCalRange).start!) >= 0;
      const isLessThanEnd = dateService.compareDates(date, (selectedValue as NbCalRange).end!) <= 0;

      return isGreaterThanStart && isLessThanEnd;
    }

    return false;
  };

  const start = (): boolean => {
    return !!(date && hasRange() && dateService.isSameDay(date, (selectedValue as NbCalRange).start!));
  };

  const end = (): boolean => {
    return !!(date && hasRange() && dateService.isSameDay(date, (selectedValue as NbCalRange).end!));
  };

  const isToday = (): boolean => {
    return !!(date && dateService.isSameDay(date, dateService.today()));
  };

  const isBoundingMonth = (): boolean => {
    return !dateService.isSameMonthSafe(date, visibleDate);
  };

  const isSelected = (): boolean => {
    if (isInRange()) {
      return true;
    }

    if (selectedValue) {
      return !!dateService.isSameDaySafe(date, (selectedValue as NbCalRange).start);
    }

    return false;
  };

  const smallerThanMin = (): boolean => {
    return !!(date && min && dateService.compareDates(date, min) < 0);
  };

  const greaterThanMax = (): boolean => {
    return !!(date && max && dateService.compareDates(date, max) > 0);
  };

  const dontFitFilter = (): boolean => {
    return !!(date && filter && !filter(date));
  };

  const isDisabled = (): boolean => {
    return smallerThanMin() || greaterThanMax() || dontFitFilter();
  };

  const handleClick = () => {
    if (isDisabled() || !date) {
      return;
    }

    onSelect && onSelect(date);
  };

  const day = date && dateService.getDate(date);

  return (
    <div
      className={classNames('nb-calendar-range-day-cell', 'range-cell', 'day-cell', {
        'in-range': isInRange(),
        start: start(),
        end: end(),
        today: isToday(),
        'bounding-month': isBoundingMonth(),
        selected: isSelected(),
        empty: !date,
        disabled: isDisabled(),
        'size-large': size === 'large'
      })}
      onClick={handleClick}
    >
      <div className="cell-content">{day}</div>
    </div>
  );
};

export { NbCalendarRangeDayCell };
