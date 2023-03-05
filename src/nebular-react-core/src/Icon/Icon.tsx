import { createPolymorphicComponent } from '@mantine/utils';
import { useIsomorphicEffect, useMergedRef } from '@nebular-react/hooks';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  OriginalEvaIcon,
  Selectors,
  SvgFile,
  useComponentDefaultProps,
  useNebularIconPacks
} from '@nebular-react/styles';
import React, { useRef } from 'react';
import useStyles, { IconStylesParams } from './Icon.style';

export type IconStylesNames = Selectors<typeof useStyles>;

export interface IconProps
  extends DefaultProps<IconStylesNames, IconStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  status?: ComponentOrCustomStatus;
  icon?: string;
  pack?: string;
  options?: any;
}

const defaultProps: Partial<IconProps> = {
  icon: ''
};

const _Icon = React.forwardRef<HTMLDivElement, IconProps>((props, ref) => {
  const { className, status, icon, pack, options, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const iconRef = useRef<HTMLDivElement>(null);
  const { classes, cx } = useStyles({ status }, { name: 'icon', unstyled, classNames, styles });
  const { svgIconPacks, fontIconPacks, defaultIconPack } = useNebularIconPacks();

  const renderFontIcon = () => {
    const fontIconPackParams = fontIconPacks.get(pack ?? defaultIconPack);
    if (fontIconPackParams) {
      if (fontIconPackParams.packClass) {
        iconRef.current.classList.add(fontIconPackParams.packClass);
      }
      const iconName = fontIconPackParams.iconClassPrefix
        ? `${fontIconPackParams.iconClassPrefix}-${icon ?? ''}`
        : icon ?? '';
      iconRef.current.classList.add(iconName);
    }
  };

  useIsomorphicEffect(() => {
    const renderSvgIcon = async () => {
      const svgIconPack = svgIconPacks.get(pack ?? defaultIconPack);
      if (svgIconPack) {
        const svgIcon = svgIconPack.get(icon ?? '');
        if (typeof svgIcon === 'string') {
          iconRef.current.innerHTML = svgIcon;
        } else if (svgIcon.hasOwnProperty('file')) {
          const response = await fetch((svgIcon as SvgFile).file);
          iconRef.current.innerHTML = await response.text();
        } else {
          iconRef.current.innerHTML = (svgIcon as OriginalEvaIcon).toSvg({
            width: '100%',
            height: '100%',
            fill: 'currentColor',
            ...options
          });
        }
      }
    };

    renderSvgIcon();
    renderFontIcon();
  }, [icon]);

  return (
    <div
      ref={useMergedRef(ref, iconRef)}
      className={cx(classes.root, className, status)}
      {...others}
    />
  );
});

_Icon.displayName = '@nebular-react/core/Icon';

export const Icon = createPolymorphicComponent<'div', IconProps>(_Icon);
