import { NbCard, NbCardBody, NbRangepicker } from '@nebular-react';
import './datepicker-example.scoped.scss';

export function RangepickerShowcase() {
  return (
    <NbCard size="large">
      <NbCardBody>
        <NbRangepicker<Date> placeholder="Pick Date Range" />
      </NbCardBody>
    </NbCard>
  );
}
