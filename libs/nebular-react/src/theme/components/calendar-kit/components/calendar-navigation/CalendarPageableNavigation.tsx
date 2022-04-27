import { NbLayoutDirectionService } from 'libs/nebular-react/src/core/services';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import React from 'react';
import { NbButton } from '../../../button';
import { NbIcon } from '../../../icon';
import './calendar-pageable-navigation.scss';

export type NbCalendarPageableNavigationProps = {
  next?: () => void;
  prev?: () => void;
};

const NbCalendarPageableNavigation: React.FC<NbCalendarPageableNavigationProps> = ({ prev, next }) => {
  const directionService = useInjection<NbLayoutDirectionService>(TYPES.NbLayoutDirectionService);

  const isLtr = (): boolean => {
    return directionService.isLtr();
  };

  return (
    <div className="nb-calendar-pageable-navigation">
      <NbButton onClick={() => prev && prev()} appearance="ghost" status="basic" className="prev-month">
        <NbIcon icon={isLtr() ? 'chevron-left-outline' : 'chevron-right-outline'} pack="nebular-essentials"></NbIcon>
      </NbButton>
      <NbButton onClick={() => next && next()} appearance="ghost" status="basic" className="next-month">
        <NbIcon icon={isLtr() ? 'chevron-right-outline' : 'chevron-left-outline'} pack="nebular-essentials"></NbIcon>
      </NbButton>
    </div>
  );
};

export { NbCalendarPageableNavigation };
