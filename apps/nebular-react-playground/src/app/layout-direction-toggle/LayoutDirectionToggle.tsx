import {
  NbLayoutDirection,
  // TYPES,
  NbLayoutDirectionService
} from '@nebular-react';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import React from 'react';
import './LayoutDirectionToggle.scoped.scss';

const LayoutDirectionToggle: React.FC = () => {
  const layoutDirection = useInjection<NbLayoutDirectionService>(TYPES.NbLayoutDirectionService);

  const toggleFlow = () => {
    const oppositeDirection = layoutDirection.isRtl() ? NbLayoutDirection.LTR : NbLayoutDirection.RTL;
    layoutDirection.setDirection(oppositeDirection);
  };

  return (
    <label dir="ltr">
      <input type="checkbox" value={layoutDirection.isRtl().toString()} onClick={toggleFlow} />
      <span>RTL</span>
    </label>
  );
};

export { LayoutDirectionToggle };
