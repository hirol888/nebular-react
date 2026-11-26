import React, {
  Children,
  forwardRef,
  isValidElement,
  KeyboardEvent,
  ReactElement,
  useRef
} from 'react';
import {
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  createPolymorphicComponent
} from '@nebular-react/styles';
import { useUncontrolled } from '@mantine/hooks';
import { useId } from '@nebular-react/hooks';
import { Tab } from './Tab';
import useStyles from './Tabset.style';
import { TabTitle } from './TabTitle';

export type TabsetStylesNames = Selectors<typeof useStyles>;

type TabElement = ReactElement<{
  children?: React.ReactNode;
  responsive?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  title?: string;
  badge?: React.ReactNode;
  closable?: boolean;
}>;

export interface TabsetProps
  extends DefaultProps<TabsetStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  activeTabIndex?: number;
  lazyLoad?: boolean;
  /** Keeps every tab panel mounted, even before its first activation. */
  keepMounted?: boolean;
  fullWidth?: boolean;
  onTabChange?: (tabIndex: number) => void;
  onTabClose?: (tabIndex: number) => void;
  /** Accessible title for the close affordance. */
  closeLabel?: (title: string | undefined, tabIndex: number) => string;
  ariaLabel?: string;
  children?: React.ReactNode;
}

const defaultCloseLabel = (title: string | undefined, tabIndex: number) =>
  `Close ${title ?? `tab ${tabIndex + 1}`}`;

const defaultProps: Partial<TabsetProps> = {
  fullWidth: false,
  lazyLoad: false,
  keepMounted: false,
  closeLabel: defaultCloseLabel,
  ariaLabel: 'Tabs'
};

const _Tabset = forwardRef<HTMLDivElement, TabsetProps>((props, ref) => {
  const {
    activeTabIndex,
    fullWidth,
    lazyLoad,
    keepMounted,
    onTabChange,
    onTabClose,
    closeLabel,
    ariaLabel,
    children,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'tabset', classNames, styles, unstyled });

  const [active, setActive] = useUncontrolled({
    value: activeTabIndex,
    defaultValue: 0,
    finalValue: 0,
    onChange: onTabChange
  });

  const tabs = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === Tab
  ) as TabElement[];

  const initialLoaded = tabs.map((tab, index) => index === activeTabIndex);
  const loadedTabs = useRef<boolean[]>(initialLoaded);

  const handleTabClick = (index: number) => {
    setActive(index);
    loadedTabs.current[index] = true;
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLLIElement>, index: number) => {
    if (event.key === ' ' || event.key === 'Enter') {
      setActive(index);
      loadedTabs.current[index] = true;
    }
  };

  const requestClose = (index: number) => {
    onTabClose?.(index);
  };

  const handleClose = (event: React.MouseEvent<HTMLElement>, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    requestClose(index);
  };

  const uuid = useId();

  return (
    <div
      className={cx(classes.root, className, {
        [classes.fullWidth]: fullWidth
      })}
      {...others}
      ref={ref}
    >
      <ul className={cx(classes.tabsetUl)} role="tablist" aria-label={ariaLabel}>
        {tabs?.map((tab, index) => {
          const tabTitle = Children.toArray(tab.props.children).find(
            (t) => isValidElement(t) && t.type === TabTitle
          );
          const tabId = `${uuid}-tab-${index}`;
          const panelId = `${uuid}-tabpanel-${index}`;

          return (
            <li
              className={cx(classes.tabLi, {
                [classes.tabResponsive]: tab.props.responsive,
                active: index === active,
                [classes.tabDisabled]: tab.props.disabled
              })}
              key={tabId}
              role="presentation"
              onClick={() => handleTabClick(index)}
              onKeyUp={(event) => handleKeyUp(event, index)}
            >
              <a
                href="#"
                id={tabId}
                role="tab"
                aria-selected={index === active}
                aria-controls={panelId}
                aria-disabled={tab.props.disabled || undefined}
                aria-keyshortcuts={tab.props.closable && !tab.props.disabled ? 'Delete' : undefined}
                onClick={(event) => event.preventDefault()}
                onKeyDown={(event) => {
                  if (
                    (event.key === 'Delete' || event.key === 'Backspace') &&
                    tab.props.closable &&
                    !tab.props.disabled
                  ) {
                    event.preventDefault();
                    requestClose(index);
                  }
                }}
                tabIndex={index === active ? 0 : -1}
                className={cx(classes.tabLink)}
              >
                {tab.props.icon && <>{tab.props.icon}</>}
                {tabTitle || <span className={cx(classes.tabText)}>{tab.props.title}</span>}
                {tab.props.closable && !tab.props.disabled && (
                  <span
                    role="presentation"
                    aria-hidden="true"
                    title={closeLabel?.(tab.props.title, index)}
                    className={cx(classes.tabClose)}
                    onClick={(event) => handleClose(event, index)}
                  >
                    ×
                  </span>
                )}
              </a>
              {tab.props.badge && <>{tab.props.badge}</>}
            </li>
          );
        })}
      </ul>
      {tabs?.map((tab, index) =>
        keepMounted || index === active || !lazyLoad || (lazyLoad && loadedTabs.current[index]) ? (
          <div
            className={cx(classes.tab, {
              [classes.tabActive]: index === active
            })}
            key={`${uuid}-tabpanel-${index}`}
            id={`${uuid}-tabpanel-${index}`}
            role="tabpanel"
            aria-labelledby={`${uuid}-tab-${index}`}
            hidden={index !== active}
          >
            {tab}
          </div>
        ) : null
      )}
    </div>
  );
}) as any;

_Tabset.displayName = 'Tabset';
_Tabset.Tab = Tab;
_Tabset.Title = TabTitle;

export const Tabset = createPolymorphicComponent<
  'div',
  TabsetProps,
  { Tab: typeof Tab; Title: typeof TabTitle }
>(_Tabset);
