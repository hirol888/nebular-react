import classNames from 'classnames';
import React, { useContext, useEffect, useState } from 'react';
import { useDateService } from '../../hooks';
import { CalendarPickerContext } from '../../model';
import * as _ from 'lodash';
import './calendar-week-number.scss';

export type NbCalendarWeekNumberProps = {
  data: (Date | null)[][];
  weekNumberSymbol?: string;
};

const NbCalendarWeekNumber: React.FC<NbCalendarWeekNumberProps> = ({ data, weekNumberSymbol }) => {
  const [weekNumbers, setWeekNumbers] = useState<number[]>([]);
  const { locale, size } = useContext(CalendarPickerContext);
  const dateService = useDateService(locale);

  useEffect(() => {
    const _weekNumbers = data.map((week: (Date | null)[]) => {
      const lastDay = [...week].reverse().find((day: Date | null) => !!day);
      return dateService.getWeekNumber(lastDay!);
    });

    _weekNumbers && setWeekNumbers(_weekNumbers);
  }, [data]);

  return (
    <div
      className={classNames('nb-calendar-week-numbers', {
        'size-large': size === 'large'
      })}
    >
      <div className="sign-container">
        <div className="sign">{weekNumberSymbol}</div>
      </div>
      {weekNumbers.map((weekNumber) => {
        return (
          <div key={_.uniqueId('week-number-')} className="week-number">
            {weekNumber}
          </div>
        );
      })}
    </div>
  );
};

export { NbCalendarWeekNumber };
