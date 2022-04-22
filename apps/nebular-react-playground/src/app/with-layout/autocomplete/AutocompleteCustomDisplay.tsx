import { NbAutocomplete, NbCard, NbCardBody, NbOption } from '@nebular-react';
import React, { useState } from 'react';
import * as _ from 'lodash';

const AutocompleteCustomDisplay: React.FC = () => {
  const initialOptions = ['Option 1', 'Option 2', 'Option 3'];
  const [options, setOptions] = useState<string[]>(initialOptions);

  const onChange = (value: string) => {
    const newOptions = initialOptions.filter((o) => o.toLowerCase().includes(value.toLowerCase()));
    setOptions(newOptions);
  };

  return (
    <NbCard size="small">
      <NbCardBody>
        <NbAutocomplete
          placeholder="Enter value"
          type="text"
          onChange={(event) => onChange(event as string)}
          displayFn={(value) => value.toUpperCase()}
        >
          {options.map((o) => {
            return <NbOption key={_.uniqueId('option-')} value={o} title={o}></NbOption>;
          })}
        </NbAutocomplete>
      </NbCardBody>
    </NbCard>
  );
};

export { AutocompleteCustomDisplay };
