import { NbCalendarRange, NbCalRange, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';
import { useDateService } from 'libs/nebular-react/src/theme/components/calendar-kit/hooks';
import React, { useState } from 'react';

const CalendarRangeShowcase: React.FC = () => {
  const dateService = useDateService();
  const range: NbCalRange<Date> = {
    start: dateService.addDays(dateService.getMonthStart(new Date()), 3) as Date,
    end: dateService.addDays(dateService.getMonthEnd(new Date()), -3) as Date
  };
  const [selectedRange, setSelectedRange] = useState<NbCalRange<Date>>({ start: null, end: null });

  const handleRangeChange = (range: NbCalRange<Date>) => {
    setSelectedRange(range);
  };

  return (
    <NbCard>
      <NbCardHeader>
        <h1 className="h5">
          Selected range: {selectedRange.start?.toLocaleDateString()} - {selectedRange.end?.toLocaleDateString()}
        </h1>
      </NbCardHeader>
      <NbCardBody>
        <NbCalendarRange<Date> range={range} rangeChange={handleRangeChange} />
      </NbCardBody>
    </NbCard>
  );
};

export { CalendarRangeShowcase };
