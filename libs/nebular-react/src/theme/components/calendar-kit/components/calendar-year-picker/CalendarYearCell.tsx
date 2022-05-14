import classNames from 'classnames';
import { Moment } from 'moment';
import { useDateService } from '../../hooks';
import { useCalendarPickerContext, NbCalendarCellProps } from '../../model';

function NbCalendarYearCell<D extends Date | Moment>({ date, onSelect }: NbCalendarCellProps<D>) {
  const { locale, selectedValue, min, max, size, dateType } = useCalendarPickerContext<D>();
  const dateService = useDateService(locale, dateType);

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
        selected: dateService.isSameYearSafe(date, selectedValue as D),
        today: dateService.isSameYearSafe(date, dateService.today()),
        disabled: isDisabled(),
        'size-large': size === 'large'
      })}
      onClick={handleClick}
    >
      <div className="cell-content">{year}</div>
    </div>
  );
}

export { NbCalendarYearCell };
