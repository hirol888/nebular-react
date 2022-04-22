import { NbButtonGroup, NbButtonToggle, NbCard, NbCardBody } from '@nebular-react';
import React from 'react';
import './button-group-spacing.scoped.scss';

const ButtonGroupShapes: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-col">
        <NbButtonGroup shape="rectangle" status="primary">
          <NbButtonToggle id="ta">A</NbButtonToggle>
          <NbButtonToggle id="tb">B</NbButtonToggle>
          <NbButtonToggle id="tc">C</NbButtonToggle>
          <NbButtonToggle id="td">D</NbButtonToggle>
          <NbButtonToggle id="te">E</NbButtonToggle>
          <NbButtonToggle id="tf">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup shape="semi-round" status="primary">
          <NbButtonToggle id="sa">A</NbButtonToggle>
          <NbButtonToggle id="sb">B</NbButtonToggle>
          <NbButtonToggle id="sc">C</NbButtonToggle>
          <NbButtonToggle id="sd">D</NbButtonToggle>
          <NbButtonToggle id="se">E</NbButtonToggle>
          <NbButtonToggle id="sf">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup shape="round" status="primary">
          <NbButtonToggle id="ra">A</NbButtonToggle>
          <NbButtonToggle id="rb">B</NbButtonToggle>
          <NbButtonToggle id="rc">C</NbButtonToggle>
          <NbButtonToggle id="rd">D</NbButtonToggle>
          <NbButtonToggle id="re">E</NbButtonToggle>
          <NbButtonToggle id="rf">F</NbButtonToggle>
        </NbButtonGroup>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonGroupShapes };
