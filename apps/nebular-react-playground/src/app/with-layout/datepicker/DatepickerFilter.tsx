import { NbCard, NbCardBody, NbDatepicker } from '@nebular-react';
import './datepicker-example.scoped.scss';

export function DatepickerFilter() {
  const date = new Date();
  const filterFn = (date: Date) => date.getDay() === 0;

  return (
    <NbCard size="large">
      <NbCardBody>
        <NbDatepicker<Date> placeholder="Pick Date" date={date} filter={filterFn} />
      </NbCardBody>
    </NbCard>
  );
}
