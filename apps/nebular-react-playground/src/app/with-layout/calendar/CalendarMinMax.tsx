import { NbCalendar, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';
import { useDateService } from 'libs/nebular-react/src/theme/components/calendar-kit/hooks';
import React, { useState } from 'react';

const CalendarMinMax: React.FC = () => {
  const dateService = useDateService();
  const date = new Date();
  date.setDate(15);
  const min = dateService.addDays(date, -7) as Date;
  const max = dateService.addDays(date, 7) as Date;
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
        <NbCalendar<Date> date={date} min={min} max={max} dateChange={handleDateChange} />
      </NbCardBody>
    </NbCard>
  );
};

export { CalendarMinMax };
