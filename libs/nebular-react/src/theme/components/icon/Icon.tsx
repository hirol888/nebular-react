/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import classNames from 'classnames';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { NbComponentOrCustomStatus } from '../component';
import { NbIconLibraries } from './icon-libraries';
import './icon.scoped.scss';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { container } from 'libs/nebular-react/src/ioc';
import { InversifyContext, useInjection } from 'libs/nebular-react/src/ioc-provider';

export interface NbIconConfig {
  icon: string;
  pack?: string;
  status?: NbComponentOrCustomStatus;
}

interface IconProps {
  status?: NbComponentOrCustomStatus;
  icon?: string;
  pack?: string;
  config?: string | NbIconConfig;
}

/**
 * Icon component. Allows to render both `svg` and `font` icons.
 * It uses [Eva Icons](https://akveo.github.io/eva-icons/) pack by default.
 *
 * Basic icon example:
 * @stacked-example(Showcase, icon/icon-showcase)
 *
 * Icon configuration:
 *
 * ```html
 * <NbIcon icon="star"></NbIcon>
 * ```
 * ### Installation
 *
 * By default Nebular comes without any pre-installed icon pack.
 * It we ship separate package called `@nebular/eva-icons`
 * which integrates SVG [Eva Icons](https://akveo.github.io/eva-icons/) pack to Nebular. To add it to your
 * project run:
 * ```sh
 * npm i eva-icons @nebular/eva-icons
 * ```
 * This command will install Eva Icons pack.
 * TODO: register icon pack (could be a link)
 * ### Usage
 *
 * Icon can be colored using `status` input:
 * ```html
 * <NbIcon icon="star" status="warning"></NbIcon>
 * ```
 *
 * Colored icons:
 * @stacked-example(Colored Icons, icon/icon-colors)
 *
 * In case you need to specify an icon from a specific icon pack, this could be done using `pack` input property:
 * ```html
 * <NbIcon icon="star" pack="font-awesome"></NbIcon>
 * ```
 * Additional icon settings (if available by the icon pack) could be passed using `options` input:
 * TODO: not support option yet
 * ```html
 * <NbIcon icon="star" [options]="{ animation: { type: 'zoom' } }"></NbIcon>
 * ```
 *
 * @styles
 *
 * icon-font-size:
 * icon-line-height:
 * icon-width:
 * icon-height:
 * icon-svg-vertical-align:
 * icon-basic-color:
 * icon-primary-color:
 * icon-info-color:
 * icon-success-color:
 * icon-warning-color:
 * icon-danger-color:
 * icon-control-color:
 */
const NbIcon: React.FC<IconProps & React.HTMLAttributes<HTMLDivElement>> = ({
  status,
  className,
  icon,
  pack,
  config,
  ...otherProps
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const settings = getSettings(config, icon, pack, status);
  const [iconState] = useIconState(ref, settings.icon, settings.pack, settings.status);

  return (
    <div
      ref={ref}
      className={classNames('nb-icon', iconState?.status ? `status-${iconState?.status}` : '', className)}
      dangerouslySetInnerHTML={{ __html: iconState?.html ?? '' }}
      {...otherProps}
    ></div>
  );
};

export { NbIcon };

const renderIcon = (iconLibraries: NbIconLibraries, name: string, pack?: string) => {
  const iconDefinition = iconLibraries.getIcon(name, pack);

  if (!iconDefinition) {
    return undefined;
  }

  return iconDefinition;
};

interface IconState {
  icon?: string;
  pack?: string;
  status?: string;
  html?: string;
}

function useIconState(
  ref: React.RefObject<HTMLDivElement>,
  icon?: string,
  pack?: string,
  status?: string
): [IconState | undefined, React.Dispatch<React.SetStateAction<IconState | undefined>>] {
  const [iconState, setIconState] = useState<IconState>();

  const iconLibraries = new NbIconLibraries();

  useEffect(() => {
    const iconDefinition = renderIcon(iconLibraries, icon ?? '', pack);

    if (iconDefinition) {
      const content = iconDefinition?.icon?.getContent();
      const classes = iconDefinition?.icon?.getClasses();

      if (content) {
        setIconState({
          icon: icon,
          pack: pack,
          status: status,
          html: content
        });
      }

      classes?.forEach((c: string) => {
        ref.current && ref.current.classList.add(c);
      });
    } else {
      setIconState({
        icon: icon,
        pack: pack,
        status: status,
        html: ''
      });
    }
  }, [icon, pack, status]);

  return [iconState, setIconState];
}

export function getSettings(
  config?: string | NbIconConfig,
  icon?: string,
  pack?: string,
  status?: NbComponentOrCustomStatus
) {
  if (config) {
    if (typeof config === 'string') {
      icon = config;
    } else {
      icon = config.icon;
      pack = config.pack;
      status = config.status;
    }
  }

  return { icon, pack, status };
}
