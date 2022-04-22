import { NbButton, NbButtonGroup, NbButtonToggle, NbCard, NbCardBody } from '@nebular-react';
import React from 'react';
import './button-group-spacing.scoped.scss';

const ButtonAndButtonToggleGroups: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody>
        <p>A group of buttons:</p>
        <NbButtonGroup>
          <NbButton>A</NbButton>
          <NbButton>B</NbButton>
          <NbButton>C</NbButton>
          <NbButton>D</NbButton>
          <NbButton>E</NbButton>
        </NbButtonGroup>

        <p>A group of button toggles:</p>
        <NbButtonGroup multiple status="primary">
          <NbButtonToggle id="a" pressed>
            A
          </NbButtonToggle>
          <NbButtonToggle id="b">B</NbButtonToggle>
          <NbButtonToggle id="c">C</NbButtonToggle>
          <NbButtonToggle id="d">D</NbButtonToggle>
          <NbButtonToggle id="e">E</NbButtonToggle>
        </NbButtonGroup>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonAndButtonToggleGroups };
