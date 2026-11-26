import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type AnchorOrientation = 'vertical' | 'horizontal';

export interface AnchorItem {
  key: string;
  label: React.ReactNode;
  href?: string;
  depth?: number;
}

export interface AnchorStylesParams {
  orientation: AnchorOrientation;
}

const INDENT_SIZE = 12;

const useStyles = createStyles((_theme, { orientation }: AnchorStylesParams) => ({
  root: {
    width: '100%'
  },

  list: {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
    alignItems: orientation === 'horizontal' ? 'center' : 'stretch',
    gap: orientation === 'horizontal' ? '0.75rem' : '0.125rem',
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },

  item: {
    display: 'flex',
    minWidth: 0
  },

  link: {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 0,
    padding: '0.25rem 0',
    border: 0,
    borderInlineStart: orientation === 'vertical' ? '2px solid transparent' : '0 solid transparent',
    paddingInlineStart: orientation === 'vertical' ? '0.5rem' : 0,
    background: 'transparent',
    color: 'var(--anchor-link-color, var(--text-hint-color, #8f9bb3))',
    fontFamily: 'inherit',
    fontSize: 'var(--anchor-link-font-size, 0.8125rem)',
    lineHeight: 1.5,
    textAlign: 'start',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 120ms ease, border-color 120ms ease',

    '&:hover': {
      color: 'var(--anchor-link-hover-color, var(--text-basic-color, #222b45))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  active: {
    color: 'var(--anchor-active-color, var(--color-primary-500, #3366ff))',
    borderInlineStartColor:
      orientation === 'vertical'
        ? 'var(--anchor-active-color, var(--color-primary-500, #3366ff))'
        : undefined,
    fontWeight: 600
  }
}));

export type AnchorStylesNames = Selectors<typeof useStyles>;

export interface AnchorProps
  extends
    DefaultProps<AnchorStylesNames, AnchorStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'nav'>, 'onChange'> {
  items: AnchorItem[];
  activeKey?: string;
  onActiveChange?(key: string): void;
  offset?: number;
  smooth?: boolean;
  orientation?: AnchorOrientation;
  ariaLabel?: string;
  getScrollContainer?: () => HTMLElement | null;
}

const defaultProps: Partial<AnchorProps> = {
  offset: 80,
  smooth: true,
  orientation: 'vertical',
  ariaLabel: 'Anchor navigation'
};

function scrollToTarget(
  href: string,
  offset: number,
  smooth: boolean,
  scrollContainer?: HTMLElement | null
) {
  if (typeof document === 'undefined' || typeof href !== 'string' || !href.startsWith('#')) {
    return false;
  }

  let id = href.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // Allow fragments matching an element ID that contains a literal percent.
  }
  const target = (scrollContainer?.ownerDocument ?? document).getElementById(id);
  if (!target || (scrollContainer && !scrollContainer.contains(target))) {
    return false;
  }

  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';

  if (scrollContainer) {
    const top =
      target.getBoundingClientRect().top -
      scrollContainer.getBoundingClientRect().top -
      scrollContainer.clientTop +
      scrollContainer.scrollTop -
      offset;
    if (typeof scrollContainer.scrollTo === 'function') {
      scrollContainer.scrollTo({ top, behavior });
    } else {
      scrollContainer.scrollTop = top;
    }
    return true;
  }

  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    const currentY = typeof window.scrollY === 'number' ? window.scrollY : window.pageYOffset || 0;

    window.scrollTo({ top: target.getBoundingClientRect().top + currentY - offset, behavior });
    return true;
  }

  if (typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ behavior, block: 'start' });
  }

  return true;
}

const _Anchor = forwardRef<HTMLElement, AnchorProps>((props, ref) => {
  const {
    items,
    activeKey,
    onActiveChange,
    offset,
    smooth,
    orientation,
    ariaLabel,
    getScrollContainer,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { orientation },
    { name: 'anchor', classNames, styles, unstyled }
  );
  const [currentKey, setCurrentKey] = useUncontrolled<string>({
    value: activeKey,
    finalValue: '',
    onChange: onActiveChange
  });

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, item: AnchorItem) => {
    if (item.href && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) {
      return;
    }
    if (!item.href || scrollToTarget(item.href, offset, smooth, getScrollContainer?.())) {
      event.preventDefault();
    }

    setCurrentKey(item.key);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>, item: AnchorItem) => {
    if (item.href || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    setCurrentKey(item.key);
  };

  return (
    <nav
      {...others}
      ref={ref}
      aria-label={ariaLabel}
      data-orientation={orientation}
      className={cx(classes.root, className)}
    >
      <ul className={cx(classes.list)}>
        {items.map((item) => {
          const isActive = currentKey === item.key;
          const depth = item.depth ?? 0;

          return (
            <li
              key={item.key}
              className={cx(classes.item)}
              style={depth > 0 ? { paddingInlineStart: depth * INDENT_SIZE } : undefined}
            >
              <a
                href={item.href}
                role={item.href ? undefined : 'link'}
                tabIndex={item.href ? undefined : 0}
                aria-current={isActive ? 'location' : undefined}
                className={cx(classes.link, { [classes.active]: isActive })}
                onClick={(event) => handleClick(event, item)}
                onKeyDown={(event) => handleKeyDown(event, item)}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});

_Anchor.displayName = 'Anchor';

export { _Anchor as Anchor };
