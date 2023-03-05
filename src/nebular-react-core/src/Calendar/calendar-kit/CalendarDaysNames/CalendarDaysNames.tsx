import React from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { Moment } from 'moment';
import { useDateFns, useId } from '@nebular-react/hooks';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import { CalendarDay } from '../types';
import useStyles, { CalendarDaysNamesStylesParams } from './CalendarDaysNames.style';

export type CalendarDaysNamesStylesNames = Selectors<typeof useStyles>;

export interface CalendarDaysNamesProps
  extends DefaultProps<CalendarDaysNamesStylesNames, CalendarDaysNamesStylesParams> {}

function CalendarDaysNames<TDate extends Date | Moment = Date>(props: CalendarDaysNamesProps) {
  const { className, classNames, styles, unstyled, ...others } = props;
  const { locale, size } = useCalendarPickerContext<TDate>();
  const { classes, cx } = useStyles(
    { size },
    { name: 'calendar-days-names', classNames, styles, unstyled }
  );
  const dateFns = useDateFns<TDate>(locale);

  const days: CalendarDay[] = dateFns
    .getDayOfWeekNames()
    .map((name, index) => ({ name, isHoliday: index % 6 === 0 }));

  const uuid = useId();

  return (
    <div className={cx(classes.root, className, size)} {...others}>
      {days.map((day, index) => (
        <div
          key={`${uuid}-day-name-${index}`}
          className={cx(classes.day, {
            [classes.holiday]: day.isHoliday
          })}
        >
          {day.name}
        </div>
      ))}
    </div>
  );
}

CalendarDaysNames.displayName = '@nebular-react/core/CalendarDaysNames';

export { CalendarDaysNames };
