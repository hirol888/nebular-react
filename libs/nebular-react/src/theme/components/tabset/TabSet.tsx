import classNames from 'classnames';
import { ENTER, SPACE } from 'libs/nebular-react/src/core/cdk';
import React, {
  Children,
  isValidElement,
  JSXElementConstructor,
  KeyboardEvent,
  ReactElement,
  useEffect,
  useState
} from 'react';
import { NbBadge } from '../badge';
import { NbIcon } from '../icon';
import { NbTab } from './Tab';
import './tabset.scoped.scss';
import { NbTabTitle } from './TabTitle';

export type NbTabSetProps = {
  fullWidth?: boolean;
  onTabChange?: (index: number) => void;
};

const NbTabSet: React.FC<NbTabSetProps> = ({ fullWidth, onTabChange, children }) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [tabs, setTabs] = useState<ReactElement<any, string | JSXElementConstructor<any>>[] | null | undefined>();

  useEffect(() => {
    const _tabs = Children.map(children, (child) => {
      if (isValidElement(child) && child.type === NbTab) {
        return child;
      }
      return null;
    });

    setTabs(_tabs);
  }, [children]);

  const selectTab = (index: number) => {
    setSelectedTabIndex(index);
    onTabChange && onTabChange(index);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLLIElement>, index: number) => {
    if (event.keyCode === SPACE || event.keyCode === ENTER) {
      selectTab(index);
    }
  };

  return (
    <div
      className={classNames('nb-tabset', {
        'full-width': fullWidth
      })}
    >
      <ul className="tabset">
        {tabs?.map((tab, index) => {
          const tabTitle = Children.toArray(tab.props.children).find((t) => isValidElement(t) && t.type === NbTabTitle);

          return (
            <li
              className={classNames('tab', {
                responsive: tab.props.responsive,
                active: index === selectedTabIndex,
                disabled: tab.props.disabled
              })}
              key={`nb-tab-${index}`}
              onClick={() => selectTab(index)}
              onKeyUp={(event) => handleKeyUp(event, index)}
              tabIndex={tab.props.disabled ? -1 : 0}
              data-tab-id={tab.props.tabId}
            >
              <a href="#" onClick={(event) => event.preventDefault()} tabIndex={-1} className="tab-link">
                {tab.props.tabIcon && <NbIcon config={tab.props.tabIcon}></NbIcon>}
                {tabTitle ? tabTitle : <span className="tab-text">{tab.props.tabTitle}</span>}
              </a>
              {(tab.props.badgeText || tab.props.badgeDot) && (
                <NbBadge
                  text={tab.props.badgeText}
                  dotMode={tab.props.badgeDot}
                  status={tab.props.badgeStatus}
                  position={tab.props.badgePosition}
                />
              )}
            </li>
          );
        })}
      </ul>
      {tabs?.map((tab, index) => {
        return React.cloneElement(tab, { ...tab.props, active: index === selectedTabIndex });
      })}
    </div>
  );
};

export { NbTabSet };
