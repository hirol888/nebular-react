import { NbCard, NbCardBody, NbDatepicker, NbDateTypes, useDateService } from '@nebular-react';
import './datepicker-example.scoped.scss';

export function DatepickerValidation() {
  const date = new Date();
  const dateService = useDateService('en-US', NbDateTypes.Date);
  const min = dateService.addMonths(dateService.today(), -1) as Date;
  const max = dateService.addMonths(dateService.today(), 1) as Date;

  return (
    <NbCard size="large">
      <NbCardBody>
        <NbDatepicker<Date> placeholder="Pick Date" date={date} min={min} max={max} />
      </NbCardBody>
    </NbCard>
  );
}
