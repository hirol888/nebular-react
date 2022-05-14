import { CalendarPickerContext, NbCalendarMonthPicker, NbCard, NbCardBody } from '@nebular-react';
import React, { useState } from 'react';
import { CalendarKitMonthCell } from './CalendarKitMonthCell';

const CalendarKitFullCalendar: React.FC = () => {
  const month = new Date();
  const [selectedValue, setSelectedValue] = useState<Date>(month);

  const handleSelect = (date: Date) => {
    setSelectedValue(date);
  };

  return (
    <NbCard>
      <NbCardBody>
        <CalendarPickerContext.Provider
          value={{
            locale: 'en-US',
            selectedValue,
            visibleDate: month,
            dateChange: handleSelect,
            monthCellType: CalendarKitMonthCell
          }}
        >
          <NbCalendarMonthPicker<Date> month={month} />
        </CalendarPickerContext.Provider>
      </NbCardBody>
    </NbCard>
  );
};

export { CalendarKitFullCalendar };
