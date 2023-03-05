import React from 'react';
import { Moment } from 'moment';
import { useDateFns } from '@nebular-react/hooks';
import { DateRange } from '../types';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import useStyles from './CalendarYearCell.style';
import { CalendarYearCellProps } from './CalendarYearCell.type';

function CalendarRangeYearCell<TDate extends Date | Moment = Date>(
  props: CalendarYearCellProps<TDate>
) {
  const { date, onSelect, className, classNames, styles, unstyled, ...others } = props;
  const { locale, size, selectedValue, min, max, dateType } = useCalendarPickerContext<TDate>();
  const dateFns = useDateFns<TDate>(locale);
  const { classes, cx } = useStyles(
    { size },
    { name: 'calendar-range-year-cell', classNames, styles, unstyled }
  );

  const inRange = (): boolean => hasRange() && isInRange(date, selectedValue as DateRange<TDate>);

  const hasRange = (): boolean =>
    !!(
      selectedValue &&
      (selectedValue as DateRange<TDate>).start &&
      (selectedValue as DateRange<TDate>).end
    );

  const isInRange = (_date: TDate | undefined, { start, end }: DateRange<TDate>): boolean => {
    if (_date && start && end) {
      const cellYear = dateFns.getYear(_date);
      const startYear = dateFns.getYear(start);
      const endYear = dateFns.getYear(end);

      return cellYear >= startYear && cellYear <= endYear;
    }

    return !!dateFns.isSameYear(_date, start);
  };

  const rangeStart = (): boolean =>
    hasRange() && !!dateFns.isSameYear(date, (selectedValue as DateRange<TDate>).start);

  const rangeEnd = (): boolean =>
    hasRange() && !!dateFns.isSameYear(date, (selectedValue as DateRange<TDate>).end);

  const isSelected = (): boolean => {
    if (inRange()) {
      return true;
    }

    if (selectedValue) {
      return !!dateFns.isSameYear(date, (selectedValue as DateRange<TDate>).start);
    }

    return false;
  };

  const isToday = (): boolean => !!dateFns.isSameYear(date, dateFns.today(dateType));

  const isDisabled = (): boolean => smallerThanMin() || greaterThanMax();

  const smallerThanMin = (): boolean => !!(date && min && dateFns.compareDates(yearEnd(), min) < 0);

  const greaterThanMax = (): boolean =>
    !!(date && max && dateFns.compareDates(yearStart(), max) > 0);

  const yearStart = (): TDate => dateFns.getYearStart(date!) as TDate;

  const yearEnd = (): TDate => dateFns.getYearEnd(date!) as TDate;

  const year = dateFns.getYear(date!);

  const handleClick = () => {
    if (isDisabled()) {
      return;
    }

    onSelect && onSelect(date!);
  };

  return (
    <div
      className={cx(classes.root, className, size, 'year-cell', 'range-cell', {
        'in-range': inRange(),
        start: rangeStart(),
        end: rangeEnd(),
        selected: isSelected(),
        today: isToday(),
        disabled: isDisabled()
      })}
      onClick={handleClick}
      {...others}
    >
      <div className="cell-content">{year}</div>
    </div>
  );
}

CalendarRangeYearCell.displayName = '@nebular-react/core/CalendarRangeYearCell';

export { CalendarRangeYearCell };
