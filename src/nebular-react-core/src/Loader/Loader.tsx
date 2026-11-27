import React, { forwardRef, useEffect, useState } from 'react';
import {
  ComponentOrCustomStatus,
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  createPolymorphicComponent
} from '@nebular-react/styles';
import ReactDOM from 'react-dom';
import useStyles, { LoaderStylesParams } from './Loader.style';

export type LoaderStylesNames = Selectors<typeof useStyles>;

export interface LoaderProps extends DefaultProps<LoaderStylesNames, LoaderStylesParams> {
  isLoading: boolean;
  message?: string;
  size?: ComponentSize;
  status?: ComponentOrCustomStatus;
  customLoader?: React.ReactNode;
  loaderContainerRef: React.RefObject<HTMLElement>;
}

const defaultProps: Partial<LoaderProps> = {
  size: 'medium',
  status: 'basic'
};

const _Loader = forwardRef<HTMLDivElement, LoaderProps>((props, ref) => {
  const {
    isLoading,
    message,
    size,
    status,
    customLoader,
    loaderContainerRef,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { status, size },
    { name: 'loader', classNames, styles, unstyled }
  );
  const [content, setContent] = useState<React.ReactPortal | null>(null);

  useEffect(() => {
    if (isLoading) {
      loaderContainerRef.current?.classList.add('loader-container');
    }
    if (!isLoading) {
      loaderContainerRef.current?.classList.remove('loader-container');
    }

    const _content =
      loaderContainerRef.current &&
      ReactDOM.createPortal(
        <>
          {isLoading && (
            <div className={cx(classes.root, className, { size, status })} ref={ref} {...others}>
              {!customLoader && <span className={cx(classes.spinCircle)} />}
              {customLoader && <>{customLoader}</>}
              {message && <span className={cx(classes.message)}>{message}</span>}
            </div>
          )}
        </>,
        loaderContainerRef.current
      );
    setContent(_content);
    // The portal content is rebuilt only when loading state changes. Adding the
    // mutable ref or the full prop set here would recreate the portal endlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, loaderContainerRef.current]);

  return content;
});

_Loader.displayName = 'Loader';

export const Loader = createPolymorphicComponent<'div', LoaderProps>(_Loader);
