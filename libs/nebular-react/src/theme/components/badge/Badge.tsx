/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import classNames from 'classnames';
import { NbComponentOrCustomStatus } from '../component';
import './badge.scoped.scss';

export type NbBadgePhysicalPosition =
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right'
  | 'center right'
  | 'center left';
export type NbBadgeLogicalPosition =
  | 'top start'
  | 'top end'
  | 'bottom start'
  | 'bottom end'
  | 'center start'
  | 'center end';
export type NbBadgePosition = NbBadgePhysicalPosition | NbBadgeLogicalPosition;

export interface NbBadgeProps {
  /**
   * Text to display
   * @type string
   */
  text?: string;
  /**
   * Badge position
   *
   * Can be set to any class or to one of predefined positions:
   * 'top left', 'top right', 'bottom left', 'bottom right',
   * 'top start', 'top end', 'bottom start', 'bottom end'
   * @type string
   */
  position?: NbBadgePosition;
  /**
   * Badge status (adds specific styles):
   * 'basic', 'primary', 'info', 'success', 'warning', 'danger', 'control'
   */
  status?: NbComponentOrCustomStatus;
  /**
   * Shows badge as a dot. No text is shown.
   * @type boolean
   */
  dotMode?: boolean;
}

/**
 * Badge is a simple labeling component.
 * It can be used to add additional information to any content or highlight unread items.
 *
 * Element is absolute positioned, so parent should be
 * [positioned element](https://developer.mozilla.org/en-US/docs/Web/CSS/position).
 * It means parent `position` should be set to anything except `static`, e.g. `relative`,
 * `absolute`, `fixed`, or `sticky`.
 *
 * ### Usage
 *
 * Badge with default position and status(color):
 *
 * ```html
 * <NbBadge text="badgeText"></NbBadge>
 * ```
 *
 * For example, badge can be placed into nb-card header:
 * @stacked-example(Showcase, badge/badge-showcase)
 *
 * Badge located on the bottom right with warning status:
 *
 * ```html
 * <NbBadge text="badgeText" status="warning" position="bottom right">
 * </NbBadge>
 * ```
 *
 * @styles
 *
 * badge-border-radius:
 * badge-text-font-family:
 * badge-text-font-size:
 * badge-text-font-weight:
 * badge-text-line-height:
 * badge-padding:
 * badge-basic-background-color:
 * badge-basic-text-color:
 * badge-primary-background-color:
 * badge-primary-text-color:
 * badge-success-background-color:
 * badge-success-text-color:
 * badge-info-background-color:
 * badge-info-text-color:
 * badge-warning-background-color:
 * badge-warning-text-color:
 * badge-danger-background-color:
 * badge-danger-text-color:
 * badge-control-background-color:
 * badge-control-text-color:
 */
const NbBadge: React.FC<
  NbBadgeProps & React.HTMLAttributes<HTMLDivElement>
> = ({
  text = '',
  position = 'top right',
  status = 'basic',
  className,
  dotMode = false,
  ...otherProps
}) => {
  return (
    <div
      className={classNames(`status-${status}`, className, 'nb-badge', {
        'dot-mode': dotMode,
        'position-top': position.includes('top'),
        'position-right': position.includes('right'),
        'position-bottom': position.includes('bottom'),
        'position-left': position.includes('left'),
        'position-start': position.includes('start'),
        'position-end': position.includes('end'),
        'position-center': position.includes('center')
      })}
      {...otherProps}
    >
      {!dotMode && text}
    </div>
  );
};

export { NbBadge };
