import React, { useRef } from 'react';
import { Moment } from 'moment';
import { useDateFns } from '@nebular-react/hooks';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import useStyles from './CalendarYearCell.style';
import { useCellTransition } from '../utils/use-cell-transition';
import { CalendarYearCellProps } from './CalendarYearCell.type';

function CalendarYearCell<TDate extends Date | Moment = Date>(props: CalendarYearCellProps<TDate>) {
  const { date, onSelect, className, classNames, styles, unstyled, ...others } = props;
  const { locale, selectedValue, min, max, size, dateType } = useCalendarPickerContext<TDate>();
  const { classes, cx } = useStyles(
    { size },
    {
      name: 'calendar-year-cell',
      classNames,
      styles,
      unstyled
    }
  );
  const dateFns = useDateFns<TDate>(locale);

  const smallerThanMin = (): boolean | undefined =>
    date && min && dateFns.compareDates(dateFns.getYearEnd(date), min) < 0;

  const greaterThanMax = (): boolean | undefined =>
    date && max && dateFns.compareDates(dateFns.getYearStart(date), max) > 0;

  const isDisabled = (): boolean | undefined => smallerThanMin() || greaterThanMax();

  const handleClick = () => {
    if (isDisabled()) {
      return;
    }

    onSelect && onSelect(date!);
  };

  const year = dateFns.getYear(date!);

  const cellRef = useRef<HTMLDivElement>(null);
  useCellTransition(date, cellRef);

  return (
    <div
      className={cx(classes.root, className, size, 'year-cell', {
        selected: dateFns.isSameYear(date, selectedValue as TDate),
        today: dateFns.isSameYear(date, dateFns.today(dateType)),
        disabled: isDisabled()
      })}
      onClick={handleClick}
      {...others}
    >
      <div className="cell-content" ref={cellRef}>
        {year}
      </div>
    </div>
  );
}

CalendarYearCell.displayName = '@nebular-react/core/CalendarYearCell';

export { CalendarYearCell };
