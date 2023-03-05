import React, {
  Children,
  forwardRef,
  isValidElement,
  KeyboardEvent,
  ReactElement,
  useRef
} from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import { useUncontrolled } from '@mantine/hooks';
import { useId } from '@nebular-react/hooks';
import { Tab } from './Tab';
import useStyles from './Tabset.style';
import { TabTitle } from './TabTitle';

export type TabsetStylesNames = Selectors<typeof useStyles>;

export interface TabsetProps
  extends DefaultProps<TabsetStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  activeTabIndex?: number;
  lazyLoad?: boolean;
  fullWidth?: boolean;
  onTabChange?: (tabIndex: number) => void;
  children?: React.ReactNode;
}

const defaultProps: Partial<TabsetProps> = {
  fullWidth: false,
  lazyLoad: false
};

const _Tabset = forwardRef<HTMLDivElement, TabsetProps>((props, ref) => {
  const {
    activeTabIndex,
    fullWidth,
    lazyLoad,
    onTabChange,
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
  );

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

  const uuid = useId();

  return (
    <div
      className={cx(classes.root, className, {
        [classes.fullWidth]: fullWidth
      })}
      {...others}
      ref={ref}
    >
      <ul className={cx(classes.tabsetUl)}>
        {(tabs as ReactElement[])?.map((tab, index) => {
          const tabTitle = Children.toArray(tab.props.children).find(
            (t) => isValidElement(t) && t.type === TabTitle
          );

          return (
            <li
              className={cx(classes.tabLi, {
                [classes.tabResponsive]: tab.props.responsive,
                active: index === active,
                [classes.tabDisabled]: tab.props.disabled
              })}
              key={`${uuid}-tab-header-${index}`}
              tabIndex={tab.props.disabled ? -1 : 0}
              onClick={() => handleTabClick(index)}
              onKeyUp={(event) => handleKeyUp(event, index)}
            >
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                tabIndex={-1}
                className={cx(classes.tabLink)}
              >
                {tab.props.icon && <>{tab.props.icon}</>}
                {tabTitle || <span className={cx(classes.tabText)}>{tab.props.title}</span>}
              </a>
              {tab.props.badge && <>{tab.props.badge}</>}
            </li>
          );
        })}
      </ul>
      {tabs?.map((tab, index) =>
        index === active || !lazyLoad || (lazyLoad && loadedTabs.current[index]) ? (
          <div
            className={cx(classes.tab, {
              [classes.tabActive]: index === active
            })}
            key={`${uuid}-tab-${index}`}
          >
            {tab}
          </div>
        ) : null
      )}
    </div>
  );
}) as any;

_Tabset.displayName = '@nebular-react/core/Tabset';
_Tabset.Tab = Tab;
_Tabset.Title = TabTitle;

export const Tabset = createPolymorphicComponent<
  'div',
  TabsetProps,
  { Tab: typeof Tab; Title: typeof TabTitle }
>(_Tabset);
