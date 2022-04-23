/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import classNames from 'classnames';
import React, { useContext } from 'react';
import { useSpring, easings, animated } from 'react-spring';
import { NbIcon } from '../icon';
import './accordion-item-header.scoped.scss';
import { AccordionItemContext } from './Accordion.context';

/**
 * Component intended to be used within `<NbAccordionItem>` component
 */
const NbAccordionItemHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...otherProps
}) => {
  const { collapsed, disabled, toggle } = useContext(AccordionItemContext);

  const onHeaderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      toggle();
    }
  };

  const iconAnimation = useSpring({
    transform: collapsed || disabled ? 'rotate(0deg)' : 'rotate(180deg)',
    config: { duration: 300, easing: easings.easeOutExpo }
  });

  return (
    <div
      className={classNames('nb-accordion-item-header', className, {
        'accordion-item-header-collapsed': collapsed || disabled,
        'accordion-item-header-expanded': !(collapsed || disabled)
      })}
      aria-expanded={!(collapsed || disabled)}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={toggle}
      onKeyDown={(event) => onHeaderKeyDown(event)}
      {...otherProps}
    >
      {children}
      {!disabled && (
        <animated.div style={iconAnimation} className="expansion-indicator">
          <NbIcon icon="chevron-down-outline" pack="nebular-essentials"></NbIcon>
        </animated.div>
      )}
    </div>
  );
};

export { NbAccordionItemHeader };
