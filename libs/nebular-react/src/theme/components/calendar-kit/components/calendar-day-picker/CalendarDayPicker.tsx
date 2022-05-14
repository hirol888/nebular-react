import classNames from 'classnames';
import { useLayoutEffect, useState } from 'react';
import { useCalendarPickerContext } from '../../model';
import { NbCalendarDaysNames } from '../calendar-days-names';
import { NbCalendarPicker } from '../calendar-picker';
import { NbCalendarWeekNumber } from '../calendar-week-number';
import { NbCalendarDayCell } from './CalendarDayCell';
import './calendar-day-picker.scss';
import { Moment } from 'moment';
import { useCalendarModelService } from '../../hooks';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type NbCalendarDayPickerProps<D> = {
  boundingMonths?: boolean;
  showWeekNumber?: boolean;
  weekNumberSymbol?: string;
};

function NbCalendarDayPicker<D extends Date | Moment>({
  boundingMonths = true,
  showWeekNumber = false,
  weekNumberSymbol
}: NbCalendarDayPickerProps<D>) {
  const { locale, visibleDate, size, dateChange, dayCellType, dateType } = useCalendarPickerContext<D>();
  const [weeks, setWeeks] = useState<(D | null)[][]>([]);
  const calendarModelService = useCalendarModelService(locale, dateType);

  useLayoutEffect(() => {
    if (visibleDate || boundingMonths) {
      const _weeks = calendarModelService.createDaysGrid(visibleDate!, boundingMonths);
      setWeeks(_weeks as D[][]);
    }
  }, [visibleDate, boundingMonths]);

  return (
    <div
      className={classNames('nb-calendar-day-picker', {
        'size-large': size === 'large'
      })}
    >
      {showWeekNumber && <NbCalendarWeekNumber weekNumberSymbol={weekNumberSymbol} data={weeks} />}
      <div className="days-container">
        <NbCalendarDaysNames />
        <NbCalendarPicker cellType={dayCellType ?? NbCalendarDayCell} data={weeks} onSelect={dateChange} />
      </div>
    </div>
  );
}

export { NbCalendarDayPicker };
