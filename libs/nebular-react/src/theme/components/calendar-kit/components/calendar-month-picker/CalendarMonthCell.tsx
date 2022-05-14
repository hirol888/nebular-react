import classNames from 'classnames';
import { Moment } from 'moment';
import { useDateService } from '../../hooks';
import { NbCalendarCellProps, useCalendarPickerContext } from '../../model';

function NbCalendarMonthCell<D extends Date | Moment>({ date, onSelect }: NbCalendarCellProps<D>) {
  const { locale, selectedValue, min, max, size, dateType } = useCalendarPickerContext<D>();
  const dateService = useDateService(locale, dateType);
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
        selected: dateService.isSameMonthSafe(date, selectedValue as D),
        today: dateService.isSameMonthSafe(date, dateService.today()),
        disabled: isDisabled(),
        'size-large': size === 'large'
      })}
      onClick={handleClick}
    >
      <div className="cell-content">{month}</div>
    </div>
  );
}

export { NbCalendarMonthCell };
