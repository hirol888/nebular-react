/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import classNames from 'classnames';
import {
  NbComponentOrCustomStatus,
  NbComponentSize,
  NbComponentStatus
} from '../component';
import React from 'react';
import './card.scoped.scss';

interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  body?: React.ReactNode;
  /**
   * Card size, available sizes:
   * tiny, small, medium, large, giant
   */
  size?: NbComponentSize;
  /**
   * Card status:
   * `basic`, `primary`, `info`, `success`, `warning`, `danger`, `control`
   */
  status?: NbComponentOrCustomStatus;
  /**
   * Card accent (color of the top border):
   * `basic`, `primary`, `info`, `success`, `warning`, `danger`, `control`
   */
  accent?: NbComponentStatus;
}

/**
 * Basic content container component.
 *
 * Basic card example:
 * @stacked-example(Showcase, card/card-showcase)
 *
 * Basic card configuration:
 *
 * ```html
 * <NbCard>
 *   <NbCardBody>
 *     Card
 *   </NbCardBody>
 * </NbCard>
 * ```
 *
 * ### Usage
 *
 * Card with header and footer:
 * @stacked-example(With Header & Footer, card/card-full)
 *
 * Most of the time main card content goes to `NbCardBody`,
 * so it is styled and aligned in accordance with the header and footer.
 * In case you need a higher level of control, you can pass contend directly to `NbCard`,
 * so `NbCardBody` styling will not be applied.
 *
 * Consider an example with `NbList` component:
 * @stacked-example(Card with list, card/card-without-body)
 *
 * Colored cards could be simply configured by providing a `status` property:
 * @stacked-example(Colored Card, card/card-colors)
 *
 * It is also possible to assign an `accent` property for a slight card highlight
 * as well as combine it with `status`:
 * @stacked-example(Accent Card, card/card-accents)
 *
 * Cards of smaller sizes could be combined and put on the same row with a bigger card so they have the same heights.
 * @stacked-example(Card sizes combinations, card/card-sizes-combinations)
 *
 * @additional-example(Multiple Sizes, card/card-sizes)
 *
 * @styles
 *
 * card-background-color:
 * card-text-color:
 * card-text-font-family:
 * card-text-font-size:
 * card-text-font-weight:
 * card-text-line-height:
 * card-border-width:
 * card-border-style:
 * card-border-color:
 * card-border-radius:
 * card-padding:
 * card-shadow:
 * card-divider-color:
 * card-divider-style:
 * card-divider-width:
 * card-height-tiny:
 * card-height-small:
 * card-height-medium:
 * card-height-large:
 * card-height-giant:
 * card-margin-bottom:
 * card-scrollbar-color:
 * card-scrollbar-background-color:
 * card-scrollbar-width:
 */
const NbCard: React.FC<CardProps & React.HTMLAttributes<HTMLDivElement>> = ({
  size,
  status,
  accent,
  children,
  className,
  ...otherProps
}) => {
  return (
    <div
      className={classNames(
        'nb-card',
        size ? `size-${size}` : '',
        status ? `status-${status}` : '',
        accent ? 'accent' : '',
        accent ? `accent-${accent}` : '',
        className
      )}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export { NbCard };
