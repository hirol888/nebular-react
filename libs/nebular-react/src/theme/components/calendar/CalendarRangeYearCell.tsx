import classNames from 'classnames';
import { Moment } from 'moment';
import { useCalendarPickerContext, NbCalendarCellProps, NbCalRange } from '../calendar-kit';
import { useDateService } from '../calendar-kit/hooks';

function NbCalendarRangeYearCell<D extends Date | Moment>({ date, onSelect }: NbCalendarCellProps<D>) {
  const { locale, size, selectedValue, min, max, dateType } = useCalendarPickerContext<D>();
  const dateService = useDateService(locale, dateType);

  const inRange = (): boolean => {
    return hasRange() && isInRange(date, selectedValue as NbCalRange<D>);
  };

  const hasRange = (): boolean => {
    return !!(selectedValue && (selectedValue as NbCalRange<D>).start && (selectedValue as NbCalRange<D>).end);
  };

  const isInRange = (date: D | undefined, { start, end }: NbCalRange<D>): boolean => {
    if (date && start && end) {
      const cellYear = dateService.getYear(date);
      const startYear = dateService.getYear(start);
      const endYear = dateService.getYear(end);

      return cellYear >= startYear && cellYear <= endYear;
    }

    return !!dateService.isSameYearSafe(date, start);
  };

  const rangeStart = (): boolean => {
    return hasRange() && !!dateService.isSameYearSafe(date, (selectedValue as NbCalRange<D>).start);
  };

  const rangeEnd = (): boolean => {
    return hasRange() && !!dateService.isSameYearSafe(date, (selectedValue as NbCalRange<D>).end);
  };

  const isSelected = (): boolean => {
    if (inRange()) {
      return true;
    }

    if (selectedValue) {
      return !!dateService.isSameYearSafe(date, (selectedValue as NbCalRange<D>).start);
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

  const yearStart = (): D => {
    return dateService.getYearStart(date!) as D;
  };

  const yearEnd = (): D => {
    return dateService.getYearEnd(date!) as D;
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
}

export { NbCalendarRangeYearCell };
