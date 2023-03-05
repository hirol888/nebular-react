import React, { useRef, useState } from 'react';
import { Icon } from '../Icon';
import { Sidebar, SidebarRef, SidebarStatus } from '../Sidebar';
import { Layout } from './Layout';
import useStyles from './Layout.story.style';
import { Action, Actions } from '../Actions';

export default { title: 'Layout' };

export function Showcase() {
  const { classes, cx } = useStyles();

  return (
    <Layout
      header={<Layout.Header>Layout Header</Layout.Header>}
      columns={
        <>
          <Layout.Column className={cx(classes.coloredColumnWarning)}>Left Column</Layout.Column>
          <Layout.Column className={cx(classes.coloredColumnDanger)}>Right Column</Layout.Column>
        </>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function ColumnLeft() {
  const { classes, cx } = useStyles();

  return (
    <Layout
      columns={
        <>
          <Layout.Column className={cx(classes.coloredColumnWarning)}>Second</Layout.Column>
          <Layout.Column className={cx(classes.coloredColumnInfo)}>Third</Layout.Column>
          <Layout.Column left className={cx(classes.coloredColumnSuccess)}>
            First (but third in template)
          </Layout.Column>
        </>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function FixedHeader() {
  const { classes, cx } = useStyles();

  return (
    <Layout
      header={<Layout.Header fixed>Layout Header</Layout.Header>}
      columns={
        <Layout.Column className={cx(classes.coloredColumnPrimary)}>Hello World!</Layout.Column>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function Header() {
  return (
    <Layout
      header={
        <Layout.Header fixed>
          <a href="#" />
        </Layout.Header>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function Footer() {
  return (
    <Layout
      footer={<Layout.Footer fixed>&copy;</Layout.Footer>}
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function SidebarSubheader() {
  const { classes, cx } = useStyles();
  const sidebarRef = useRef<SidebarRef>(null);

  const toggleSidebar = () => sidebarRef.current?.toggle(true);

  return (
    <Layout
      header={
        <Layout.Header subheader>
          <Action onClick={toggleSidebar} icon={<Icon icon="menu-outline" />} />
        </Layout.Header>
      }
      sidebars={<Sidebar ref={sidebarRef} />}
      columns={
        <Layout.Column className={cx(classes.coloredColumnSuccess)}>Layout Content</Layout.Column>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function Subheader() {
  const { classes, cx } = useStyles();
  const [sidebarStatus, setSidebarStatus] = useState<SidebarStatus>('expanded');

  const toggle = () => setSidebarStatus(sidebarStatus === 'expanded' ? 'collapsed' : 'expanded');

  return (
    <Layout
      header={
        <Layout.Header fixed>
          <Action onClick={toggle} icon={<Icon icon="menu-outline" />} />
        </Layout.Header>
      }
      subheader={
        <Layout.Header subheader>
          <Actions>
            <Action>
              <Icon icon="home-outline" />
            </Action>
            <Action>
              <Icon icon="search-outline" />
            </Action>
            <Action>
              <Icon icon="edit-outline" />
            </Action>
          </Actions>
        </Layout.Header>
      }
      sidebars={<Sidebar sidebarStatus={sidebarStatus} />}
      columns={
        <Layout.Column className={cx(classes.coloredColumnPrimary)}>Layout Content</Layout.Column>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}
