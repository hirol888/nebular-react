import classNames from 'classnames';
import React, { Children, isValidElement, useEffect, useState } from 'react';
import { NbBadgePosition } from '../badge';
import { NbComponentOrCustomStatus } from '../component';
import { NbIconConfig } from '../icon';
import { NbTabTitle } from './TabTitle';

export type NbTabProps = {
  tabTitle?: string;
  tabId?: string;
  badgeDot?: boolean;
  tabIcon?: string | NbIconConfig;
  disabled?: boolean;
  responsive?: boolean;
  active?: boolean;
  lazyLoad?: boolean;
  badgeText?: string;
  badgeStatus?: NbComponentOrCustomStatus;
  badgePosition?: NbBadgePosition;
};

const NbTab: React.FC<NbTabProps & React.HTMLAttributes<HTMLDivElement>> = ({
  active = false,
  className,
  children
}) => {
  const [activeValue, setActiveValue] = useState<boolean>(active);

  useEffect(() => {
    setActiveValue(active);
  }, [active]);

  const content = Children.map(children, (child) => {
    if (!(isValidElement(child) && child.type === NbTabTitle)) {
      return child;
    }
    return null;
  });

  return (
    <div
      className={classNames('nb-tab', className, {
        'content-active': activeValue
      })}
    >
      {content}
    </div>
  );
};

export { NbTab };
