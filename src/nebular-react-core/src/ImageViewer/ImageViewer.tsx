import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface ImageViewerProps extends DefaultProps<ImageViewerStylesNames> {
  src: string;
  alt: string;
  opened?: boolean;
  defaultOpened?: boolean;
  onOpenChange?(opened: boolean): void;
  onClose?(): void;
  caption?: React.ReactNode;
  withDownload?: boolean;
  downloadFileName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  zIndex?: number;
  ariaLabel?: string;
}

interface ImageViewerStylesParams {
  zIndex: number;
}

const useStyles = createStyles((_theme, { zIndex }: ImageViewerStylesParams) => ({
  thumbnailButton: {
    display: 'inline-block',
    padding: 0,
    border: 0,
    background: 'transparent',
    cursor: 'zoom-in',
    borderRadius: 'var(--image-viewer-thumbnail-border-radius, 0.25rem)',

    '&:focus-visible': {
      outline: '2px solid var(--image-viewer-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  thumbnail: {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 'var(--image-viewer-thumbnail-border-radius, 0.25rem)'
  },

  root: {
    position: 'fixed',
    inset: 0,
    zIndex,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },

  backdrop: {
    position: 'absolute',
    inset: 0,
    padding: 0,
    border: 0,
    backgroundColor: 'var(--image-viewer-backdrop-color, rgba(0, 0, 0, 0.75))',
    cursor: 'zoom-out'
  },

  dialog: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    maxWidth: 'var(--image-viewer-max-width, 90vw)',
    maxHeight: 'calc(100vh - 2rem)',
    padding: '0.75rem',
    borderRadius: 'var(--image-viewer-border-radius, 0.5rem)',
    backgroundColor: 'var(--image-viewer-background-color, #0b0f19)',
    color: 'var(--image-viewer-text-color, #ffffff)',
    boxShadow: 'var(--image-viewer-shadow, 0 16px 48px rgba(0, 0, 0, 0.45))',
    outline: 'none'
  },

  image: {
    display: 'block',
    maxWidth: '100%',
    maxHeight: 'calc(100vh - 7rem)',
    objectFit: 'contain',
    borderRadius: 'var(--image-viewer-image-border-radius, 0.25rem)'
  },

  caption: {
    maxWidth: '100%',
    fontSize: '0.875rem',
    lineHeight: 1.4,
    textAlign: 'center'
  },

  download: {
    color: 'inherit',
    fontSize: '0.875rem',
    textDecoration: 'underline',

    '&:focus-visible': {
      outline: '2px solid var(--image-viewer-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  close: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    padding: 0,
    border: 0,
    borderRadius: '0.25rem',
    background: 'transparent',
    color: 'inherit',
    fontSize: '1.25rem',
    lineHeight: 1,
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--image-viewer-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  }
}));

export type ImageViewerStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<ImageViewerProps> = {
  withDownload: false,
  closeOnOverlayClick: true,
  closeOnEsc: true,
  zIndex: 1200
};

const _ImageViewer = forwardRef<HTMLButtonElement, ImageViewerProps>((props, ref) => {
  const {
    src,
    alt,
    opened,
    defaultOpened,
    onOpenChange,
    onClose,
    caption,
    withDownload,
    downloadFileName,
    closeOnOverlayClick,
    closeOnEsc,
    zIndex,
    ariaLabel,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { zIndex },
    { name: 'image-viewer', classNames, styles, unstyled }
  );
  const [isOpen, setOpened] = useUncontrolled({
    value: opened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange: onOpenChange
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previousOverflowRef = useRef<string>('');

  const closeViewer = useCallback(() => {
    setOpened(false);
    onClose?.();
  }, [setOpened, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    previousOverflowRef.current = document.body.style.overflow;
    dialogRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflowRef.current;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEsc) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeViewer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, closeViewer]);

  const thumbnail = (
    <button
      ref={ref}
      type="button"
      className={cx(classes.thumbnailButton, className)}
      style={style}
      aria-label={`Open image ${alt}`}
      aria-haspopup="dialog"
      onClick={() => setOpened(true)}
    >
      <img className={cx(classes.thumbnail)} src={src} alt={alt} />
    </button>
  );

  if (!isOpen || typeof document === 'undefined') {
    return thumbnail;
  }

  const viewer = (
    <div className={cx(classes.root)}>
      <button
        type="button"
        className={cx(classes.backdrop)}
        aria-label="Close image viewer overlay"
        tabIndex={-1}
        onClick={() => closeOnOverlayClick && closeViewer()}
      />
      <div
        ref={dialogRef}
        className={cx(classes.dialog)}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || alt}
        tabIndex={-1}
      >
        <img className={cx(classes.image)} src={src} alt={alt} />
        {caption && <div className={cx(classes.caption)}>{caption}</div>}
        {withDownload && (
          <a
            className={cx(classes.download)}
            href={src}
            download={downloadFileName ?? ''}
            aria-label="Download image"
          >
            Download
          </a>
        )}
        <button
          type="button"
          className={cx(classes.close)}
          aria-label="Close image viewer"
          onClick={closeViewer}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {thumbnail}
      {createPortal(viewer, document.body)}
    </>
  );
});

_ImageViewer.displayName = 'ImageViewer';

export { _ImageViewer as ImageViewer };
