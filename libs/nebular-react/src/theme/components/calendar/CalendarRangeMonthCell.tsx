import classNames from 'classnames';
import { Moment } from 'moment';
import { useCalendarPickerContext, NbCalendarCellProps, NbCalRange } from '../calendar-kit';
import { useDateService } from '../calendar-kit/hooks';

function NbCalendarRangeMonthCell<D extends Date | Moment>({ date, onSelect }: NbCalendarCellProps<D>) {
  const { locale, size, selectedValue, min, max, dateType } = useCalendarPickerContext<D>();
  const dateService = useDateService(locale, dateType);

  const isSelected = (): boolean => {
    if (inRange()) {
      return true;
    }

    if (selectedValue) {
      return !!dateService.isSameMonthSafe(date, (selectedValue as NbCalRange<D>).start);
    }

    return false;
  };

  const inRange = (): boolean => {
    if (hasRange()) {
      return isInRange(date, selectedValue as NbCalRange<D>);
    }
    return false;
  };

  const hasRange = (): boolean => {
    return !!(selectedValue && (selectedValue as NbCalRange<D>).start && (selectedValue as NbCalRange<D>).end);
  };

  const isInRange = (date: D | undefined, { start, end }: NbCalRange<D>): boolean => {
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
      return !!dateService.isSameMonthSafe(date, (selectedValue as NbCalRange<D>).start);
    }
    return false;
  };

  const rangeEnd = (): boolean => {
    if (hasRange()) {
      return !!dateService.isSameMonthSafe(date, (selectedValue as NbCalRange<D>).end);
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

  const monthStart = (): D => {
    return dateService.getMonthStart(date!) as D;
  };

  const monthEnd = (): D => {
    return dateService.getMonthEnd(date!) as D;
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
}

export { NbCalendarRangeMonthCell };
