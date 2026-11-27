import React, { useState } from 'react';
import { ExampleItemsCol } from '../Shared';
import { CronInput, describeCron, isValidCron } from './CronInput';

export default { title: 'CronInput', component: CronInput };

export function Showcase() {
  const [value, setValue] = useState('*/15 * * * *');

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <CronInput
        label="Schedule"
        description="Five-field cron expression (minute hour day month weekday)"
        withAsterisk
        value={value}
        onChange={setValue}
      />
      <span>Value: {value || '-'}</span>
    </ExampleItemsCol>
  );
}

export function WithPresets() {
  const [value, setValue] = useState('0 9 * * *');

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <CronInput label="Schedule" value={value} onChange={setValue} />
      <span>Value: {value || '-'}</span>
    </ExampleItemsCol>
  );
}

export function Invalid() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <CronInput label="Schedule" defaultValue="every day at noon" />
      <CronInput label="Disabled schedule" disabled defaultValue="0 9 * * *" presets={false} />
    </ExampleItemsCol>
  );
}

export function VisualReportSchedule() {
  const [value, setValue] = useState('0 9 * * 1,3');
  return (
    <CronInput
      label="Report schedule"
      locale="en-US"
      value={value}
      onChange={setValue}
      withVisualEditor
      presets={false}
    />
  );
}

export function PublicationScheduleWithCustomSyntax() {
  const weekdayExpression = '0 9 * * MON-FRI';
  return (
    <CronInput
      label="Expressão de publicação"
      description="Use números ou o atalho MON-FRI para dias úteis."
      defaultValue={weekdayExpression}
      withVisualEditor
      presets={false}
      validate={(value) => value === weekdayExpression || isValidCron(value)}
      renderPreview={(value) => (
        <p>{value === weekdayExpression ? 'Dias úteis às 09:00' : describeCron(value, 'pt-BR')}</p>
      )}
    />
  );
}
