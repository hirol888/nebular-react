import classNames from 'classnames';
import React, { useContext } from 'react';
import { CalendarPickerContext, NbCalendarCellProps, NbCalRange, useDateService } from '../calendar-kit';

const NbCalendarRangeYearCell: React.FC<NbCalendarCellProps> = ({ date, onSelect }) => {
  const { locale, size, selectedValue, min, max } = useContext(CalendarPickerContext);
  const dateService = useDateService(locale);

  const inRange = (): boolean => {
    return hasRange() && isInRange(date, selectedValue as NbCalRange);
  };

  const hasRange = (): boolean => {
    return !!(selectedValue && (selectedValue as NbCalRange).start && (selectedValue as NbCalRange).end);
  };

  const isInRange = (date: Date | undefined, { start, end }: NbCalRange): boolean => {
    if (date && start && end) {
      const cellYear = dateService.getYear(date);
      const startYear = dateService.getYear(start);
      const endYear = dateService.getYear(end);

      return cellYear >= startYear && cellYear <= endYear;
    }

    return !!dateService.isSameYearSafe(date, start);
  };

  const rangeStart = (): boolean => {
    return hasRange() && !!dateService.isSameYearSafe(date, (selectedValue as NbCalRange).start);
  };

  const rangeEnd = (): boolean => {
    return hasRange() && !!dateService.isSameYearSafe(date, (selectedValue as NbCalRange).end);
  };

  const isSelected = (): boolean => {
    if (inRange()) {
      return true;
    }

    if (selectedValue) {
      return !!dateService.isSameYearSafe(date, (selectedValue as NbCalRange).start);
    }

    return false;
  };

  const isToday = (): boolean => {
    return !!dateService.isSameYearSafe(date, dateService.today());
  };

  const isDisabled = (): boolean => {
    return smallerThanMin() || greaterThanMax();
  };

  const smallerThanMin = (): boolean => {
    return !!(date && min && dateService.compareDates(yearEnd(), min) < 0);
  };

  const greaterThanMax = (): boolean => {
    return !!(date && max && dateService.compareDates(yearStart(), max) > 0);
  };

  const yearStart = (): Date => {
    return dateService.getYearStart(date!);
  };

  const yearEnd = (): Date => {
    return dateService.getYearEnd(date!);
  };

  const year = dateService.getYear(date!);

  const handleClick = () => {
    if (isDisabled()) {
      return;
    }

    onSelect && onSelect(date!);
  };

  return (
    <div
      className={classNames('nb-calendar-range-year-cell', 'year-cell', 'range-cell', {
        'in-range': inRange(),
        start: rangeStart(),
        end: rangeEnd(),
        selected: isSelected(),
        today: isToday(),
        disabled: isDisabled(),
        'size-large': size === 'large'
      })}
      onClick={handleClick}
    >
      <div className="cell-content">{year}</div>
    </div>
  );
};

export { NbCalendarRangeYearCell };
