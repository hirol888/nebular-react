import React, { useRef } from 'react';
import { Button } from '../Button';
import { Layout } from '../Layout';
import { Sidebar, SidebarRef } from './Sidebar';
import useStyles from './Sidebar.story.style';

export default { title: 'Sidebar' };

export function Showcase() {
  const { classes, cx } = useStyles();

  return (
    <Layout
      sidebars={<Sidebar>Sidebar content</Sidebar>}
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

export function Compacted() {
  const { classes, cx } = useStyles();

  return (
    <Layout
      sidebars={<Sidebar sidebarStatus="compacted" />}
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

export function Fixed() {
  const sidebarRef = useRef<SidebarRef>(null);

  const { classes, cx } = useStyles();
  const toggle = () => sidebarRef.current.toggle();

  return (
    <Layout
      header={
        <Layout.Header fixed>
          <Button onClick={toggle} status="success" size="tiny">
            Toggle
          </Button>
        </Layout.Header>
      }
      sidebars={<Sidebar ref={sidebarRef} fixed responsive />}
      columns={
        <Layout.Column className={cx(classes.coloredColumnInfo)}>
          Long layout content so that it is clear that fixed sidebar is shown on top of the content.
        </Layout.Column>
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

export function Right() {
  const { classes, cx } = useStyles();

  return (
    <Layout
      sidebars={<Sidebar right>Right Sidebar</Sidebar>}
      columns={
        <Layout.Column className={cx(classes.coloredColumnWarning)}>Layout Content</Layout.Column>
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

export function OneTest() {
  return (
    <Layout
      sidebars={
        <>
          <Sidebar>Left</Sidebar>
          <Sidebar right>Right</Sidebar>
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

export function TwoTest() {
  return (
    <Layout
      header={<Layout.Header />}
      sidebars={
        <>
          <Sidebar>Left</Sidebar>
          <Sidebar right fixed>
            Right
          </Sidebar>
        </>
      }
      footer={<Layout.Footer />}
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

export function ThreeTest() {
  return (
    <Layout
      header={<Layout.Header />}
      sidebars={
        <>
          <Sidebar sidebarStatus="collapsed">Left</Sidebar>
          <Sidebar sidebarStatus="compacted" fixed right>
            Right
          </Sidebar>
        </>
      }
      footer={<Layout.Footer />}
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

export function Toggle() {
  const { classes, cx } = useStyles();
  const leftSidebarRef = useRef<SidebarRef>(null);
  const rightSidebarRef = useRef<SidebarRef>(null);

  return (
    <Layout
      header={
        <Layout.Header fixed>
          <Button status="success" size="tiny" onClick={() => leftSidebarRef.current.toggle()}>
            Toggle Left
          </Button>
          <Button
            status="info"
            size="tiny"
            style={{ marginLeft: 'auto' }}
            onClick={() => rightSidebarRef.current.toggle()}
          >
            Toggle Right Compact
          </Button>
        </Layout.Header>
      }
      sidebars={
        <>
          <Sidebar ref={leftSidebarRef} />
          <Sidebar right ref={rightSidebarRef} />
        </>
      }
      columns={
        <Layout.Column className={cx(classes.coloredColumnWarning)}>Layout Content</Layout.Column>
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
