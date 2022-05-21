import classNames from 'classnames';
import { getWindow } from 'libs/nebular-react/src/core/cdk';
import { NbPlatform } from 'libs/nebular-react/src/core/cdk/platform';
import {
  NbLayoutDimensions,
  NbLayoutDirectionService,
  NbLayoutRulerService,
  NbLayoutScrollService,
  NbScrollPosition,
  NbSpinnerService,
  NbThemeService
} from 'libs/nebular-react/src/core/services';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { Children, isValidElement, ReactElement, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { BehaviorSubject, filter, fromEvent, Subject, takeUntil } from 'rxjs';
import { NbSidebar } from '../sidebar';
import { NbLayoutColumn } from './LayoutColumn';
import { NbLayoutFooter } from './LayoutFooter';
import { NbLayoutHeader } from './LayoutHeader';
import { useObservable, useSubscription } from 'observable-hooks';
import './layout.scoped.scss';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';

type LayoutProps = {
  windowMode?: boolean;
  withScroll?: boolean;
  center?: boolean;
  restoreScrollTop?: boolean;
};

const scrollBlockClass = 'nb-global-scrollblock';

const NbLayout: React.FC<LayoutProps & React.HTMLAttributes<HTMLDivElement>> = ({
  windowMode = false,
  withScroll = false,
  center = false,
  restoreScrollTop = false,
  className,
  children,
  ...otherProps
}) => {
  // #region child components
  const header = Children.toArray(children).find((c) => isValidElement(c) && c.type === NbLayoutHeader);
  const columns = Children.toArray(children).filter((c) => isValidElement(c) && c.type === NbLayoutColumn);
  const sidebar = Children.toArray(children).filter((c) => isValidElement(c) && c.type === NbSidebar);
  const footer = Children.toArray(children).find((c) => isValidElement(c) && c.type === NbLayoutFooter);
  // #endregion

  const themeService = useInjection<NbThemeService>(TYPES.NbThemeService);
  const spinnerService = useInjection<NbSpinnerService>(TYPES.NbSpinnerService);
  const layoutDirection = useInjection<NbLayoutDirectionService>(TYPES.NbLayoutDirectionService);
  const scrollService = useInjection<NbLayoutScrollService>(TYPES.NbLayoutScrollService);
  const rulerService = useInjection<NbLayoutRulerService>(TYPES.NbLayoutRulerService);
  const platform = useInjection<NbPlatform>(TYPES.NbPlatform);

  const firstRender = useRef<boolean>(true);
  const destroy$ = useRef<Subject<void>>(new Subject<void>());
  const afterRendered$ = useRef(new BehaviorSubject(false));
  const isScrollBlocked = useRef<boolean>(false);
  const scrollableContainerOverflowOldValue = useRef<string>('');
  const layoutPaddingOldValue = useRef<{ left: string; right: string } | null>(null);

  const layoutRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const layoutContainerRef = useRef<HTMLDivElement>(null);

  const location = useLocation();

  useEffect(() => {
    scroll(0, 0);
  }, [location]);

  let withSubheader = false;
  if (header && (header as ReactElement).props.subheader) {
    withSubheader = (header as ReactElement).props.subheader;
  }

  const getDimensions = (): NbLayoutDimensions => {
    let clientWidth,
      clientHeight,
      scrollWidth,
      scrollHeight = 0;
    if (withScroll) {
      const container = scrollableContainerRef.current;
      clientWidth = container?.clientWidth ?? 0;
      clientHeight = container?.clientHeight ?? 0;
      scrollWidth = container?.scrollWidth ?? 0;
      scrollHeight = container?.scrollHeight ?? 0;
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
  };

  const getScrollPosition = (): NbScrollPosition => {
    if (!platform.isBrowser) {
      return { x: 0, y: 0 };
    }

    if (withScroll) {
      const container = scrollableContainerRef.current;
      return { x: container?.scrollLeft ?? 0, y: container?.scrollTop ?? 0 };
    }

    const documentRect = document.documentElement.getBoundingClientRect();
    const window = getWindow();

    const x =
      -documentRect.left || document.body.scrollLeft || window.scrollX || document.documentElement.scrollLeft || 0;

    const y = -documentRect.top || document.body.scrollTop || window.scrollY || document.documentElement.scrollTop || 0;

    return { x, y };
  };

  const scroll = (x: number | null = null, y: number | null = null) => {
    const { x: currentX, y: currentY } = getScrollPosition();
    x = x == null ? currentX : x;
    y = y == null ? currentY : y;

    const window = getWindow();

    if (!platform.isBrowser) {
      return;
    }
    if (withScroll) {
      const scrollable = scrollableContainerRef.current;
      if (scrollable) {
        if (scrollable.scrollTo) {
          scrollable.scrollTo(x, y);
        } else {
          scrollable.scrollLeft = x;
          scrollable.scrollTop = y;
        }
      }
    } else {
      window.scrollTo(x, y);
    }
  };

  const blockScroll = () => {
    if (isScrollBlocked.current) {
      return;
    }

    isScrollBlocked.current = true;

    document.documentElement.classList.add(scrollBlockClass);

    const scrollableContainerElement = scrollableContainerRef.current;
    const layoutElement = layoutContainerRef.current;

    const layoutWithScrollWidth = layoutElement?.clientWidth ?? 0;
    scrollableContainerOverflowOldValue.current = scrollableContainerElement?.style.overflow ?? '';
    if (scrollableContainerElement) {
      scrollableContainerElement.style.overflow = 'hidden';
    }
    const layoutWithoutScrollWidth = layoutElement?.clientWidth ?? 0;
    const scrollWidth = layoutWithoutScrollWidth - layoutWithScrollWidth;

    if (!scrollWidth) {
      return;
    }

    layoutPaddingOldValue.current = {
      left: layoutElement?.style.paddingLeft ?? '',
      right: layoutElement?.style.paddingRight ?? ''
    };

    if (layoutElement) {
      if (layoutDirection.isLtr()) {
        layoutElement.style.paddingRight = `${scrollWidth}px`;
      } else {
        layoutElement.style.paddingLeft = `${scrollWidth}px`;
      }
    }
  };

  const enableScroll = () => {
    if (isScrollBlocked.current) {
      isScrollBlocked.current = false;

      document.documentElement.classList.remove(scrollBlockClass);
      if (layoutRef.current) {
        layoutRef.current.style.overflow = scrollableContainerOverflowOldValue.current;
      }

      if (layoutPaddingOldValue.current) {
        const layoutElement = scrollableContainerRef.current;
        if (layoutElement) {
          layoutElement.style.paddingLeft = layoutPaddingOldValue.current.left;
          layoutElement.style.paddingRight = layoutPaddingOldValue.current.right;
        }
        layoutPaddingOldValue.current = null;
      }
    }
  };

  const window = getWindow();

  const themeChange$ = useObservable(() => themeService.onThemeChange());
  useSubscription(themeChange$, (theme: any) => {
    if (theme.previous) {
      document.body.classList.remove(`nb-theme-${theme.previous}`);
    }
    document.body.classList.add(`nb-theme-${theme.name}`);
  });

  const appendLayoutClass$ = useObservable(() => themeService.onAppendLayoutClass());
  useSubscription(appendLayoutClass$, (className: string) => {
    layoutRef.current?.classList.add(className);
  });

  const removeLayoutClass$ = useObservable(() => themeService.onRemoveLayoutClass());
  useSubscription(removeLayoutClass$, (className: string) => {
    layoutRef.current?.classList.remove(className);
  });

  const getDimensions$ = useObservable(() => rulerService.onGetDimensions());
  useSubscription(getDimensions$, ({ listener }) => {
    listener.next(getDimensions());
    listener.complete();
  });

  const getPosition$ = useObservable(() => scrollService.onGetPosition());
  useSubscription(getPosition$, ({ listener }) => {
    listener.next(getScrollPosition());
    listener.complete();
  });

  const scrollableChange$ = useObservable(() => scrollService.onScrollableChange().pipe(filter(() => !!withScroll)));
  useSubscription(scrollableChange$, (scrollable: boolean) => {
    /**
     * In case when Nebular Layout custom scroll `withScroll` mode is enabled
     * we need to disable default CDK scroll blocker (@link NbBlockScrollStrategyAdapter) on HTML element
     * so that it won't add additional positioning.
     */
    if (scrollable) {
      enableScroll();
    } else {
      blockScroll();
    }
  });

  const windowScroll$ = useObservable(() => fromEvent(window, 'scroll'));
  useSubscription(windowScroll$, (event) => scrollService.fireScrollChange(event));

  const windowResize$ = useObservable(() => fromEvent(window, 'resize'));
  useSubscription(windowResize$, (event: any) => themeService.changeWindowWidth(event.target.innerWidth));
  const directionChange$ = useObservable(() => layoutDirection.onDirectionChange());
  useSubscription(directionChange$, (direction) => (document.dir = direction));

  const manualScroll$ = useObservable(() => scrollService.onManualScroll());
  useSubscription(manualScroll$, ({ x, y }: NbScrollPosition) => scroll(x, y));

  if (platform.isBrowser) {
    themeService.changeWindowWidth(window.innerWidth);
  }

  if (firstRender.current) {
    spinnerService.registerLoader(
      new Promise<void>((resolve) => {
        afterRendered$.current.pipe(takeUntil(destroy$.current)).subscribe((_) => resolve());
      })
    );
    spinnerService.load();

    firstRender.current = false;
  }

  useEffect(() => {
    if (withScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'initial';
    }
  }, [withScroll]);

  useEffect(() => {
    afterRendered$.current.next(true);
  }, []);

  return (
    <div
      ref={layoutRef}
      className={classNames('nb-layout', className, {
        'window-mode': windowMode,
        'with-scroll': withScroll,
        'with-subheader': withSubheader
      })}
      {...otherProps}
    >
      <div className="scrollable-container" ref={scrollableContainerRef}>
        <div className="layout" ref={layoutContainerRef}>
          {header && !(header as ReactElement).props.subheader && header}
          <div className="layout-container">
            {sidebar}
            <div
              className={classNames('content', {
                center: center
              })}
            >
              {header && (header as ReactElement).props.subheader && header}
              <div className="columns">{columns && columns.length > 0 && columns}</div>
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NbLayout };
