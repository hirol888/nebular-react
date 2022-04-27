import {
  NbCalendar,
  NbCalendarDayCell,
  NbCalendarMonthCell,
  NbCalendarYearCell,
  NbCard,
  NbCardBody,
  NbCardHeader,
  useDateService
} from '@nebular-react';
import React, { useState } from 'react';

const CalendarMinMax: React.FC = () => {
  const dateService = useDateService();
  const date = new Date();
  date.setDate(15);
  const min = dateService.addDays(date, -7);
  const max = dateService.addDays(date, 7);
  const [selectedDate, setSelectedDate] = useState<Date>(date);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <NbCard>
      <NbCardHeader>
        <h1 className="h5">Selected date: {selectedDate?.toLocaleDateString()}</h1>
      </NbCardHeader>
      <NbCardBody>
        <NbCalendar
          date={date}
          min={min}
          max={max}
          dateChange={handleDateChange}
          dayCellType={NbCalendarDayCell}
          monthCellType={NbCalendarMonthCell}
          yearCellType={NbCalendarYearCell}
        />
      </NbCardBody>
    </NbCard>
  );
};

export { CalendarMinMax };
