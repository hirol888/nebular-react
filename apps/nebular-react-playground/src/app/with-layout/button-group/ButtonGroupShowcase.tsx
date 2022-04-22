/* eslint-disable @typescript-eslint/no-explicit-any */
import { NbButtonGroup, NbButtonToggle, NbCard, NbCardBody } from '@nebular-react';
import React, { useState } from 'react';
import classNames from 'classnames';
import './button-group-showcase.scoped.scss';

const ButtonGroupShowcase: React.FC = () => {
  const [selectedClasses, setSelectedClasses] = useState<any[]>([]);

  const valueChange = (values: any[]) => {
    setSelectedClasses(values);
  };

  return (
    <NbCard>
      <NbCardBody>
        <NbButtonGroup multiple onPressedChange={(values) => valueChange(values)} status="primary">
          <NbButtonToggle id="isBold" value="subtitle">
            Bold
          </NbButtonToggle>
          <NbButtonToggle id="isItalic" className="text-italic" pressed value="text-italic">
            Italic
          </NbButtonToggle>
          <NbButtonToggle id="isUnderline" className="text-underline" value="text-underline">
            Underline
          </NbButtonToggle>
        </NbButtonGroup>

        <p
          className={classNames('text', {
            subtitle: selectedClasses.includes('subtitle'),
            'text-italic': selectedClasses.includes('text-italic'),
            'text-underline': selectedClasses.includes('text-underline')
          })}
        >
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
        </p>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonGroupShowcase };
