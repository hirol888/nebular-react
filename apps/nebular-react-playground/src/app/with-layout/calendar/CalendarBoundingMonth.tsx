import { NbCalendar, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';
import React, { useState } from 'react';

const CalendarBoundingMonth: React.FC = () => {
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
        <NbCalendar<Date> date={date} boundingMonth={false} dateChange={handleDateChange} />
      </NbCardBody>
    </NbCard>
  );
};

export { CalendarBoundingMonth };
