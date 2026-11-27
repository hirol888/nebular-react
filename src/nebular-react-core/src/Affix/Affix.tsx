import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative'
  },

  content: {
    boxSizing: 'border-box'
  },

  placeholder: {
    pointerEvents: 'none'
  }
}));

export type AffixStylesNames = Selectors<typeof useStyles>;

export interface AffixProps extends DefaultProps<AffixStylesNames> {
  children?: React.ReactNode;
  /** Distance from the top edge (in pixels) at which the content becomes affixed. */
  offsetTop?: number;
  /** Distance from the bottom edge (in pixels) at which the content becomes affixed. */
  offsetBottom?: number;
  /** Returns the scrollable container. Defaults to the window. */
  target?: () => HTMLElement | null;
  /** Called whenever the affixed state changes. */
  onChange?(affixed: boolean): void;
  zIndex?: number;
}

const defaultProps: Partial<AffixProps> = {
  offsetTop: 0
};

interface AffixRect {
  width: number;
  height: number;
  left: number;
}

const _Affix = forwardRef<HTMLDivElement, AffixProps>((props, ref) => {
  const {
    children,
    offsetTop,
    offsetBottom,
    target,
    onChange,
    zIndex,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'affix', classNames, styles, unstyled });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const affixedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const [affixed, setAffixed] = useState(false);
  const [rect, setRect] = useState<AffixRect>({ width: 0, height: 0, left: 0 });

  // useComponentDefaultProps marks every prop as required, but offsetBottom is
  // intentionally optional at runtime.
  const bottomOffset = offsetBottom as number | undefined;

  onChangeRef.current = onChange;

  const assignRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  useEffect(() => {
    const container = target ? target() : null;
    const scrollTarget: HTMLElement | Window = container ?? window;

    const update = () => {
      const root = rootRef.current;

      if (!root) {
        return;
      }

      const rootRect = root.getBoundingClientRect();
      const containerRect = container ? container.getBoundingClientRect() : null;
      const top = containerRect ? rootRect.top - containerRect.top : rootRect.top;
      const bottom = containerRect ? rootRect.bottom - containerRect.top : rootRect.bottom;

      let nextAffixed: boolean;

      if (typeof bottomOffset === 'number') {
        const viewportHeight = container ? container.clientHeight : window.innerHeight;

        nextAffixed = bottom >= viewportHeight - bottomOffset;
      } else {
        nextAffixed = top <= offsetTop;
      }

      if (nextAffixed === affixedRef.current) {
        return;
      }

      affixedRef.current = nextAffixed;

      if (nextAffixed) {
        setRect({ width: rootRect.width, height: rootRect.height, left: rootRect.left });
      }

      setAffixed(nextAffixed);
      onChangeRef.current?.(nextAffixed);
    };

    scrollTarget.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      scrollTarget.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [offsetTop, bottomOffset, target]);

  const contentStyle: React.CSSProperties | undefined = affixed
    ? {
        position: 'fixed',
        top: typeof bottomOffset === 'number' ? undefined : offsetTop,
        bottom: bottomOffset,
        left: rect.left,
        width: rect.width || undefined,
        zIndex
      }
    : undefined;

  return (
    <div
      ref={assignRootRef}
      className={cx(classes.root, className)}
      style={style}
      data-affix-root
      data-affixed={affixed ? 'true' : undefined}
    >
      <div className={cx(classes.content)} style={contentStyle} data-affix-content>
        {children}
      </div>
      {affixed && (
        <div
          className={cx(classes.placeholder)}
          style={{ height: rect.height || undefined }}
          aria-hidden="true"
          data-affix-placeholder
        />
      )}
    </div>
  );
});

_Affix.displayName = 'Affix';

export { _Affix as Affix };
