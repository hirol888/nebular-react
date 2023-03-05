import React, { useImperativeHandle, useMemo, useState } from 'react';
import {
  BreakpointName,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useBreakpoint, useIsomorphicEffect } from '@nebular-react/hooks';
import { SidebarResponsiveStatus, SidebarStatus } from './types';
import useStyles from './Sidebar.style';
import { SidebarHeader } from './SidebarHeader/SidebarHeader';
import { SidebarFooter } from './SidebarFooter/SidebarFooter';

export type SidebarStylesNames = Selectors<typeof useStyles>;

export interface SidebarProps
  extends DefaultProps<SidebarStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  containerFixed?: boolean;
  fixed?: boolean;
  right?: boolean;
  left?: boolean;
  start?: boolean;
  end?: boolean;
  sidebarStatus?: SidebarStatus;
  responsive?: boolean;
  compactedBreakpoints?: (BreakpointName | string)[];
  collapsedBreakpoints?: (BreakpointName | string)[];
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onSidebarStatusChange?: (sidebarStatus: SidebarStatus) => void;
  onResponsiveStatusChange?: (responsiveStatus: SidebarResponsiveStatus) => void;
}

interface SidebarState {
  responsiveStatus: SidebarResponsiveStatus;
  fixed: boolean;
  sidebarStatus: SidebarStatus;
}

export interface SidebarRef {
  toggle: (compact?: boolean) => void;
  expand: () => void;
  collapse: () => void;
  compact: () => void;
}

const defaultProps: Partial<SidebarProps> = {
  containerFixed: true,
  fixed: false,
  sidebarStatus: 'expanded',
  compactedBreakpoints: ['xs', 'is', 'sm', 'md', 'lg'],
  collapsedBreakpoints: ['xs', 'is']
};

const Sidebar = React.forwardRef<SidebarRef, SidebarProps>((props: SidebarProps, ref) => {
  const {
    containerFixed,
    fixed,
    right,
    left,
    start,
    end,
    sidebarStatus,
    responsive,
    compactedBreakpoints,
    collapsedBreakpoints,
    header,
    footer,
    onSidebarStatusChange,
    onResponsiveStatusChange,
    className,
    classNames,
    styles,
    unstyled,
    children,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'sidebar', classNames, styles, unstyled });

  const [sidebarState, setSidebarState] = useState<SidebarState>({
    responsiveStatus: 'pc',
    fixed,
    sidebarStatus
  });

  const updateState = (newState: SidebarState) => {
    if (newState.sidebarStatus !== sidebarState.sidebarStatus) {
      typeof onSidebarStatusChange === 'function' && onSidebarStatusChange(newState.sidebarStatus);
    }
    if (newState.responsiveStatus !== sidebarState.responsiveStatus) {
      typeof onResponsiveStatusChange === 'function' &&
        onResponsiveStatusChange(newState.responsiveStatus);
    }

    if (
      newState.sidebarStatus !== sidebarState.sidebarStatus ||
      newState.responsiveStatus !== sidebarState.responsiveStatus ||
      newState.fixed !== sidebarState.fixed
    ) {
      setSidebarState(newState);
    }
  };

  const { breakpointState } = useBreakpoint();
  useIsomorphicEffect(() => {
    if (responsive) {
      const isCollapsed = collapsedBreakpoints.includes(breakpointState.currBreakpoint.name);
      const isCompacted = compactedBreakpoints.includes(breakpointState.currBreakpoint.name);

      if (isCompacted) {
        updateState({
          fixed: containerFixed,
          sidebarStatus: 'compacted',
          responsiveStatus: 'tablet'
        });
      }
      if (isCollapsed) {
        updateState({
          fixed: true,
          sidebarStatus: 'collapsed',
          responsiveStatus: 'mobile'
        });
      }
      if (
        !isCollapsed &&
        !isCompacted &&
        (!breakpointState.prevBreakpoint.width ||
          breakpointState.prevBreakpoint.width < breakpointState.currBreakpoint.width)
      ) {
        updateState({ fixed: false, sidebarStatus: 'expanded', responsiveStatus: 'pc' });
      }
    }
  }, [breakpointState]);

  const { _left, _right, _start, _end } = useMemo(
    () => getSidebarPosition(left, right, start, end),
    [left, right, start, end]
  );

  useImperativeHandle(ref, () => ({
    toggle: (compact?: boolean) => {
      let _compact = compact;
      if (responsive) {
        if (sidebarState.responsiveStatus === 'mobile') {
          _compact = false;
        }
      }

      if (
        sidebarState.sidebarStatus === 'compacted' ||
        sidebarState.sidebarStatus === 'collapsed'
      ) {
        updateState({ ...sidebarState, sidebarStatus: 'expanded' });
      } else {
        updateState({ ...sidebarState, sidebarStatus: _compact ? 'compacted' : 'collapsed' });
      }
    },
    expand: () => {
      updateState({ ...sidebarState, sidebarStatus: 'expanded' });
    },
    collapse: () => {
      updateState({ ...sidebarState, sidebarStatus: 'collapsed' });
    },
    compact: () => {
      updateState({ ...sidebarState, sidebarStatus: 'compacted' });
    }
  }));

  return (
    <div
      className={cx(classes.root, className, {
        [classes.right]: _right,
        [classes.left]: _left,
        [classes.start]: _start,
        [classes.end]: _end,
        [classes.fixed]: sidebarState.fixed,
        [classes.expanded]: sidebarState.sidebarStatus === 'expanded',
        [classes.collapsed]: sidebarState.sidebarStatus === 'collapsed',
        [classes.compacted]: sidebarState.sidebarStatus === 'compacted'
      })}
      {...others}
    >
      <div
        className={cx(classes.container, {
          [classes.containerFixed]: containerFixed
        })}
      >
        {header && <>{header}</>}
        <div className={cx(classes.scrollable)}>{children}</div>
        {footer && <>{footer}</>}
      </div>
    </div>
  );
});

function getSidebarPosition(left?: boolean, right?: boolean, start?: boolean, end?: boolean) {
  const result = {
    _right: false,
    _left: true,
    _start: false,
    _end: false
  };

  if (left === undefined && right === undefined && start === undefined && end === undefined) {
    return result;
  }

  if (right) {
    result._right = right;
    result._left = !right;
    result._start = false;
    result._end = false;
  }

  if (left) {
    result._left = left;
    result._right = !left;
    result._start = false;
    result._end = false;
  }

  if (start) {
    result._left = false;
    result._right = false;
    result._start = start;
    result._end = !start;
  }

  if (end) {
    result._left = false;
    result._right = false;
    result._end = end;
    result._start = !end;
  }

  return result;
}

Sidebar.displayName = '@nebular-react/core/Sidebar';
(Sidebar as any).Header = SidebarHeader;
(Sidebar as any).Footer = SidebarFooter;

export { Sidebar };
