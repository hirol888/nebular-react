import classNames from 'classnames';
import React, { useContext } from 'react';
import { useDateService } from '../../hooks';
import { CalendarPickerContext } from '../../model';

export type NbCalendarCellProps = {
  date?: Date;
  onSelect?: (date: Date) => void;
};

const NbCalendarDayCell: React.FC<NbCalendarCellProps> = ({ date, onSelect }) => {
  const { locale, selectedValue, visibleDate, min, max, size, filter } = useContext(CalendarPickerContext);
  const dateService = useDateService(locale);
  const day = date && dateService.getDate(date);

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

  return (
    <div
      className={classNames('nb-calendar-day-cell', 'day-cell', {
        today: dateService.isSameDaySafe(date, dateService.today()),
        'bounding-month': !dateService.isSameMonthSafe(date, visibleDate),
        selected: dateService.isSameDaySafe(date, selectedValue as Date),
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

export { NbCalendarDayCell };
