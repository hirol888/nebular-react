import React, { useState } from 'react';
import { RecordPicker } from './RecordPicker';
import type { RecordPickerRequest } from './RecordPicker';

export default { title: 'RecordPicker', component: RecordPicker };

const records = Array.from({ length: 23 }, (_item, index) => ({
  id: index + 1,
  name: `Workspace ${index + 1}`,
  location: index % 2 ? 'North' : 'South',
  archived: index === 3
}));

function searchRecords({ query, page, pageSize }: RecordPickerRequest) {
  const matching = records.filter(({ name, location }) =>
    `${name} ${location}`.toLowerCase().includes(query.toLowerCase())
  );
  const start = (page - 1) * pageSize;
  return { records: matching.slice(start, start + pageSize), total: matching.length };
}

export function PagedSelection() {
  const [value, setValue] = useState<readonly (typeof records)[number][]>([records[0]]);
  return (
    <RecordPicker
      multiple
      value={value}
      onChange={setValue}
      pageSize={5}
      searchRecords={searchRecords}
      getRecordId={(record) => record.id}
      getRecordLabel={(record) => record.name}
      isRecordDisabled={(record) => record.archived}
      columns={[
        { key: 'name', title: 'Workspace' },
        { key: 'location', title: 'Location' }
      ]}
    />
  );
}
