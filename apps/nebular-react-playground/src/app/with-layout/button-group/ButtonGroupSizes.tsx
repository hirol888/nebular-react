import { NbButtonGroup, NbButtonToggle, NbCard, NbCardBody } from '@nebular-react';
import React from 'react';
import './button-group-spacing.scoped.scss';

const ButtonGroupSizes: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-col">
        <NbButtonGroup size="tiny" status="primary">
          <NbButtonToggle id="ta">A</NbButtonToggle>
          <NbButtonToggle id="tb">B</NbButtonToggle>
          <NbButtonToggle id="tc">C</NbButtonToggle>
          <NbButtonToggle id="td">D</NbButtonToggle>
          <NbButtonToggle id="te">E</NbButtonToggle>
          <NbButtonToggle id="tf">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup size="small" status="primary">
          <NbButtonToggle id="sa">A</NbButtonToggle>
          <NbButtonToggle id="sb">B</NbButtonToggle>
          <NbButtonToggle id="sc">C</NbButtonToggle>
          <NbButtonToggle id="sd">D</NbButtonToggle>
          <NbButtonToggle id="se">E</NbButtonToggle>
          <NbButtonToggle id="sf">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup size="medium" status="primary">
          <NbButtonToggle id="ma">A</NbButtonToggle>
          <NbButtonToggle id="mb">B</NbButtonToggle>
          <NbButtonToggle id="mc">C</NbButtonToggle>
          <NbButtonToggle id="md">D</NbButtonToggle>
          <NbButtonToggle id="me">E</NbButtonToggle>
          <NbButtonToggle id="mf">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup size="large" status="primary">
          <NbButtonToggle id="la">A</NbButtonToggle>
          <NbButtonToggle id="lb">B</NbButtonToggle>
          <NbButtonToggle id="lc">C</NbButtonToggle>
          <NbButtonToggle id="ld">D</NbButtonToggle>
          <NbButtonToggle id="le">E</NbButtonToggle>
          <NbButtonToggle id="lf">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup size="giant" status="primary">
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

export { ButtonGroupSizes };
