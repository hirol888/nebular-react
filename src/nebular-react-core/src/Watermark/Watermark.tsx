import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

interface WatermarkStylesParams {
  zIndex: number;
}

const useStyles = createStyles((_theme, { zIndex }: WatermarkStylesParams) => ({
  root: {
    position: 'relative'
  },

  content: {
    position: 'relative'
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex,
    backgroundRepeat: 'repeat',
    backgroundPosition: '0 0'
  }
}));

export type WatermarkStylesNames = Selectors<typeof useStyles>;

export interface WatermarkProps extends DefaultProps<WatermarkStylesNames> {
  text: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  rotate?: number;
  gapX?: number;
  gapY?: number;
  zIndex?: number;
  children: React.ReactNode;
}

const defaultProps: Partial<WatermarkProps> = {
  fontSize: 14,
  color: 'rgba(0,0,0,0.15)',
  rotate: -22,
  gapX: 100,
  gapY: 100,
  zIndex: 9
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface WatermarkSvgOptions {
  text: string;
  fontSize: number;
  color: string;
  opacity?: number;
  rotate: number;
  gapX: number;
  gapY: number;
}

function buildWatermarkImage({
  text,
  fontSize,
  color,
  opacity,
  rotate,
  gapX,
  gapY
}: WatermarkSvgOptions): string {
  const centerX = gapX / 2;
  const centerY = gapY / 2;
  const opacityAttribute = typeof opacity === 'number' ? ` opacity="${opacity}"` : '';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${gapX}" height="${gapY}" ` +
    `viewBox="0 0 ${gapX} ${gapY}">` +
    `<text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="middle" ` +
    `fill="${escapeXml(color)}" font-size="${fontSize}"${opacityAttribute} ` +
    `font-family="sans-serif" transform="rotate(${rotate} ${centerX} ${centerY})">` +
    `${escapeXml(text)}</text></svg>`;

  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')}")`;
}

const _Watermark = forwardRef<HTMLDivElement, WatermarkProps>((props, ref) => {
  const {
    text,
    fontSize,
    color,
    opacity,
    rotate,
    gapX,
    gapY,
    zIndex,
    children,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { zIndex },
    { name: 'watermark', classNames, styles, unstyled }
  );

  const backgroundImage = buildWatermarkImage({
    text,
    fontSize,
    color,
    opacity,
    rotate,
    gapX,
    gapY
  });

  return (
    <div ref={ref} className={cx(classes.root, className)} style={style} data-watermark>
      <div className={cx(classes.content)} data-watermark-content>
        {children}
      </div>
      <div
        className={cx(classes.overlay)}
        style={{ backgroundImage, backgroundSize: `${gapX}px ${gapY}px` }}
        aria-hidden="true"
        data-watermark-overlay
      />
    </div>
  );
});

_Watermark.displayName = 'Watermark';

export { _Watermark as Watermark };
