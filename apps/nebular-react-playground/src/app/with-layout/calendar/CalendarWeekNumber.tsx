import {
  NbButton,
  NbCalendar,
  NbCalendarRange,
  NbCalendarSize,
  NbCalRange,
  NbCard,
  NbCardBody,
  NbCardHeader
} from '@nebular-react';
import { useDateService } from 'libs/nebular-react/src/theme/components/calendar-kit/hooks';
import React, { useState } from 'react';

const CalendarWeekNumber: React.FC = () => {
  const dateService = useDateService();
  const date = new Date();
  const range: NbCalRange<Date> = {
    start: dateService.addDays(date, -1) as Date,
    end: dateService.addDays(date, 1) as Date
  };
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const [size, setSize] = useState<NbCalendarSize>('medium');
  const [showWeekNumber, setShowWeekNumber] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<NbCalRange<Date>>(range);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleRangeChange = (range: NbCalRange<Date>) => {
    setSelectedRange(range);
  };

  const toggleWeekNumber = () => {
    setShowWeekNumber(!showWeekNumber);
  };

  const toggleSize = () => {
    const _size = size === 'medium' ? 'large' : 'medium';
    setSize(_size);
  };

  return (
    <NbCard>
      <NbCardHeader>
        <h1 className="h5">Selected date: {selectedDate?.toLocaleDateString()}</h1>
        <h1 className="h5">
          Selected range: {selectedRange.start?.toLocaleDateString()} - {selectedRange.end?.toLocaleDateString()}
        </h1>
      </NbCardHeader>
      <NbCardBody>
        <div className="example-items-rows">
          <NbButton onClick={toggleSize}>Change to {size === 'medium' ? 'large' : 'medium'}</NbButton>
          <NbButton onClick={toggleWeekNumber}>{showWeekNumber ? 'hide' : 'show'} week number column</NbButton>
        </div>
        <div className="example-items-rows">
          <NbCalendar<Date> date={date} showWeekNumber={showWeekNumber} size={size} dateChange={handleDateChange} />
          <NbCalendarRange<Date>
            range={range}
            showWeekNumber={showWeekNumber}
            size={size}
            rangeChange={handleRangeChange}
          />
        </div>
      </NbCardBody>
    </NbCard>
  );
};

export { CalendarWeekNumber };
