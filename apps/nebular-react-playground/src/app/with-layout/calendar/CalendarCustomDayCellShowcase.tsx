import { NbCalendar, NbCalendarMonthCell, NbCalendarYearCell, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';
import React, { useState } from 'react';
import { CalendarCustomDayCell } from './components/CalendarCustomDayCell';

const CalendarCustomDayCellShowcase: React.FC = () => {
  const date = new Date();
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
          dateChange={handleDateChange}
          dayCellType={CalendarCustomDayCell}
          monthCellType={NbCalendarMonthCell}
          yearCellType={NbCalendarYearCell}
        />
      </NbCardBody>
    </NbCard>
  );
};

export { CalendarCustomDayCellShowcase };
