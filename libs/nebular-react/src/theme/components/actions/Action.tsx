/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import { NbBadge, NbBadgePosition } from '../badge';
import { NbComponentOrCustomStatus, NbComponentSize } from '../component';
import { NbIcon, NbIconConfig } from '../icon';
import './action.scoped.scss';

export interface NbActionProps {
  /**
   * Router link to use
   * @type string
   */
  link?: string;
  /**
   * Regular HREF link
   * @type: string
   */
  href?: string;
  /**
   * Optional title for mouseover
   * @type string
   */
  title?: string;
  /**
   * Icon name or config object
   * @type {string | NbIconConfig}
   */
  icon?: string | NbIconConfig;
  /**
   * Visually disables the item
   * @type boolean
   */
  disabled?: boolean;
  /**
   * Use badge dot mode
   * @type boolean
   */
  badgeDot?: boolean;
  /**
   * Badge text to display
   * @type string
   */
  badgeText?: string;
  /**
   * Badge status (adds specific styles):
   * 'basic', 'primary', 'info', 'success', 'warning', 'danger', 'control'
   * @param {string} val
   */
  badgeStatus?: NbComponentOrCustomStatus;
  /**
   * Badge position.
   * Can be set to any class or to one of predefined positions:
   * 'top left', 'top right', 'bottom left', 'bottom right',
   * 'top start', 'top end', 'bottom start', 'bottom end'
   * @type string
   */
  badgePosition?: NbBadgePosition;
}

export interface NbActionsProps {
  /**
   * Size of the component: 'tiny', 'small' (default), 'medium', 'large', 'giant'
   */
  size?: NbComponentSize;
  /**
   * Component will fill full width of the container
   */
  fullWidth?: boolean;
}

/**
 * Action item, display a link with an icon, or any other content provided instead.
 */
const NbAction: React.FC<NbActionProps & React.HTMLAttributes<HTMLDivElement>> = ({
  link,
  href,
  title = '',
  icon,
  disabled = false,
  badgeDot,
  badgeText,
  badgeStatus = 'basic',
  badgePosition,
  className,
  children,
  ...otherProps
}) => {
  const HasIconHasLink: React.FC = () => {
    return (
      <>
        {link && (
          <Link to={link} title={title} className="icon-container">
            <NbIcon config={icon}></NbIcon>
            {(badgeText || badgeDot) && (
              <NbBadge text={badgeText} dotMode={badgeDot} status={badgeStatus} position={badgePosition}></NbBadge>
            )}
          </Link>
        )}
      </>
    );
  };

  const HasIconHasHref: React.FC = () => {
    return (
      <>
        {href && !link && (
          <a className="icon-container" href={href} title={title}>
            <NbIcon config={icon}></NbIcon>
            {(badgeText || badgeDot) && (
              <NbBadge text={badgeText} dotMode={badgeDot} status={badgeStatus} position={badgePosition}></NbBadge>
            )}
          </a>
        )}
      </>
    );
  };

  const HasIconNoLinkNoHref: React.FC = () => {
    return (
      <>
        {!href && !link && (
          <a className="icon-container" href="#" title={title} onClick={(event) => event.preventDefault()}>
            <NbIcon config={icon}></NbIcon>
            {(badgeText || badgeDot) && (
              <NbBadge text={badgeText} dotMode={badgeDot} status={badgeStatus} position={badgePosition}></NbBadge>
            )}
          </a>
        )}
      </>
    );
  };

  const HasIcon: React.FC = () => {
    return (
      <>
        {icon && (
          <>
            <HasIconHasLink />
            <HasIconHasHref />
            <HasIconNoLinkNoHref />
          </>
        )}
      </>
    );
  };

  const HasNoIcon: React.FC = () => {
    return (
      <>
        {!icon && (
          <>
            {children}
            {(badgeText || badgeDot) && (
              <NbBadge text={badgeText} dotMode={badgeDot} status={badgeStatus} position={badgePosition}></NbBadge>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <div
      className={classNames('nb-action', className, {
        disabled: disabled
      })}
      {...otherProps}
    >
      <HasIcon />
      <HasNoIcon />
    </div>
  );
};

export { NbAction };
