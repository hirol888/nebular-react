import React, { useState } from 'react';
import moment, { Moment } from 'moment';
import { DEFAULT_LOCALE } from '@nebular-react/hooks';
import { Card } from '../../Card';
import { CalendarPickerContext } from './CalendarPicker.context';
import { CalendarMonthPicker } from './CalendarMonthPicker';
import { CalendarKitMonthCell } from './CalendarKitMonthCell';

export default { title: 'Calendar Kit' };

export function FullCalendar() {
  const month = moment();
  const [selectedValue, setSelectedValue] = useState<Moment>(month);

  const handleDateChange = (date: Moment) => {
    setSelectedValue(date);
  };

  return (
    <Card>
      <Card.Body>
        <CalendarPickerContext.Provider
          value={{
            locale: DEFAULT_LOCALE,
            selectedValue,
            visibleDate: month,
            onDateChange: handleDateChange,
            monthCellComponent: CalendarKitMonthCell,
            dateType: 'moment'
          }}
        >
          <CalendarMonthPicker<Moment> month={month} />
        </CalendarPickerContext.Provider>
      </Card.Body>
    </Card>
  );
}
