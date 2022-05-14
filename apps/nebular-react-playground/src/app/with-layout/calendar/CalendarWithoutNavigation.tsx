import { NbCalendar, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';
import React, { useState } from 'react';

const CalendarWithoutNavigation: React.FC = () => {
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
        <NbCalendar<Date> date={date} showNavigation={false} showWeekNumber={true} dateChange={handleDateChange} />
      </NbCardBody>
    </NbCard>
  );
};

export { CalendarWithoutNavigation };
