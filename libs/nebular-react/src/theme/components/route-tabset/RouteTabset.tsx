import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Link, LinkProps, RouteProps, Routes, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { NbBadge } from '../badge';
import { NbIcon } from '../icon';
import { NbTabProps } from '../tabset';
import './route-tabset.scoped.scss';

export type NbRouteTabsetProps = {
  fullWidth?: boolean;
  tabs: NbRouteTab[];
  onTabChange?: (index: number) => void;
};

export type NbRouteTab = {
  link: LinkProps;
  route: React.ReactElement<RouteProps>;
} & NbTabProps;

const NbRouteTabset: React.FC<NbRouteTabsetProps> = ({ fullWidth, tabs, onTabChange, children }) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentTab = location.pathname.split('/').pop();
    let foundTabInPath = false;
    for (let i = 0; i < tabs.length; i++) {
      if (currentTab === tabs[i].route.props.path) {
        setSelectedTabIndex(i);
        onTabChange && onTabChange(i);
        foundTabInPath = true;
        break;
      }
    }

    if (!foundTabInPath) {
      setSelectedTabIndex(0);
      onTabChange && onTabChange(0);
      navigate(tabs[0].link.to);
    }
  }, []);

  const selectTab = (index: number) => {
    setSelectedTabIndex(index);
    onTabChange && onTabChange(index);
  };

  return (
    <div
      className={classNames('nb-route-tabset', {
        'full-width': fullWidth
      })}
    >
      <ul className="route-tabset">
        {tabs.map((tab, index) => {
          return (
            <li
              key={`nb-route-tab-${index}`}
              className={classNames('route-tab', {
                responsive: tab.responsive,
                active: index === selectedTabIndex,
                disabled: tab.disabled
              })}
              tabIndex={tab.disabled ? -1 : 0}
            >
              <Link {...tab.link} onClick={() => selectTab(index)} className="tab-link">
                {tab.tabIcon && <NbIcon config={tab.tabIcon}></NbIcon>}
                {tab.tabTitle && <span className="tab-text">{tab.tabTitle}</span>}
              </Link>
              {(tab.badgeText || tab.badgeDot) && (
                <NbBadge
                  text={tab.badgeText}
                  dotMode={tab.badgeDot}
                  status={tab.badgeStatus}
                  position={tab.badgePosition}
                />
              )}
            </li>
          );
        })}
      </ul>
      <Routes>
        {tabs.map((tab, index) => React.cloneElement(tab.route, { ...tab.route.props, key: `tab-route-${index}` }))}
      </Routes>
    </div>
  );
};

export { NbRouteTabset };
