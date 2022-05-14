import classNames from 'classnames';
import { Moment } from 'moment';
import { useCalendarPickerContext, NbCalendarCellProps, NbCalRange } from '../calendar-kit';
import { useDateService } from '../calendar-kit/hooks';

function NbCalendarRangeDayCell<D extends Date | Moment>({ date, onSelect }: NbCalendarCellProps<D>) {
  const { locale, size, selectedValue, min, max, filter, visibleDate, dateType } = useCalendarPickerContext<D>();
  const dateService = useDateService(locale, dateType);

  const hasRange = (): boolean => {
    return !!(selectedValue && (selectedValue as NbCalRange<D>).start && (selectedValue as NbCalRange<D>).end);
  };

  const isInRange = (): boolean => {
    if (date && hasRange()) {
      const isGreaterThanStart = dateService.compareDates(date, (selectedValue as NbCalRange<D>).start!) >= 0;
      const isLessThanEnd = dateService.compareDates(date, (selectedValue as NbCalRange<D>).end!) <= 0;

      return isGreaterThanStart && isLessThanEnd;
    }

    return false;
  };

  const start = (): boolean => {
    return !!(date && hasRange() && dateService.isSameDay(date, (selectedValue as NbCalRange<D>).start!));
  };

  const end = (): boolean => {
    return !!(date && hasRange() && dateService.isSameDay(date, (selectedValue as NbCalRange<D>).end!));
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
      return !!dateService.isSameDaySafe(date, (selectedValue as NbCalRange<D>).start);
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
}

export { NbCalendarRangeDayCell };
