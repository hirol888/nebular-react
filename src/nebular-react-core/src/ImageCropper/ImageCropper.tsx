import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface ImageCrop {
  /** Horizontal offset of the crop area, in percentage of the image width. */
  x: number;
  /** Vertical offset of the crop area, in percentage of the image height. */
  y: number;
  /** Crop area width, in percentage of the image width. */
  width: number;
  /** Crop area height, in percentage of the image height. */
  height: number;
}

export interface ImageCropperProps
  extends
    DefaultProps<ImageCropperStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue' | 'height'> {
  src: string;
  alt?: string;
  aspectRatio?: number;
  value?: ImageCrop;
  defaultValue?: ImageCrop;
  onChange?(crop: ImageCrop): void;
  minSize?: number;
  disabled?: boolean;
  ariaLabel?: string;
  height?: number;
}

const useStyles = createStyles((_theme, { disabled }: { disabled: boolean }) => ({
  root: {
    position: 'relative',
    width: '100%',
    fontFamily: 'inherit'
  },

  viewport: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'var(--image-cropper-border-radius, 0.25rem)',
    backgroundColor: 'var(--image-cropper-background-color, #0b0f19)',
    touchAction: 'none',
    userSelect: 'none'
  },

  image: {
    position: 'absolute',
    inset: 0,
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
    userSelect: 'none'
  },

  crop: {
    position: 'absolute',
    boxSizing: 'border-box',
    border: '2px solid var(--image-cropper-crop-border-color, #ffffff)',
    boxShadow: '0 0 0 9999px var(--image-cropper-overlay-color, rgba(0, 0, 0, 0.55))',
    cursor: disabled ? 'not-allowed' : 'move',
    outline: 'none',
    touchAction: 'none',

    '&:focus-visible': {
      outline: '2px solid var(--image-cropper-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  dragging: {
    cursor: 'grabbing'
  },

  handle: {
    position: 'absolute',
    width: 'var(--image-cropper-handle-size, 0.75rem)',
    height: 'var(--image-cropper-handle-size, 0.75rem)',
    boxSizing: 'border-box',
    border: '1px solid rgba(0, 0, 0, 0.45)',
    borderRadius: '2px',
    backgroundColor: 'var(--image-cropper-handle-color, #ffffff)'
  },

  handleNW: {
    top: 'calc(var(--image-cropper-handle-size, 0.75rem) / -2)',
    left: 'calc(var(--image-cropper-handle-size, 0.75rem) / -2)',
    cursor: 'nwse-resize'
  },

  handleNE: {
    top: 'calc(var(--image-cropper-handle-size, 0.75rem) / -2)',
    right: 'calc(var(--image-cropper-handle-size, 0.75rem) / -2)',
    cursor: 'nesw-resize'
  },

  handleSW: {
    bottom: 'calc(var(--image-cropper-handle-size, 0.75rem) / -2)',
    left: 'calc(var(--image-cropper-handle-size, 0.75rem) / -2)',
    cursor: 'nesw-resize'
  },

  handleSE: {
    bottom: 'calc(var(--image-cropper-handle-size, 0.75rem) / -2)',
    right: 'calc(var(--image-cropper-handle-size, 0.75rem) / -2)',
    cursor: 'nwse-resize'
  },

  hint: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  }
}));

export type ImageCropperStylesNames = Selectors<typeof useStyles>;

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';
type DragMode = 'move' | ResizeHandle;

interface DragState {
  mode: DragMode;
  startX: number;
  startY: number;
  width: number;
  height: number;
  crop: ImageCrop;
  last: ImageCrop;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const round = (value: number) => Math.round(value * 100) / 100;

const normalizeMinSize = (minSize: number) => clamp(Number.isFinite(minSize) ? minSize : 0, 0, 100);

const normalizeRatio = (ratio: number) => (Number.isFinite(ratio) && ratio > 0 ? ratio : 1);

const isSameCrop = (first: ImageCrop, second: ImageCrop) =>
  first.x === second.x &&
  first.y === second.y &&
  first.width === second.width &&
  first.height === second.height;

const isResizeHandle = (value: string | undefined): value is ResizeHandle =>
  value === 'nw' || value === 'ne' || value === 'sw' || value === 'se';

/**
 * Clamps a crop area so that it stays inside the image bounds and never gets
 * smaller than `minSize` (both values are percentages between 0 and 100).
 */
export function clampCrop(crop: ImageCrop, minSize = 10): ImageCrop {
  const min = normalizeMinSize(minSize);
  const width = round(clamp(crop.width, min, 100));
  const height = round(clamp(crop.height, min, 100));
  const x = round(clamp(crop.x, 0, 100 - width));
  const y = round(clamp(crop.y, 0, 100 - height));

  return { x, y, width, height };
}

function getDefaultCrop(aspectRatio: number): ImageCrop {
  const ratio = normalizeRatio(aspectRatio);
  let width = 80;
  let height = width / ratio;

  if (height > 80) {
    height = 80;
    width = height * ratio;
  }

  return clampCrop(
    {
      x: (100 - width) / 2,
      y: (100 - height) / 2,
      width,
      height
    },
    10
  );
}

function moveCrop(crop: ImageCrop, dx: number, dy: number, minSize: number): ImageCrop {
  return clampCrop({ ...crop, x: crop.x + dx, y: crop.y + dy }, minSize);
}

function resizeCrop(
  crop: ImageCrop,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  ratio: number,
  minSize: number
): ImageCrop {
  const min = normalizeMinSize(minSize);
  const right = crop.x + crop.width;
  const bottom = crop.y + crop.height;
  const anchorX = handle.includes('w') ? right : crop.x;
  const anchorY = handle.includes('n') ? bottom : crop.y;
  const widthFromX = handle.includes('e') ? crop.width + dx : crop.width - dx;
  const heightFromY = handle.includes('s') ? crop.height + dy : crop.height - dy;

  if (Number.isFinite(ratio) && ratio > 0) {
    const minWidth = Math.min(100, Math.max(min, min * ratio));
    const maxWidth = Math.min(
      handle.includes('w') ? anchorX : 100 - anchorX,
      (handle.includes('n') ? anchorY : 100 - anchorY) * ratio
    );
    const candidate = Math.abs(dx) >= Math.abs(dy * ratio) ? widthFromX : heightFromY * ratio;
    const width = clamp(candidate, minWidth, Math.max(minWidth, maxWidth));
    const height = width / ratio;
    const x = handle.includes('w') ? anchorX - width : anchorX;
    const y = handle.includes('n') ? anchorY - height : anchorY;

    return clampCrop({ x, y, width, height }, min);
  }

  const width = clamp(widthFromX, min, 100);
  const height = clamp(heightFromY, min, 100);
  const x = handle.includes('w') ? right - width : crop.x;
  const y = handle.includes('n') ? bottom - height : crop.y;

  return clampCrop({ x, y, width, height }, min);
}

const defaultProps: Partial<ImageCropperProps> = {
  aspectRatio: 1,
  minSize: 10,
  disabled: false,
  height: 320
};

const _ImageCropper = forwardRef<HTMLDivElement, ImageCropperProps>((props, ref) => {
  const {
    src,
    alt,
    aspectRatio,
    value,
    defaultValue,
    onChange,
    minSize,
    disabled,
    ariaLabel,
    height,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { disabled },
    { name: 'image-cropper', classNames, styles, unstyled }
  );
  const ratio = normalizeRatio(aspectRatio);
  const min = normalizeMinSize(minSize);
  const [rawCrop, setCrop] = useUncontrolled<ImageCrop>({
    value,
    defaultValue,
    finalValue: getDefaultCrop(ratio),
    onChange
  });
  const crop = clampCrop(rawCrop, min);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const hintId = useId();
  const label = ariaLabel ?? alt ?? 'Image cropper';

  useEffect(
    () => () => {
      cleanupRef.current?.();
    },
    []
  );

  const commit = (next: ImageCrop) => {
    const normalized = clampCrop(next, min);

    if (isSameCrop(normalized, crop)) {
      return;
    }

    setCrop(normalized);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
    const vertical = event.key === 'ArrowUp' || event.key === 'ArrowDown';

    if (!horizontal && !vertical) {
      return;
    }

    event.preventDefault();
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;

    if (!event.shiftKey) {
      commit(moveCrop(crop, horizontal ? delta : 0, vertical ? delta : 0, min));
      return;
    }

    if (horizontal) {
      const width = crop.width + delta;
      commit({ ...crop, width, height: width / ratio });
      return;
    }

    const nextHeight = crop.height + delta;
    commit({ ...crop, width: nextHeight * ratio, height: nextHeight });
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) {
      return;
    }

    event.preventDefault();
    event.currentTarget.focus();

    const targetHandle = (event.target as HTMLElement).dataset.handle;
    const mode: DragMode = isResizeHandle(targetHandle) ? targetHandle : 'move';
    const state: DragState = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
      crop,
      last: crop
    };

    const handleMove = (moveEvent: MouseEvent) => {
      if (!Number.isFinite(moveEvent.clientX) || !Number.isFinite(moveEvent.clientY)) {
        return;
      }

      const dx = ((moveEvent.clientX - state.startX) / state.width) * 100;
      const dy = ((moveEvent.clientY - state.startY) / state.height) * 100;
      const next =
        state.mode === 'move'
          ? moveCrop(state.crop, dx, dy, min)
          : resizeCrop(state.crop, state.mode, dx, dy, ratio, min);

      if (isSameCrop(next, state.last)) {
        return;
      }

      state.last = next;
      setCrop(next);
    };

    const stop = () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', stop);
      document.removeEventListener('pointercancel', stop);
      cleanupRef.current = null;
      setDragging(false);
    };

    cleanupRef.current?.();
    cleanupRef.current = stop;
    setDragging(true);
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', stop);
    document.addEventListener('pointercancel', stop);
  };

  const handles: ResizeHandle[] = ['nw', 'ne', 'sw', 'se'];
  const handleClasses: Record<ResizeHandle, string> = {
    nw: classes.handleNW,
    ne: classes.handleNE,
    sw: classes.handleSW,
    se: classes.handleSE
  };

  return (
    <div
      {...others}
      ref={ref}
      role="group"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cx(classes.root, className)}
    >
      <div ref={viewportRef} className={cx(classes.viewport)} style={{ height }}>
        <img className={cx(classes.image)} src={src} alt={alt ?? ''} draggable={false} />
        <div
          className={cx(classes.crop, { [classes.dragging]: dragging })}
          style={{
            left: `${crop.x}%`,
            top: `${crop.y}%`,
            width: `${crop.width}%`,
            height: `${crop.height}%`
          }}
          role="group"
          aria-label="Crop area"
          aria-describedby={hintId}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onPointerDown={startDrag}
        >
          {!disabled &&
            handles.map((handle) => (
              <span
                key={handle}
                data-handle={handle}
                className={cx(classes.handle, handleClasses[handle])}
                aria-hidden="true"
              />
            ))}
        </div>
      </div>
      <span id={hintId} className={cx(classes.hint)}>
        Use the arrow keys to move the crop area. Hold Shift and press the arrow keys to resize it.
      </span>
    </div>
  );
});

_ImageCropper.displayName = 'ImageCropper';

export { _ImageCropper as ImageCropper };
