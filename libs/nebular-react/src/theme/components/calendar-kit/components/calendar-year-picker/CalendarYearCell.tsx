import classNames from 'classnames';
import React, { useContext } from 'react';
import { useDateService } from '../../hooks';
import { CalendarPickerContext } from '../../model';
import { NbCalendarCellProps } from '../calendar-day-picker';

const NbCalendarYearCell: React.FC<NbCalendarCellProps> = ({ date, onSelect }) => {
  const { locale, selectedValue, min, max, size } = useContext(CalendarPickerContext);
  const dateService = useDateService(locale);

  const smallerThanMin = (): boolean | undefined => {
    return date && min && dateService.compareDates(dateService.getYearEnd(date), min) < 0;
  };

  const greaterThanMax = (): boolean | undefined => {
    return date && max && dateService.compareDates(dateService.getYearStart(date), max) > 0;
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

  const year = dateService.getYear(date!);

  return (
    <div
      className={classNames('nb-calendar-year-cell', 'year-cell', {
        selected: dateService.isSameYearSafe(date, selectedValue as Date),
        today: dateService.isSameYearSafe(date, dateService.today()),
        disabled: isDisabled(),
        'size-large': size === 'large'
      })}
      onClick={handleClick}
    >
      <div className="cell-content">{year}</div>
    </div>
  );
};

export { NbCalendarYearCell };
