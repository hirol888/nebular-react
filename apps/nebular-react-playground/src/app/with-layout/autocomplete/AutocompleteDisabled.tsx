import { NbAutocomplete, NbButton, NbCard, NbCardBody, NbOption } from '@nebular-react';
import React, { useState } from 'react';
import * as _ from 'lodash';
import './autocomplete-disabled.scoped.scss';

const AutocompleteDisabled: React.FC = () => {
  const initialOptions = ['Option 1', 'Option 2', 'Option 3'];
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [disabled, setDisabled] = useState<boolean>(false);

  const onChange = (value: string) => {
    const newOptions = initialOptions.filter((o) => o.toLowerCase().includes(value.toLowerCase()));
    setOptions(newOptions);
  };

  const toggleDisabled = () => {
    setDisabled(!disabled);
  };

  return (
    <NbCard size="small">
      <NbCardBody className="example-items-col">
        <NbButton onClick={toggleDisabled}>Toggle disabled</NbButton>

        <label>
          <span className="label">
            Disabled: <i>{disabled.toString()}</i>
          </span>

          <NbAutocomplete
            placeholder="Enter value"
            type="text"
            onChange={(event) => onChange(event as string)}
            disabled={disabled}
          >
            {options.map((o) => {
              return <NbOption key={_.uniqueId('option-')} value={o} title={o}></NbOption>;
            })}
          </NbAutocomplete>
        </label>
      </NbCardBody>
    </NbCard>
  );
};

export { AutocompleteDisabled };
