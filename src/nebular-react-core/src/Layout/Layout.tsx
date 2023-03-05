import React, { useContext, useEffect, useRef } from 'react';
import {
  changeDimensions,
  changeScrollPosition,
  DefaultProps,
  LayoutDimensions,
  NebularProviderContext,
  ScrollPosition,
  Selectors,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import { mergeRefs, usePlatform } from '@nebular-react/hooks';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles from './Layout.style';
import { LayoutHeader } from './LayoutHeader/LayoutHeader';
import { LayoutFooter } from './LayoutFooter/LayoutFooter';
import { LayoutColumn } from './LayoutColumn/LayoutColumn';

const scrollBlockClass = 'global-scrollblock';

export type LayoutStylesNames = Selectors<typeof useStyles>;

export interface LayoutProps
  extends DefaultProps<LayoutStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  windowMode?: boolean;
  withScroll?: boolean;
  center?: boolean;
  restoreScrollTop?: boolean;
  header?: React.ReactNode;
  subheader?: React.ReactNode;
  columns?: React.ReactNode;
  footer?: React.ReactNode;
  sidebars?: React.ReactNode;
}

const defaultProps: Partial<LayoutProps> = {
  windowMode: false,
  withScroll: false,
  center: false,
  restoreScrollTop: false
};

const _Layout = React.forwardRef<HTMLDivElement, LayoutProps>((props: LayoutProps, ref) => {
  const {
    windowMode,
    withScroll,
    center,
    restoreScrollTop,
    header,
    subheader,
    columns,
    footer,
    sidebars,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'layout', classNames, styles, unstyled });

  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const isScrollBlocked = useRef<boolean>(false);
  const scrollableContainerOverflowPrevValue = useRef<string>('');
  const layoutPaddingPrevValue = useRef<{ left: string; right: string } | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const layoutContainerRef = useRef<HTMLDivElement>(null);

  const { scrollable } = useContext(NebularProviderContext);

  useEffect(() => {
    if (scrollableContainerRef.current) {
      changeDimensions(getDimensions(scrollableContainerRef.current, withScroll));
      changeScrollPosition(getScrollPosition(scrollableContainerRef.current, withScroll));
    }
  }, [scrollableContainerRef.current]);

  useEffect(() => {
    if (withScroll) {
      if (scrollable) {
        enableScroll(
          isScrollBlocked,
          layoutRef,
          scrollableContainerOverflowPrevValue,
          scrollableContainerRef,
          layoutPaddingPrevValue
        );
      } else {
        blockScroll(
          isScrollBlocked,
          layoutContainerRef,
          scrollableContainerOverflowPrevValue,
          scrollableContainerRef,
          layoutPaddingPrevValue
        );
      }
    }
  }, [scrollable]);

  useEffect(() => {
    if (withScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'initial';
    }
  }, [withScroll]);

  return (
    <div
      ref={mergeRefs(layoutRef, ref)}
      className={cx(classes.root, className, {
        [classes.windowMode]: windowMode,
        [classes.withScroll]: withScroll,
        [classes.withSubheader]: !!subheader
      })}
      {...others}
    >
      <div
        className={cx(classes.scrollableContainer, {
          [classes.withScroll]: withScroll
        })}
        ref={scrollableContainerRef}
      >
        <div className={cx(classes.layout)} ref={layoutContainerRef}>
          {header && <>{header}</>}
          <div className={cx(classes.layoutContainer)}>
            {sidebars && <>{sidebars}</>}
            <div className={cx(classes.content)}>
              {subheader && <>{subheader}</>}
              <div className={cx(classes.columns)}>{columns && <>{columns}</>}</div>
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}) as any;

function getDimensions(container: HTMLDivElement, withScroll: boolean): LayoutDimensions {
  let clientWidth;
  let clientHeight;
  let scrollWidth;
  let scrollHeight = 0;
  if (withScroll) {
    clientWidth = container.clientWidth ?? 0;
    clientHeight = container.clientHeight ?? 0;
    scrollWidth = container.scrollWidth ?? 0;
    scrollHeight = container.scrollHeight ?? 0;
  } else {
    const { documentElement, body } = document;
    clientWidth = documentElement.clientWidth || body.clientWidth;
    clientHeight = documentElement.clientHeight || body.clientHeight;
    scrollWidth = documentElement.scrollWidth || body.scrollWidth;
    scrollHeight = documentElement.scrollHeight || body.scrollHeight;
  }

  return {
    clientWidth,
    clientHeight,
    scrollWidth,
    scrollHeight
  };
}

function getScrollPosition(container: HTMLDivElement, withScroll: boolean): ScrollPosition {
  const { isBrowser } = usePlatform();
  if (!isBrowser) {
    return { x: 0, y: 0 };
  }

  if (withScroll) {
    return { x: container.scrollLeft ?? 0, y: container.scrollTop ?? 0 };
  }

  const documentRect = document.documentElement.getBoundingClientRect();

  const x =
    -documentRect.left ||
    document.body.scrollLeft ||
    window.scrollX ||
    document.documentElement.scrollLeft ||
    0;

  const y =
    -documentRect.top ||
    document.body.scrollTop ||
    window.scrollY ||
    document.documentElement.scrollTop ||
    0;

  return { x, y };
}

function enableScroll(
  isScrollBlocked: React.MutableRefObject<boolean>,
  layoutRef: React.MutableRefObject<HTMLDivElement>,
  scrollableContainerOverflowPrevValue: React.MutableRefObject<string>,
  scrollableContainerRef: React.MutableRefObject<HTMLDivElement>,
  layoutPaddingPrevValue: React.MutableRefObject<{ left: string; right: string } | null>
) {
  if (isScrollBlocked.current) {
    isScrollBlocked.current = false;

    document.documentElement.classList.remove(scrollBlockClass);
    if (layoutRef.current) {
      layoutRef.current.style.overflow = scrollableContainerOverflowPrevValue.current;
    }

    if (layoutPaddingPrevValue.current) {
      if (scrollableContainerRef.current) {
        scrollableContainerRef.current.style.paddingLeft = layoutPaddingPrevValue.current.left;
        scrollableContainerRef.current.style.paddingRight = layoutPaddingPrevValue.current.right;
      }
      layoutPaddingPrevValue.current = null;
    }
  }
}

function blockScroll(
  isScrollBlocked: React.MutableRefObject<boolean>,
  layoutContainerRef: React.MutableRefObject<HTMLDivElement>,
  scrollableContainerOverflowPrevValue: React.MutableRefObject<string>,
  scrollableContainerRef: React.MutableRefObject<HTMLDivElement>,
  layoutPaddingPrevValue: React.MutableRefObject<{ left: string; right: string } | null>
) {
  if (isScrollBlocked.current) {
    return;
  }

  isScrollBlocked.current = true;

  document.documentElement.classList.add(scrollBlockClass);

  const layoutWithScrollWidth = layoutContainerRef.current?.clientWidth ?? 0;
  scrollableContainerOverflowPrevValue.current =
    scrollableContainerRef.current?.style.overflow ?? '';
  if (scrollableContainerRef.current) {
    scrollableContainerRef.current.style.overflow = 'hidden';
  }
  const layoutWithoutScrollWidth = layoutContainerRef.current?.clientWidth ?? 0;
  const scrollWidth = layoutWithoutScrollWidth - layoutWithScrollWidth;

  if (!scrollWidth) {
    return;
  }

  layoutPaddingPrevValue.current = {
    left: layoutContainerRef.current?.style.paddingLeft ?? '',
    right: layoutContainerRef.current?.style.paddingRight ?? ''
  };

  const dir = useNebularDir();

  if (layoutContainerRef.current) {
    if (dir === 'ltr') {
      layoutContainerRef.current.style.paddingRight = `${scrollWidth}px`;
    } else {
      layoutContainerRef.current.style.paddingLeft = `${scrollWidth}px`;
    }
  }
}

_Layout.displayName = '@nebular-react/core/Layout';
_Layout.Header = LayoutHeader;
_Layout.Footer = LayoutFooter;
_Layout.Column = LayoutColumn;

export const Layout = createPolymorphicComponent<
  'div',
  LayoutProps,
  { Header: typeof LayoutHeader; Footer: typeof LayoutFooter; Column: typeof LayoutColumn }
>(_Layout);
