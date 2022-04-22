/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import React from 'react';
import classNames from 'classnames';
import './alert.scoped.scss';
import { NbComponentOrCustomStatus, NbComponentSize, NbComponentStatus } from '../component';

export interface NbAlertProps {
  /**
   * Alert size, available sizes:
   * `tiny`, `small`, `medium`, `large`, `giant`
   * Unset by default.
   */
  size?: NbComponentSize;
  /**
   * Alert status (adds specific styles):
   * `basic` (default), `primary`, `success`, `info`, `warning`, `danger`, `control`.
   */
  status?: NbComponentOrCustomStatus;
  /**
   * Alert accent (color of the top border):
   * `basic`, `primary`, `success`, `info`, `warning`, `danger`, `control`.
   * Unset by default.
   */
  accent?: NbComponentStatus;
  /**
   * Alert outline (color of the border):
   * `basic`, `primary`, `success`, `info`, `warning`, `danger`, `control`.
   * Unset by default.
   */
  outline?: NbComponentStatus;
  /**
   * Shows `close` icon
   */
  closable?: boolean;
  /**
   * Emits when alert is removed
   */
  onClose?: () => void;
}

/**
 * Alert component.
 *
 * Basic alert example:
 * @stacked-example(Showcase, alert/alert-showcase)
 *
 * Alert configuration:
 *
 * ```html
 * <NbAlert status="success">
 *   You have been successfully authenticated!
 * </NbAlert>
 * ```
 * ### Usage
 *
 * Alert could additionally have a `close` button when `closable` property is set:
 * ```html
 * <NbAlert status="success" closable onClose="onClose">
 *   You have been successfully authenticated!
 * </NbAlert>
 * ```
 *
 * Colored alerts could be simply configured by providing a `status` property:
 * @stacked-example(Alert status, alert/alert-colors)
 *
 * It is also possible to assign an `accent` property for a slight alert highlight
 * as well as combine it with `status`:
 * @stacked-example(Alert accent, alert/alert-accents)
 *
 * And `outline` property:
 * @stacked-example(Outline Alert, alert/alert-outline)
 *
 * @additional-example(Multiple Sizes, alert/alert-sizes)
 *
 * @styles
 *
 * alert-border-radius:
 * alert-bottom-margin:
 * alert-padding:
 * alert-scrollbar-color:
 * alert-scrollbar-background-color:
 * alert-scrollbar-width:
 * alert-shadow:
 * alert-text-font-family:
 * alert-text-font-size:
 * alert-text-font-weight:
 * alert-text-line-height:
 * alert-closable-start-padding:
 * alert-tiny-height:
 * alert-small-height:
 * alert-medium-height:
 * alert-medium-padding:
 * alert-large-height:
 * alert-giant-height:
 * alert-basic-background-color:
 * alert-basic-text-color:
 * alert-primary-background-color:
 * alert-primary-text-color:
 * alert-success-background-color:
 * alert-success-text-color:
 * alert-info-background-color:
 * alert-info-text-color:
 * alert-warning-background-color:
 * alert-warning-text-color:
 * alert-danger-background-color:
 * alert-danger-text-color:
 * alert-control-background-color:
 * alert-control-text-color:
 * alert-accent-basic-color:
 * alert-accent-primary-color:
 * alert-accent-info-color:
 * alert-accent-success-color:
 * alert-accent-warning-color:
 * alert-accent-danger-color:
 * alert-accent-control-color:
 * alert-outline-width:
 * alert-outline-basic-color:
 * alert-outline-primary-color:
 * alert-outline-info-color:
 * alert-outline-success-color:
 * alert-outline-warning-color:
 * alert-outline-danger-color:
 * alert-outline-control-color:
 */
const NbAlert: React.FC<NbAlertProps & React.HTMLAttributes<HTMLDivElement>> = ({
  size,
  status = 'basic',
  accent,
  outline,
  closable = false,
  onClose,
  className,
  children,
  ...otherProps
}) => {
  return (
    <div
      className={classNames(
        'nb-alert',
        `status-${status}`,
        className,
        size ? `size-${size}` : '',
        accent ? `accent-${accent}` : '',
        outline ? `outline-${outline}` : ''
      )}
      {...otherProps}
    >
      {closable && (
        <button type="button" className="close" aria-label="Close" onClick={onClose}>
          <span aria-hidden="true">&times;</span>
        </button>
      )}
      {children}
    </div>
  );
};

export { NbAlert };
