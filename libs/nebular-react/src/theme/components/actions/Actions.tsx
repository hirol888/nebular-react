/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import classNames from 'classnames';
import React, { Children, isValidElement } from 'react';
import { NbAction, NbActionsProps } from './Action';
import './actions.scoped.scss';

/**
 * Shows a horizontal list of actions, available in multiple sizes.
 * Aligns items vertically.
 *
 * @stacked-example(Showcase, action/action-showcase)
 *
 * Basic actions setup:
 * ```html
 * <NbActions size="small">
 *   <NbAction icon="nb-search"></NbAction>
 *   <NbAction icon="nb-power-circled"></NbAction>
 *   <NbAction icon="nb-person"></NbAction>
 * </NbActions>
 * ```
 * ### Usage
 *
 * Multiple sizes example:
 * @stacked-example(Multiple Sizes, action/action-sizes)
 *
 * It is also possible to specify a `badge` value:
 *
 * @stacked-example(Action Badge, action/action-badge)
 *
 * and we can set it to full a width of a parent component
 * @stacked-example(Full Width, action/action-width)
 *
 * Action dot mode
 * @stacked-example(Action badge in dot mode, action/action-dot-mode)
 *
 * @styles
 *
 * actions-background-color:
 * actions-divider-color:
 * actions-divider-style:
 * actions-divider-width:
 * actions-icon-color:
 * actions-text-color:
 * actions-text-font-family:
 * actions-text-font-weight:
 * actions-text-line-height:
 * actions-disabled-icon-color:
 * actions-disabled-text-color:
 * actions-tiny-height:
 * actions-tiny-icon-height:
 * actions-tiny-padding:
 * actions-tiny-text-font-size:
 * actions-small-height:
 * actions-small-icon-height:
 * actions-small-padding:
 * actions-small-text-font-size:
 * actions-medium-height:
 * actions-medium-icon-height:
 * actions-medium-padding:
 * actions-medium-text-font-size:
 * actions-large-height:
 * actions-large-icon-height:
 * actions-large-padding:
 * actions-large-text-font-size:
 * actions-giant-height:
 * actions-giant-icon-height:
 * actions-giant-padding:
 * actions-giant-text-font-size:
 */
const NbActions: React.FC<NbActionsProps & React.HTMLAttributes<HTMLDivElement>> = ({
  size = 'small',
  fullWidth = false,
  className,
  children,
  ...otherProps
}) => {
  const actions = Children.toArray(children).filter((c) => {
    return isValidElement(c) && c.type === NbAction;
  });

  return (
    <div
      className={classNames('nb-actions', `size-${size}`, className, {
        'full-width': fullWidth
      })}
      {...otherProps}
    >
      {actions}
    </div>
  );
};

export { NbActions };
