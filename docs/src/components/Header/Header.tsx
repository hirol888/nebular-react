import React from 'react';
import { Button, DefaultProps, Icon, Menu, MenuItem } from '@nebular-react/core';
import { Link } from 'gatsby';
import { Search } from '../HomePage/Search/Search';
import useStyles from './Header.styles';
import { DocsHomeTheme } from '../../theme/DocsHomeTheme';
import { DocsPageTheme } from '../../theme/DocsPageTheme';

interface HeaderProps extends DefaultProps {
  hasSidebar?: boolean;
  showSearch?: boolean;
  isDocs?: boolean;
  toggleSidebar?: () => void;
}

interface Version {
  checkoutTarget: string;
  name: string;
  path: string;
  isCurrent?: boolean;
}

export function Header(props: HeaderProps) {
  const { hasSidebar, showSearch = true, isDocs = false, toggleSidebar, className } = props;
  const { classes, cx } = isDocs ? useStyles<DocsPageTheme>() : useStyles<DocsHomeTheme>();

  const version: Version = {
    name: 'dev',
    path: '.',
    checkoutTarget: 'master',
    isCurrent: true
  };

  return (
    <div
      className={cx(classes.root, className, {
        'docs-page': isDocs
      })}
    >
      <div className="section left">
        {hasSidebar && (
          <Button
            wrapperClassName="sidebar-toggle-wrapper"
            className="sidebar-toggle"
            onClick={() => typeof toggleSidebar === 'function' && toggleSidebar()}
          >
            <Icon icon="menu-2" />
          </Button>
        )}
        <div className="logo">
          <Link to="/">Nebular React</Link>
          <span className="version">v{version.name}</span>
        </div>
      </div>
      <div className="section middle">
        <Menu>
          <MenuItem id="Docs" title="Docs" component={Link} to="/docs" />
          <MenuItem
            id="Components"
            title="Components"
            component={Link}
            to="/docs/components/components-overview"
          />
          <MenuItem
            id="DesignSystem"
            title="Design System"
            component={Link}
            to="/docs/design-system/eva-design-system-intro"
          />
          <MenuItem id="Auth" title="Auth" component={Link} to="/docs/auth/introduction" />
          <MenuItem
            id="Seecurity"
            title="Security"
            component={Link}
            to="/docs/security/introduction"
          />
        </Menu>
        {showSearch && <Search />}
      </div>
      <div className="section right">
        <iframe
          title="github"
          className="stars"
          src="https://ghbtns.com/github-btn.html?user=hirol888&repo=nebular-react&type=star&count=true"
          frameBorder="0"
          scrolling="0"
        />
      </div>
    </div>
  );
}
