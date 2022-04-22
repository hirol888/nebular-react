import { NbButtonGroup, NbButtonToggle, NbCard, NbCardBody } from '@nebular-react';
import React from 'react';
import './button-group-spacing.scoped.scss';

const ButtonGroupAppearances: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-col">
        <NbButtonGroup appearance="filled" status="primary">
          <NbButtonToggle id="fa">A</NbButtonToggle>
          <NbButtonToggle id="fb">B</NbButtonToggle>
          <NbButtonToggle id="fc">C</NbButtonToggle>
          <NbButtonToggle id="fd">D</NbButtonToggle>
          <NbButtonToggle id="fe">E</NbButtonToggle>
          <NbButtonToggle id="ff">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup appearance="outline" status="primary">
          <NbButtonToggle id="oa">A</NbButtonToggle>
          <NbButtonToggle id="ob">B</NbButtonToggle>
          <NbButtonToggle id="oc">C</NbButtonToggle>
          <NbButtonToggle id="od">D</NbButtonToggle>
          <NbButtonToggle id="oe">E</NbButtonToggle>
          <NbButtonToggle id="of">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup appearance="ghost" status="primary">
          <NbButtonToggle id="ga">A</NbButtonToggle>
          <NbButtonToggle id="gb">B</NbButtonToggle>
          <NbButtonToggle id="gc">C</NbButtonToggle>
          <NbButtonToggle id="gd">D</NbButtonToggle>
          <NbButtonToggle id="ge">E</NbButtonToggle>
          <NbButtonToggle id="gf">F</NbButtonToggle>
        </NbButtonGroup>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonGroupAppearances };
