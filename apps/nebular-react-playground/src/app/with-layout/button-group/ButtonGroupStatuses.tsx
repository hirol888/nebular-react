import { NbButtonGroup, NbButtonToggle, NbCard, NbCardBody } from '@nebular-react';
import React from 'react';

const ButtonGroupStatuses: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-col">
        <NbButtonGroup status="primary" notPressedStatus="basic">
          <NbButtonToggle id="ba">A</NbButtonToggle>
          <NbButtonToggle id="bb">B</NbButtonToggle>
          <NbButtonToggle id="bc">C</NbButtonToggle>
          <NbButtonToggle id="bd">D</NbButtonToggle>
          <NbButtonToggle id="be">E</NbButtonToggle>
          <NbButtonToggle id="bf">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup status="primary" notPressedStatus="info">
          <NbButtonToggle id="pa">A</NbButtonToggle>
          <NbButtonToggle id="pb">B</NbButtonToggle>
          <NbButtonToggle id="pc">C</NbButtonToggle>
          <NbButtonToggle id="pd">D</NbButtonToggle>
          <NbButtonToggle id="pe">E</NbButtonToggle>
          <NbButtonToggle id="pf">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup status="success" notPressedStatus="danger">
          <NbButtonToggle id="sa">A</NbButtonToggle>
          <NbButtonToggle id="sb">B</NbButtonToggle>
          <NbButtonToggle id="sc">C</NbButtonToggle>
          <NbButtonToggle id="sd">D</NbButtonToggle>
          <NbButtonToggle id="se">E</NbButtonToggle>
          <NbButtonToggle id="sf">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup status="info" notPressedStatus="basic">
          <NbButtonToggle id="ia">A</NbButtonToggle>
          <NbButtonToggle id="ib">B</NbButtonToggle>
          <NbButtonToggle id="ic">C</NbButtonToggle>
          <NbButtonToggle id="id">D</NbButtonToggle>
          <NbButtonToggle id="ie">E</NbButtonToggle>
          <NbButtonToggle id="if">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup status="warning" notPressedStatus="success">
          <NbButtonToggle id="wa">A</NbButtonToggle>
          <NbButtonToggle id="wb">B</NbButtonToggle>
          <NbButtonToggle id="wc">C</NbButtonToggle>
          <NbButtonToggle id="wd">D</NbButtonToggle>
          <NbButtonToggle id="we">E</NbButtonToggle>
          <NbButtonToggle id="wf">F</NbButtonToggle>
        </NbButtonGroup>
        <NbButtonGroup status="danger" notPressedStatus="danger">
          <NbButtonToggle id="da">A</NbButtonToggle>
          <NbButtonToggle id="db">B</NbButtonToggle>
          <NbButtonToggle id="dc">C</NbButtonToggle>
          <NbButtonToggle id="dd">D</NbButtonToggle>
          <NbButtonToggle id="de">E</NbButtonToggle>
          <NbButtonToggle id="df">F</NbButtonToggle>
        </NbButtonGroup>
        <div className="control-status-example">
          <NbButtonGroup status="control" notPressedStatus="basic">
            <NbButtonToggle id="ca">A</NbButtonToggle>
            <NbButtonToggle id="cb">B</NbButtonToggle>
            <NbButtonToggle id="cc">C</NbButtonToggle>
            <NbButtonToggle id="cd">D</NbButtonToggle>
            <NbButtonToggle id="ce">E</NbButtonToggle>
            <NbButtonToggle id="cf">F</NbButtonToggle>
          </NbButtonGroup>
        </div>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonGroupStatuses };
