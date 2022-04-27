import classNames from 'classnames';
import React, { useContext, useLayoutEffect, useState } from 'react';
import { useCalendarModel } from '../../hooks';
import { CalendarPickerContext } from '../../model';
import { NbCalendarDaysNames } from '../calendar-days-names';
import { NbCalendarPicker } from '../calendar-picker';
import { NbCalendarWeekNumber } from '../calendar-week-number';
import { NbCalendarDayCell } from './CalendarDayCell';
import './calendar-day-picker.scss';

export type NbCalendarDayPickerProps = {
  boundingMonths?: boolean;
  showWeekNumber?: boolean;
  weekNumberSymbol?: string;
};

const NbCalendarDayPicker: React.FC<NbCalendarDayPickerProps> = ({
  boundingMonths = true,
  showWeekNumber = false,
  weekNumberSymbol
}) => {
  const { locale, visibleDate, size, dateChange, dayCellType } = useContext(CalendarPickerContext);
  const [weeks, setWeeks] = useState<(Date | null)[][]>([]);
  const calendarModel = useCalendarModel(locale);

  useLayoutEffect(() => {
    if (visibleDate || boundingMonths) {
      const _weeks = calendarModel.createDaysGrid(visibleDate!, boundingMonths);
      setWeeks(_weeks);
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
};

export { NbCalendarDayPicker };
