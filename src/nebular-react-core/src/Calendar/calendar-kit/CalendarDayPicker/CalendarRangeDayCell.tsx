import React from 'react';
import { Moment } from 'moment';
import { useDateFns } from '@nebular-react/hooks';
import { DateRange } from '../types';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import useStyles from './CalendarDayCell.style';
import { CalendarDayCellProps } from './CalendarDayCell.type';

function CalendarRangeDayCell<TDate extends Date | Moment = Date>(
  props: CalendarDayCellProps<TDate>
) {
  const { date, onSelect, className, classNames, styles, unstyled, ...others } = props;
  const {
    locale,
    size,
    selectedValue,
    min,
    max,
    filter,
    disabledDates,
    visibleDate,
    dateType,
    today
  } = useCalendarPickerContext<TDate>();
  const dateFns = useDateFns<TDate>(locale);
  const { classes, cx } = useStyles(
    { size },
    { name: 'calendar-range-day-cell', classNames, styles, unstyled }
  );

  const hasRange = (): boolean =>
    !!(
      selectedValue &&
      (selectedValue as DateRange<TDate>).start &&
      (selectedValue as DateRange<TDate>).end
    );

  const isInRange = (): boolean => {
    const range = selectedValue as DateRange<TDate>;

    if (date && hasRange() && range.start && range.end) {
      return (
        dateFns.compareDates(date, range.start) >= 0 && dateFns.compareDates(date, range.end) <= 0
      );
    }

    return false;
  };

  const start = (): boolean =>
    !!(date && hasRange() && dateFns.isSameDay(date, (selectedValue as DateRange<TDate>).start));

  const end = (): boolean =>
    !!(date && hasRange() && dateFns.isSameDay(date, (selectedValue as DateRange<TDate>).end));

  const isToday = (): boolean => !!dateFns.isSameDay(date, today ?? dateFns.today(dateType));

  const isBoundingMonth = (): boolean => !dateFns.isSameMonth(date, visibleDate);

  const isSelected = (): boolean => {
    if (isInRange()) {
      return true;
    }

    if (selectedValue) {
      const range = selectedValue as DateRange<TDate>;

      if (range.start) {
        return !!dateFns.isSameDay(date, range.start);
      }
    }

    return false;
  };

  const smallerThanMin = (): boolean => !!(date && min && dateFns.compareDates(date, min) < 0);

  const greaterThanMax = (): boolean => !!(date && max && dateFns.compareDates(date, max) > 0);

  const dontFitFilter = (): boolean => !!(date && filter && !filter(date));

  const isDisabledByList = (): boolean => {
    if (!date || !disabledDates) {
      return false;
    }

    return Array.isArray(disabledDates)
      ? disabledDates.some((disabledDate) => dateFns.isSameDay(date, disabledDate))
      : disabledDates(date);
  };

  const isDisabled = (): boolean =>
    smallerThanMin() || greaterThanMax() || dontFitFilter() || isDisabledByList();

  const handleClick = () => {
    if (isDisabled() || !date) {
      return;
    }

    onSelect && onSelect(date);
  };

  const day = date && dateFns.getDate(date);

  return (
    <div
      className={cx(classes.root, className, size, 'range-cell', 'day-cell', {
        'in-range': isInRange(),
        start: start(),
        end: end(),
        today: isToday(),
        'bounding-month': isBoundingMonth(),
        selected: isSelected(),
        empty: !date,
        disabled: isDisabled()
      })}
      onClick={handleClick}
      {...others}
    >
      <div className="cell-content">{day}</div>
    </div>
  );
}

CalendarRangeDayCell.displayName = 'CalendarRangeDayCell';

export { CalendarRangeDayCell };
