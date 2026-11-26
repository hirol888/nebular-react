import React, {
  cloneElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';
import type { ComponentPropsWithoutRef, FocusEvent, KeyboardEvent, ReactElement } from 'react';
import { useIsomorphicEffect, useMergedRef } from '@nebular-react/hooks';
import { createStyles, useComponentDefaultProps, useNebularDir } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';

const useStyles = createStyles((_theme, { orientation }: { orientation: ToolbarOrientation }) => ({
  root: {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    alignItems: 'center',
    gap: 'var(--toolbar-gap, 0.375rem)',
    minWidth: 0
  },
  separator: {
    alignSelf: 'stretch',
    backgroundColor: 'var(--border-basic-color-3, #e4e9f2)',
    flex: '0 0 1px'
  }
}));

export type ToolbarStylesNames = Selectors<typeof useStyles>;
export type ToolbarOrientation = 'horizontal' | 'vertical';

export interface ToolbarProps
  extends DefaultProps<ToolbarStylesNames>, Omit<ComponentPropsWithoutRef<'div'>, 'role'> {
  orientation?: ToolbarOrientation;
  loop?: boolean;
}

interface ToolbarItemControlProps {
  'data-nebular-toolbar-item'?: string;
  'aria-disabled'?: boolean | 'true' | 'false';
  disabled?: boolean;
  tabIndex?: number;
  onFocus?(event: FocusEvent<HTMLElement>): void;
}

export interface ToolbarItemProps {
  /** The focusable control must forward tabIndex, onFocus and data attributes. */
  children: ReactElement<ToolbarItemControlProps>;
}

type ToolbarContextValue = {
  active: string | undefined;
  updateActive(id: string): void;
  invalidateItems(): void;
  orientation: ToolbarOrientation;
  separator: string;
};

const ToolbarContext = createContext<ToolbarContextValue | null>(null);
const defaultProps: Partial<ToolbarProps> = { orientation: 'horizontal', loop: true };

function getItems(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>('[data-nebular-toolbar-item]')).filter(
    (item) =>
      item.closest('[data-nebular-toolbar]') === root &&
      !item.matches(':disabled, [aria-disabled="true"]') &&
      !item.closest('[hidden], [inert], [aria-hidden="true"]')
  );
}

function ToolbarItem({ children }: ToolbarItemProps) {
  const context = useContext(ToolbarContext);
  const id = useId();
  const disabled =
    children.props.disabled ||
    children.props['aria-disabled'] === true ||
    children.props['aria-disabled'] === 'true';
  const invalidate = context?.invalidateItems;
  useIsomorphicEffect(() => {
    invalidate?.();
    return () => invalidate?.();
  }, [invalidate, disabled]);

  if (!context) return children;

  return cloneElement(children, {
    'data-nebular-toolbar-item': id,
    tabIndex: context.active === id && !disabled ? 0 : -1,
    onFocus: (event) => {
      children.props.onFocus?.(event);
      if (!disabled) context.updateActive(id);
    }
  });
}

function ToolbarSeparator(props: Omit<ComponentPropsWithoutRef<'div'>, 'role'>) {
  const context = useContext(ToolbarContext);
  const { className, ...others } = props;
  return (
    <div
      {...others}
      className={[context?.separator, className].filter(Boolean).join(' ')}
      role="separator"
      aria-orientation={context?.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
    />
  );
}

const ToolbarRoot = forwardRef<HTMLDivElement, ToolbarProps>((props, ref) => {
  const {
    className,
    classNames,
    styles,
    unstyled,
    orientation,
    loop,
    children,
    onKeyDown,
    dir,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { orientation },
    { name: 'toolbar', classNames, styles, unstyled }
  );
  const themeDir = useNebularDir();
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const [active, updateActive] = useState<string>();
  const [revision, setRevision] = useState(0);
  const invalidateItems = useCallback(() => setRevision((previous) => previous + 1), []);

  useIsomorphicEffect(() => {
    const items = getItems(rootRef.current);
    if (!items.some((item) => item.dataset.nebularToolbarItem === active)) {
      updateActive(items[0]?.dataset.nebularToolbarItem);
    }
  }, [active, revision]);

  const context = useMemo(
    () => ({
      active,
      updateActive,
      invalidateItems,
      orientation,
      separator: classes.separator
    }),
    [active, invalidateItems, orientation, classes.separator]
  );

  const navigate = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    const rtl = (dir ?? themeDir) === 'rtl';
    const previous = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const next = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    if (![previous, next, 'Home', 'End'].includes(event.key)) return;

    const items = getItems(rootRef.current);
    const index = items.findIndex((item) => item === event.target);
    if (index < 0) return;
    event.preventDefault();
    if (event.key === 'Home') {
      items[0]?.focus();
    } else if (event.key === 'End') {
      items.at(-1)?.focus();
    } else {
      const target = index + (event.key === previous ? -1 : 1);
      items[loop ? (target + items.length) % items.length : target]?.focus();
    }
  };

  return (
    <ToolbarContext.Provider value={context}>
      <div
        {...others}
        ref={mergedRef}
        data-nebular-toolbar=""
        className={cx(classes.root, className)}
        role="toolbar"
        aria-orientation={orientation}
        dir={dir}
        onKeyDown={navigate}
      >
        {children}
      </div>
    </ToolbarContext.Provider>
  );
});

ToolbarRoot.displayName = 'Toolbar';

export const Toolbar = Object.assign(ToolbarRoot, {
  Item: ToolbarItem,
  Separator: ToolbarSeparator
});
