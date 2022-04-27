import classNames from 'classnames';
import React, { useContext } from 'react';
import { CalendarPickerContext, NbCalendarCellProps, NbCalRange, useDateService } from '../calendar-kit';

const NbCalendarRangeMonthCell: React.FC<NbCalendarCellProps> = ({ date, onSelect }) => {
  const { locale, size, selectedValue, min, max } = useContext(CalendarPickerContext);
  const dateService = useDateService(locale);

  const isSelected = (): boolean => {
    if (inRange()) {
      return true;
    }

    if (selectedValue) {
      return !!dateService.isSameMonthSafe(date, (selectedValue as NbCalRange).start);
    }

    return false;
  };

  const inRange = (): boolean => {
    if (hasRange()) {
      return isInRange(date, selectedValue as NbCalRange);
    }
    return false;
  };

  const hasRange = (): boolean => {
    return !!(selectedValue && (selectedValue as NbCalRange).start && (selectedValue as NbCalRange).end);
  };

  const isInRange = (date: Date | undefined, { start, end }: NbCalRange): boolean => {
    if (date && start && end) {
      const cellMonth = dateService.getMonthStart(date);
      const startMonth = dateService.getMonthStart(start);
      const endMonth = dateService.getMonthStart(end);

      const isGreaterThanStart = dateService.compareDates(cellMonth, startMonth) >= 0;
      const isLessThanEnd = dateService.compareDates(cellMonth, endMonth) <= 0;

      return isGreaterThanStart && isLessThanEnd;
    }

    return !!dateService.isSameMonthSafe(date, start);
  };

  const rangeStart = (): boolean => {
    if (hasRange()) {
      return !!dateService.isSameMonthSafe(date, (selectedValue as NbCalRange).start);
    }
    return false;
  };

  const rangeEnd = (): boolean => {
    if (hasRange()) {
      return !!dateService.isSameMonthSafe(date, (selectedValue as NbCalRange).end);
    }
    return false;
  };

  const isToday = (): boolean => {
    return !!dateService.isSameMonthSafe(date, dateService.today());
  };

  const isDisabled = (): boolean => {
    return smallerThanMin() || greaterThanMax();
  };

  const smallerThanMin = (): boolean => {
    return !!(date && min && dateService.compareDates(monthEnd(), min) < 0);
  };

  const greaterThanMax = (): boolean => {
    return !!(date && max && dateService.compareDates(monthStart(), max) > 0);
  };

  const monthStart = (): Date => {
    return dateService.getMonthStart(date!);
  };

  const monthEnd = (): Date => {
    return dateService.getMonthEnd(date!);
  };

  const month = dateService.getMonthName(date!);

  const handleClick = () => {
    if (isDisabled()) {
      return;
    }

    onSelect && onSelect(date!);
  };

  return (
    <div
      className={classNames('nb-calendar-range-month-cell', 'month-cell', 'range-cell', {
        selected: isSelected(),
        'in-range': inRange(),
        start: rangeStart(),
        end: rangeEnd(),
        today: isToday(),
        disabled: isDisabled(),
        'size-large': size === 'large'
      })}
      onClick={handleClick}
    >
      <div className="cell-content">{month}</div>
    </div>
  );
};

export { NbCalendarRangeMonthCell };
