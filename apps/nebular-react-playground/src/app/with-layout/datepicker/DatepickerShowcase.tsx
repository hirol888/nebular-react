import { NbCard, NbCardBody, NbDatepicker } from '@nebular-react';
import './datepicker-example.scoped.scss';

export function DatepickerShowcase() {
  const date = new Date();
  return (
    <NbCard size="large">
      <NbCardBody>
        <NbDatepicker<Date> placeholder="Pick Date" date={date} />
      </NbCardBody>
    </NbCard>
  );
}
