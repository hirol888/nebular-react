import { NbCalendar, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';
import React, { useState } from 'react';

const CalendarFilter: React.FC = () => {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(date);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  const filter = (date: Date) => {
    return date.getDay() !== 0 && date.getDay() !== 6;
  };

  return (
    <NbCard>
      <NbCardHeader>
        <h1 className="h5">Selected date: {selectedDate?.toLocaleDateString()}</h1>
      </NbCardHeader>
      <NbCardBody>
        <NbCalendar<Date> date={date} filter={filter} dateChange={handleDateChange} />
      </NbCardBody>
    </NbCard>
  );
};

export { CalendarFilter };
