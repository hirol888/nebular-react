import { NbCard, NbCardBody, NbComponentStatus, NbRadio, NbRadioGroup } from '@nebular-react';
import classNames from 'classnames';
import './radio-statuses.scoped.scss';

export function RadioStatuses() {
  const statuses: NbComponentStatus[] = ['basic', 'primary', 'success', 'warning', 'danger', 'info', 'control'];
  const options = [
    { value: 'This is value 1', label: 'Option 1', checked: true },
    { value: 'This is value 2', label: 'Option 2' },
    { value: 'This is value 3', label: 'Option 3' },
    { value: 'This is value 4', label: 'Option 4', disabled: true }
  ];

  return (
    <NbCard>
      <NbCardBody className="example-items-rows">
        {statuses.map((s, index) => {
          return (
            <NbRadioGroup
              key={`radio-group-${index}`}
              name={`status-${index}`}
              status={s}
              className={classNames({
                'control-status-example': s === 'control'
              })}
            >
              {options.map((op, index) => {
                return (
                  <NbRadio
                    key={`radio-${index}`}
                    id={`radio-${index}`}
                    checked={op.checked}
                    disabled={op.disabled}
                    value={op.value}
                  >
                    {op.label}
                  </NbRadio>
                );
              })}
            </NbRadioGroup>
          );
        })}
      </NbCardBody>
    </NbCard>
  );
}
