import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { ImageCrop, ImageCropper } from '../ImageCropper';

export type AvatarEditorShape = 'circle' | 'square';

export interface AvatarEditorProps extends DefaultProps<AvatarEditorStylesNames> {
  src: string;
  alt?: string;
  size?: number;
  value?: ImageCrop;
  defaultValue?: ImageCrop;
  onChange?(crop: ImageCrop): void;
  zoom?: number;
  onZoomChange?(zoom: number): void;
  shape?: AvatarEditorShape;
  disabled?: boolean;
  ariaLabel?: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

const useStyles = createStyles(
  (_theme, { size, disabled }: { size: number; disabled: boolean }) => ({
    root: {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 'var(--avatar-editor-gap, 0.5rem)',
      width: size,
      maxWidth: '100%',
      fontFamily: 'inherit'
    },

    zoomRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--avatar-editor-zoom-gap, 0.5rem)',
      color: 'var(--avatar-editor-zoom-label-color, var(--text-basic-color, #222b45))',
      fontSize: 'var(--avatar-editor-zoom-font-size, 0.75rem)',
      fontWeight: 600
    },

    zoomValue: {
      minWidth: '2.5rem',
      color: 'var(--avatar-editor-zoom-value-color, var(--text-hint-color, #8f9bb3))',
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'right'
    },

    slider: {
      flex: '1 1 auto',
      minWidth: 0,
      accentColor: 'var(--avatar-editor-zoom-color, var(--color-primary-500, #3366ff))',
      cursor: disabled ? 'not-allowed' : 'pointer',

      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.5
      },

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '2px'
      }
    }
  })
);

export type AvatarEditorStylesNames = Selectors<typeof useStyles>;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getDefaultCrop = (): ImageCrop => ({ x: 10, y: 10, width: 80, height: 80 });

const defaultProps: Partial<AvatarEditorProps> = {
  size: 200,
  shape: 'square',
  disabled: false
};

const _AvatarEditor = forwardRef<HTMLDivElement, AvatarEditorProps>((props, ref) => {
  const {
    src,
    alt,
    size,
    value,
    defaultValue,
    onChange,
    zoom,
    onZoomChange,
    shape,
    disabled,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { size, disabled },
    { name: 'avatar-editor', classNames, styles, unstyled }
  );
  const [crop, setCrop] = useUncontrolled<ImageCrop>({
    value,
    defaultValue,
    finalValue: getDefaultCrop(),
    onChange
  });
  const [zoomValue, setZoomValue] = useUncontrolled<number>({
    value: zoom,
    defaultValue: MIN_ZOOM,
    finalValue: MIN_ZOOM,
    onChange: onZoomChange
  });
  const zoomLevel = clamp(zoomValue, MIN_ZOOM, MAX_ZOOM);
  const label = ariaLabel ?? (alt ? `${alt} editor` : 'Avatar editor');

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      <ImageCropper
        src={src}
        alt={alt}
        ariaLabel={label}
        aspectRatio={1}
        height={size}
        minSize={10}
        disabled={disabled}
        value={crop}
        onChange={setCrop}
        styles={{
          viewport: {
            borderRadius: shape === 'circle' ? '50%' : 'var(--avatar-editor-border-radius, 0.5rem)',
            border:
              '1px solid var(--avatar-editor-border-color, var(--border-basic-color-3, #e4e9f2))'
          },
          image: {
            transform: `scale(${zoomLevel})`,
            transition: 'transform 120ms ease'
          }
        }}
      />

      <div className={cx(classes.zoomRow)}>
        <span>Zoom</span>
        <input
          type="range"
          className={cx(classes.slider)}
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={ZOOM_STEP}
          value={zoomLevel}
          disabled={disabled}
          aria-label="Zoom"
          onChange={(event) => setZoomValue(Number(event.target.value))}
        />
        <span className={cx(classes.zoomValue)} aria-hidden="true">
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>
    </div>
  );
});

_AvatarEditor.displayName = 'AvatarEditor';

export { _AvatarEditor as AvatarEditor };
