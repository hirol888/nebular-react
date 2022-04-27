import classNames from 'classnames';
import React, { useContext, useLayoutEffect, useState } from 'react';
import { useCalendarModel } from '../../hooks';
import { CalendarPickerContext } from '../../model';
import { NbCalendarPicker } from '../calendar-picker';
import { NbCalendarYearCell } from './CalendarYearCell';

export type NbCalendarYearPickerProps = {
  year: Date;
};

const NbCalendarYearPicker: React.FC<NbCalendarYearPickerProps> = ({ year }) => {
  const { size, yearChange, yearCellType } = useContext(CalendarPickerContext);
  const calendarModel = useCalendarModel();
  const [years, setYears] = useState<Date[][]>();

  useLayoutEffect(() => {
    const _years = calendarModel.getViewYears(year);
    setYears(_years);
  }, [year]);

  return (
    <div
      className={classNames('nb-calendar-year-picker', {
        'size-large': size === 'large'
      })}
    >
      <NbCalendarPicker cellType={yearCellType ?? NbCalendarYearCell} data={years} onSelect={yearChange} />
    </div>
  );
};

export { NbCalendarYearPicker };
