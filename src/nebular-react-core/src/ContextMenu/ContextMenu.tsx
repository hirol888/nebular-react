import {
  Position,
  useFlexibleConnectedPositionStrategy,
  useOverlay,
  useOverlayTrigger,
  PositionAdjustment,
  TriggerType,
  useOverlayClickOutside
} from '@nebular-react/hooks';
import {
  DefaultProps,
  useComponentDefaultProps,
  useNebularDir,
  Selectors
} from '@nebular-react/styles';
import React, { Children, isValidElement, useEffect, useState } from 'react';
import { OptionalPortal } from '../OptionalPortal';
import useStyles from './ContextMenu.styles';
import { Menu } from '../Menu';

export type ContextMenuStylesNames = Selectors<typeof useStyles>;

export interface ContextMenuProps extends DefaultProps {
  triggerType?: TriggerType;
  position?: Position;
  adjustment?: PositionAdjustment;
  contextMenuOffset?: number;
  triggerRef: React.RefObject<HTMLElement>;
  onContextMenuOpen?(): void;
  onContextMenuClose?(): void;
  children?: React.ReactNode;
}

const defaultProps: Partial<ContextMenuProps> = {
  triggerType: 'click',
  position: 'bottom',
  adjustment: 'clockwise',
  contextMenuOffset: 8
};

function ContextMenu(props: ContextMenuProps) {
  const {
    triggerType,
    position,
    adjustment,
    triggerRef,
    contextMenuOffset,
    onContextMenuOpen,
    onContextMenuClose,
    children,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'context-menu', classNames, styles, unstyled });
  const [opened, setOpened] = useState<boolean>(false);

  const dir = useNebularDir();

  const show = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (!visible) {
      setOpened(true);
      typeof onContextMenuOpen === 'function' && onContextMenuOpen();
    }
  };
  const hide = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (visible) {
      setOpened(false);
      typeof onContextMenuClose === 'function' && onContextMenuClose();
    }
  };

  const { apply, paneRef, boundingBoxRef } = useFlexibleConnectedPositionStrategy(
    position,
    adjustment,
    triggerRef.current,
    dir,
    contextMenuOffset
  );
  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: boundingBoxRef,
    opened,
    panelClass: className
  });
  useOverlayTrigger(triggerRef, paneRef, boundingBoxRef, triggerType, show, hide);
  useOverlayClickOutside([paneRef, triggerRef], hide);

  const menu = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === Menu
  );

  useEffect(() => {
    if (triggerRef.current) {
      triggerRef.current.style.cursor = 'pointer';
    }
  }, [triggerRef.current]);

  return (
    <OptionalPortal withinPortal>
      <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
        <div ref={paneRef} className="overlay-pane">
          <div className={cx(classes.root)} {...others}>
            {menu}
          </div>
        </div>
      </div>
    </OptionalPortal>
  );
}

ContextMenu.displayName = '@nebular-react/core/ContextMenu';

export { ContextMenu };
