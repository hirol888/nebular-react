/* eslint-disable @typescript-eslint/no-explicit-any */
import { NbButtonGroup, NbButtonToggle, NbCard, NbCardBody } from '@nebular-react';
import React, { useState } from 'react';

const ButtonGroupValueChange: React.FC = () => {
  const [selectedSingleValue, setSelectedSingleValue] = useState<any[]>([]);
  const [selectedMultipleValues, setSelectedMultipleValues] = useState<any[]>([]);

  const singleValueChange = (values: any[]) => {
    setSelectedSingleValue(values);
  };

  const multipleValuesChange = (values: any[]) => {
    setSelectedMultipleValues(values);
  };

  return (
    <>
      <NbCard>
        <NbCardBody>
          <p>Group with single select value: {JSON.stringify(selectedSingleValue)}</p>
          <NbButtonGroup onPressedChange={(values) => singleValueChange(values)} status="primary">
            <NbButtonToggle id="s-one" value="One">
              One
            </NbButtonToggle>
            <NbButtonToggle id="s-two" value="Two">
              Two
            </NbButtonToggle>
            <NbButtonToggle id="s-three" value="Three">
              Three
            </NbButtonToggle>
          </NbButtonGroup>
        </NbCardBody>
      </NbCard>
      <NbCard>
        <NbCardBody>
          <p>Group with multiple select values: {JSON.stringify(selectedMultipleValues)}</p>
          <NbButtonGroup multiple onPressedChange={(values) => multipleValuesChange(values)} status="primary">
            <NbButtonToggle id="s-one" value="One">
              One
            </NbButtonToggle>
            <NbButtonToggle id="s-two" value="Two">
              Two
            </NbButtonToggle>
            <NbButtonToggle id="s-three" value="Three">
              Three
            </NbButtonToggle>
          </NbButtonGroup>
        </NbCardBody>
      </NbCard>
    </>
  );
};

export { ButtonGroupValueChange };
