import React from 'react';
import { Moment } from 'moment';
import { useDateFns } from '@nebular-react/hooks';
import { DateRange } from '../types';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import useStyles from './CalendarMonthCell.style';
import { CalendarMonthCellProps } from './CalendarMonthCell.type';

function CalendarRangeMonthCell<TDate extends Date | Moment = Date>(
  props: CalendarMonthCellProps<TDate>
) {
  const { date, onSelect, className, classNames, styles, unstyled, ...others } = props;
  const { locale, size, selectedValue, min, max, dateType } = useCalendarPickerContext<TDate>();
  const dateFns = useDateFns<TDate>(locale);
  const { classes, cx } = useStyles(
    { size },
    { name: 'calendar-range-month-cell', classNames, styles, unstyled }
  );

  const isSelected = (): boolean => {
    if (inRange()) {
      return true;
    }

    if (selectedValue) {
      return !!dateFns.isSameMonth(date, (selectedValue as DateRange<TDate>).start);
    }

    return false;
  };

  const inRange = (): boolean => {
    if (hasRange()) {
      return isInRange(date, selectedValue as DateRange<TDate>);
    }
    return false;
  };

  const hasRange = (): boolean =>
    !!(
      selectedValue &&
      (selectedValue as DateRange<TDate>).start &&
      (selectedValue as DateRange<TDate>).end
    );

  const isInRange = (_date: TDate | undefined, { start, end }: DateRange<TDate>): boolean => {
    if (_date && start && end) {
      const cellMonth = dateFns.getMonthStart(_date);
      const startMonth = dateFns.getMonthStart(start);
      const endMonth = dateFns.getMonthStart(end);

      const isGreaterThanStart = dateFns.compareDates(cellMonth, startMonth) >= 0;
      const isLessThanEnd = dateFns.compareDates(cellMonth, endMonth) <= 0;

      return isGreaterThanStart && isLessThanEnd;
    }

    return !!dateFns.isSameMonth(_date, start);
  };

  const rangeStart = (): boolean => {
    if (hasRange()) {
      return !!dateFns.isSameMonth(date, (selectedValue as DateRange<TDate>).start);
    }
    return false;
  };

  const rangeEnd = (): boolean => {
    if (hasRange()) {
      return !!dateFns.isSameMonth(date, (selectedValue as DateRange<TDate>).end);
    }
    return false;
  };

  const isToday = (): boolean => !!dateFns.isSameMonth(date, dateFns.today(dateType));

  const isDisabled = (): boolean => smallerThanMin() || greaterThanMax();

  const smallerThanMin = (): boolean =>
    !!(date && min && dateFns.compareDates(monthEnd(), min) < 0);

  const greaterThanMax = (): boolean =>
    !!(date && max && dateFns.compareDates(monthStart(), max) > 0);

  const monthStart = (): TDate => dateFns.getMonthStart(date!) as TDate;

  const monthEnd = (): TDate => dateFns.getMonthEnd(date!) as TDate;

  const month = dateFns.getMonthName(date!);

  const handleClick = () => {
    if (isDisabled()) {
      return;
    }

    onSelect && onSelect(date!);
  };

  return (
    <div
      className={cx(classes.root, className, size, 'month-cell', 'range-cell', {
        selected: isSelected(),
        'in-range': inRange(),
        start: rangeStart(),
        end: rangeEnd(),
        today: isToday(),
        disabled: isDisabled()
      })}
      onClick={handleClick}
      {...others}
    >
      <div className="cell-content">{month}</div>
    </div>
  );
}

CalendarRangeMonthCell.displayName = '@nebular-react/core/CalendarRangeMonthCell';

export { CalendarRangeMonthCell };
