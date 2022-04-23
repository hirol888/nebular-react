/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import classNames from 'classnames';
import React, { useContext, useEffect, useState } from 'react';
import { useSpring, animated, easings } from 'react-spring';
import { useMeasure } from 'react-use';
import * as _ from 'lodash';
import './accordion-item-body.scoped.scss';
import { AccordionItemContext } from './Accordion.context';

/**
 * Component intended to be used within `<NbAccordionItem>` component
 */
const NbAccordionItemBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...otherProps
}) => {
  const { collapsed, disabled } = useContext(AccordionItemContext);
  const [bodyHeight, setBodyHeight] = useState<number>(0);
  const [ref, { height }] = useMeasure<HTMLDivElement>();
  const itemBodyId = _.uniqueId('item-body-');

  useEffect(() => {
    const itemBodyElement = document.querySelector(`#${itemBodyId}`);
    const itemBodyPaddingTop =
      itemBodyElement && parseInt(window.getComputedStyle(itemBodyElement).paddingTop.replace('px', ''), 10);
    const itemBodyPaddingBottom =
      itemBodyElement && parseInt(window.getComputedStyle(itemBodyElement).paddingBottom.replace('px', ''), 10);
    // set new height = height + paddingTop + paddingBottom
    const newHeight = height + (itemBodyPaddingTop ?? 0) + (itemBodyPaddingBottom ?? 0);
    setBodyHeight(newHeight);
    window.addEventListener('resize', () => setBodyHeight(newHeight));

    return window.removeEventListener('resize', () => setBodyHeight(newHeight));
  }, [height]);

  const openAnimation = useSpring({
    height: collapsed || disabled ? '0px' : `${bodyHeight}px`,
    config: { duration: 300, easing: easings.easeOutExpo }
  });

  return (
    <div
      className={classNames('nb-accordion-item-body', {
        collapsed: disabled || collapsed
      })}
      {...otherProps}
    >
      <animated.div style={openAnimation}>
        <div ref={ref} className={classNames('item-body', classNames)} id={itemBodyId}>
          {children}
        </div>
      </animated.div>
    </div>
  );
};

export { NbAccordionItemBody };
