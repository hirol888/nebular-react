import classNames from 'classnames';
import React, { useContext } from 'react';
import { useDateService } from '../../hooks';
import { CalendarPickerContext } from '../../model';
import { NbCalendarCellProps } from '../calendar-day-picker';

const NbCalendarMonthCell: React.FC<NbCalendarCellProps> = ({ date, onSelect }) => {
  const { locale, selectedValue, min, max, size } = useContext(CalendarPickerContext);
  const dateService = useDateService(locale);
  const month = dateService.getMonthName(date!);

  const smallerThanMin = (): boolean | undefined => {
    return date && min && dateService.compareDates(dateService.getMonthEnd(date), min) < 0;
  };

  const greaterThanMax = (): boolean | undefined => {
    return date && max && dateService.compareDates(dateService.getMonthStart(date), max) > 0;
  };

  const isDisabled = (): boolean | undefined => {
    return smallerThanMin() || greaterThanMax();
  };

  const handleClick = () => {
    if (isDisabled()) {
      return;
    }

    onSelect && onSelect(date!);
  };

  return (
    <div
      className={classNames('nb-calendar-month-cell', 'month-cell', {
        selected: dateService.isSameMonthSafe(date, selectedValue as Date),
        today: dateService.isSameMonthSafe(date, dateService.today()),
        disabled: isDisabled(),
        'size-large': size === 'large'
      })}
      onClick={handleClick}
    >
      <div className="cell-content">{month}</div>
    </div>
  );
};

export { NbCalendarMonthCell };
