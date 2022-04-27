import React, { useContext } from 'react';
import { useMoment } from '../../hooks';
import { CalendarPickerContext, NbCalendarDay } from '../../model';
import classNames from 'classnames';
import * as _ from 'lodash';
import './calendar-days-names.scss';

const NbCalendarDaysNames: React.FC = () => {
  const momentDate = useMoment();
  const { size } = useContext(CalendarPickerContext);

  const days: NbCalendarDay[] = momentDate.getDayOfWeekNames().map((name, index) => {
    return { name: name, isHoliday: index % 6 === 0 };
  });

  return (
    <div
      className={classNames('nb-calendar-days-names', {
        'size-large': size === 'large'
      })}
    >
      {days.map((day) => {
        return (
          <div key={_.uniqueId('day-name-')} className={classNames('day', { holiday: day.isHoliday })}>
            {day.name}
          </div>
        );
      })}
    </div>
  );
};

export { NbCalendarDaysNames };
