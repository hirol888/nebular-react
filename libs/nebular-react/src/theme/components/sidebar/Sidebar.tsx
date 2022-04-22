import classNames from 'classnames';
import { NbMediaBreakpoint, NbThemeService } from 'libs/nebular-react/src/core/services';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import React, { Children, isValidElement, useEffect, useRef, useState } from 'react';
import { filter, Observable } from 'rxjs';
import { DEFAULT_TAG, NbSidebarService } from './sidebar.service';
import NbSidebarFooter from './SidebarFooter';
import NbSidebarHeader from './SidebarHeader';
import { useObservable, useSubscription } from 'observable-hooks';
import './sidebar.scoped.scss';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';

export type NbSidebarState = 'expanded' | 'collapsed' | 'compacted';
export type NbSidebarResponsiveState = 'mobile' | 'tablet' | 'pc';

type SidebarProps = {
  /**
   * Makes sidebar container fixed
   * @type {boolean}
   */
  containerFixed?: boolean;
  /**
   * Makes sidebar fixed (shown above the layout content)
   * @type {boolean}
   */
  fixed?: boolean;
  /**
   * Places sidebar on the right side
   * @type {boolean}
   */
  right?: boolean;
  /**
   * Places sidebar on the left side
   * @type {boolean}
   */
  left?: boolean;
  /**
   * Places sidebar on the start edge of layout
   * @type {boolean}
   */
  start?: boolean;
  /**
   * Places sidebar on the end edge of layout
   * @type {boolean}
   */
  end?: boolean;
  /**
   * Makes sidebar fixed (shown above the layout content)
   * @type {boolean}
   */
  state?: NbSidebarState;
  /**
   * Makes sidebar listen to media query events and change its behaviour
   * @type {boolean}
   */
  responsive?: boolean;
  /**
   * Tags a sidebar with some ID, can be later used in the sidebar service
   * to determine which sidebar triggered the action, if multiple sidebars exist on the page.
   *
   * @type {string}
   */
  tagName?: string;
  // TODO: get width by the key and define only max width for the tablets and mobiles
  /**
   * Controls on which screen sizes sidebar should be switched to compacted state.
   * Works only when responsive mode is on.
   * Default values are `['xs', 'is', 'sm', 'md', 'lg']`.
   *
   * @type string[]
   */
  compactedBreakpoints?: string[];
  /**
   * Controls on which screen sizes sidebar should be switched to collapsed state.
   * Works only when responsive mode is on.
   * Default values are `['xs', 'is']`.
   *
   * @type string[]
   */
  collapsedBreakpoints?: string[];
  sidebarStateChangeHandler?: (state: NbSidebarState) => void;
  responsiveStateChangeHandler?: (state: NbSidebarResponsiveState) => void;
};

const NbSidebar: React.FC<SidebarProps & React.HTMLAttributes<HTMLDivElement>> = ({
  containerFixed = true,
  fixed = false,
  right,
  left,
  start,
  end,
  state = 'expanded',
  responsive = false,
  tagName = DEFAULT_TAG,
  compactedBreakpoints = ['xs', 'is', 'sm', 'md', 'lg'],
  collapsedBreakpoints = ['xs', 'is'],
  sidebarStateChangeHandler,
  responsiveStateChangeHandler,
  className,
  children,
  ...otherProps
}) => {
  // #region child components
  const header = Children.toArray(children).find((c) => isValidElement(c) && c.type === NbSidebarHeader);
  const content = Children.toArray(children).filter(
    (c) => !((c as React.ReactElement).type === NbSidebarFooter || (c as React.ReactElement).type === NbSidebarHeader)
  );
  const footer = Children.toArray(children).find((c) => isValidElement(c) && c.type === NbSidebarFooter);
  // #endregion

  const [responsiveState, setResponsiveState] = useState<NbSidebarResponsiveState>('pc');
  const [fixedState, setFixedState] = useState<boolean>(fixed);
  const [sidebarState, setSidebarState] = useState<NbSidebarState>(state);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFixedState(fixed);
  }, [fixed]);

  useEffect(() => {
    setSidebarState(state);
  }, [state]);

  const sidebarService = new NbSidebarService();
  const themeService = useInjection<NbThemeService>(TYPES.NbThemeService);

  const updateState = (state: NbSidebarState) => {
    if (sidebarState !== state) {
      setSidebarState(state);
      sidebarStateChangeHandler && sidebarStateChangeHandler(state);
    }
  };

  const collapse = () => updateState('collapsed');
  const expand = () => updateState('expanded');
  const compact = () => updateState('compacted');
  const toggle = (compact = false) => {
    if (responsive) {
      if (responsiveState === 'mobile') {
        compact = false;
      }
    }

    if (sidebarState === 'compacted' || sidebarState === 'collapsed') {
      updateState('expanded');
    } else {
      updateState(compact ? 'compacted' : 'collapsed');
    }
  };

  const toggle$ = useObservable(() => sidebarService.onToggle().pipe(filter(({ tag }) => !tagName || tagName === tag)));
  useSubscription(toggle$, ({ compact }) => toggle(compact));

  const expand$ = useObservable(() => sidebarService.onExpand().pipe(filter(({ tag }) => !tagName || tagName === tag)));
  useSubscription(expand$, () => expand());

  const collapse$ = useObservable(() =>
    sidebarService.onCollapse().pipe(filter(({ tag }) => !tagName || tagName === tag))
  );
  useSubscription(collapse$, () => collapse());

  const compact$ = useObservable(() =>
    sidebarService.onCompact().pipe(filter(({ tag }) => !tagName || tagName === tag))
  );
  useSubscription(compact$, () => compact());

  const getSidebarState$ = useObservable(() =>
    sidebarService.getSidebarState$.pipe(filter(({ tag }) => !tagName || tagName === tag))
  );
  useSubscription(getSidebarState$, ({ observer }) => observer.next(sidebarState));

  const getSidebarResponsiveState$ = useObservable(() =>
    sidebarService.getSidebarResponsiveState$.pipe(filter(({ tag }) => !tagName || tagName === tag))
  );
  useSubscription(getSidebarResponsiveState$, ({ observer }) => observer.next(responsiveState));

  const mediaQueryChange$ = useObservable(() =>
    (themeService.onMediaQueryChange() as Observable<[NbMediaBreakpoint, NbMediaBreakpoint]>).pipe(
      filter(() => responsive)
    )
  );

  useSubscription(mediaQueryChange$, ([prev, current]: [NbMediaBreakpoint, NbMediaBreakpoint]) => {
    const isCollapsed = collapsedBreakpoints.includes(current.name);
    const isCompacted = compactedBreakpoints.includes(current.name);

    let newResponsiveState: NbSidebarResponsiveState = 'pc';

    if (isCompacted) {
      setFixedState(containerFixed);
      compact();
      newResponsiveState = 'tablet';
    }
    if (isCollapsed) {
      setFixedState(true);
      collapse();
      newResponsiveState = 'mobile';
    }
    if (!isCollapsed && !isCompacted && (!prev.width || prev.width < current.width)) {
      setFixedState(false);
      expand();
      newResponsiveState = 'pc';
    }

    if (newResponsiveState && newResponsiveState !== responsiveState) {
      setResponsiveState(newResponsiveState);
      responsiveStateChangeHandler && responsiveStateChangeHandler(newResponsiveState);
    }
  });

  const { pLeft, pRight, pStart, pEnd } = getSidebarPosition(left, right, start, end);

  const onClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const menu = sidebarRef.current?.querySelector('nb-menu');

    if (menu && menu.contains(event.target as HTMLElement)) {
      const link = getMenuLink(event.target as HTMLElement);

      if (link && link.nextElementSibling && link.nextElementSibling.classList.contains('menu-items')) {
        sidebarService.expand(tagName);
      }
    }
  };

  const getMenuLink = (element: HTMLElement | null): HTMLElement | undefined => {
    if (!element || element.tagName.toLowerCase() === 'nb-menu') {
      return undefined;
    }

    if (element.tagName.toLowerCase() === 'a') {
      return element;
    }

    return getMenuLink(element.parentElement);
  };

  return (
    <div
      ref={sidebarRef}
      className={classNames('nb-sidebar', className, {
        right: pRight,
        left: pLeft,
        start: pStart,
        end: pEnd,
        fixed: fixedState,
        expanded: sidebarState === 'expanded',
        collapsed: sidebarState === 'collapsed',
        compacted: sidebarState === 'compacted'
      })}
      {...otherProps}
    >
      <div
        className={classNames('main-container', {
          'main-container-fixed': containerFixed
        })}
      >
        {header}
        {/* do we need onclick event to this div? */}
        <div className="scrollable" onClick={(event) => onClick(event)}>
          {content}
        </div>
        {footer}
      </div>
    </div>
  );
};

const getSidebarPosition = (left?: boolean, right?: boolean, start?: boolean, end?: boolean) => {
  const result = {
    pRight: false,
    pLeft: true,
    pStart: false,
    pEnd: false
  };

  if (left === undefined && right === undefined && start === undefined && end === undefined) {
    return result;
  }

  if (right) {
    result.pRight = right;
    result.pLeft = !right;
    result.pStart = false;
    result.pEnd = false;
  }

  if (left) {
    result.pLeft = left;
    result.pRight = !left;
    result.pStart = false;
    result.pEnd = false;
  }

  if (start) {
    result.pLeft = false;
    result.pRight = false;
    result.pStart = start;
    result.pEnd = !start;
  }

  if (end) {
    result.pLeft = false;
    result.pRight = false;
    result.pEnd = end;
    result.pStart = !end;
  }

  return result;
};

export { NbSidebar };
