import {
  createPolymorphicComponent,
  ComponentOrCustomStatus,
  DefaultProps,
  OriginalEvaIcon,
  Selectors,
  SvgFile,
  useComponentDefaultProps,
  useNebularIconPacks
} from '@nebular-react/styles';
import { useIsomorphicEffect, useMergedRef } from '@nebular-react/hooks';
import React, { useRef } from 'react';
import useStyles, { IconStylesParams } from './Icon.style';

export type IconStylesNames = Selectors<typeof useStyles>;

export interface IconProps
  extends DefaultProps<IconStylesNames, IconStylesParams>, React.ComponentPropsWithoutRef<'div'> {
  status?: ComponentOrCustomStatus;
  icon?: string;
  pack?: string;
  options?: any;
}

const defaultProps: Partial<IconProps> = {
  icon: ''
};

const _Icon = React.forwardRef<HTMLDivElement, IconProps>((props, ref) => {
  const {
    className,
    status,
    icon,
    pack,
    options,
    classNames,
    styles,
    unstyled,
    role: roleProp,
    'aria-hidden': ariaHiddenProp,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const iconRef = useRef<HTMLDivElement>(null);
  const previousFontIconClasses = useRef<string[]>([]);
  const { classes, cx } = useStyles({ status }, { name: 'icon', unstyled, classNames, styles });
  const { svgIconPacks, fontIconPacks, defaultIconPack } = useNebularIconPacks();

  const renderFontIcon = () => {
    const element = iconRef.current;
    const fontIconPackParams = fontIconPacks?.get(pack ?? defaultIconPack);

    if (element && fontIconPackParams) {
      const fontIconClasses: string[] = [];

      if (fontIconPackParams.packClass) {
        fontIconClasses.push(fontIconPackParams.packClass);
      }

      const iconName = icon
        ? fontIconPackParams.iconClassPrefix
          ? `${fontIconPackParams.iconClassPrefix}-${icon}`
          : icon
        : '';

      if (iconName) {
        fontIconClasses.push(iconName);
      }

      element.classList.add(...fontIconClasses);
      previousFontIconClasses.current = fontIconClasses;
    }
  };

  useIsomorphicEffect(() => {
    if (iconRef.current && previousFontIconClasses.current.length) {
      iconRef.current.classList.remove(...previousFontIconClasses.current);
      previousFontIconClasses.current = [];
    }

    const renderSvgIcon = async () => {
      const element = iconRef.current;
      const svgIconPack = svgIconPacks?.get(pack ?? defaultIconPack);

      if (!element || !svgIconPack) {
        return;
      }

      const svgIcon = svgIconPack.get(icon ?? '');

      if (!svgIcon) {
        return;
      }

      if (typeof svgIcon === 'string') {
        element.innerHTML = svgIcon;
      } else if (svgIcon.hasOwnProperty('file')) {
        const response = await fetch((svgIcon as SvgFile).file);
        element.innerHTML = await response.text();
      } else {
        element.innerHTML = (svgIcon as OriginalEvaIcon).toSvg({
          width: '100%',
          height: '100%',
          fill: 'currentColor',
          ...options
        });
      }
    };

    renderSvgIcon();
    renderFontIcon();
  }, [icon, pack, options, svgIconPacks, fontIconPacks, defaultIconPack]);

  const hasAccessibleName = !!(others['aria-label'] || others.title);
  const ariaHidden = ariaHiddenProp ?? (hasAccessibleName ? undefined : true);
  const role = roleProp ?? (hasAccessibleName ? 'img' : undefined);

  return (
    <div
      ref={useMergedRef(ref, iconRef)}
      className={cx(classes.root, className, status)}
      role={role}
      aria-hidden={ariaHidden}
      {...others}
    />
  );
});

_Icon.displayName = 'Icon';

export const Icon = createPolymorphicComponent<'div', IconProps>(_Icon);
