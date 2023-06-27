import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Layout,
  Menu,
  MenuItem,
  Sidebar,
  SidebarRef,
  SidebarStatus
} from '@nebular-react/core';
import { graphql, Link, useStaticQuery } from 'gatsby';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';
import useStyles from './DocLayoutInner.styles';
import { getDocsData } from '../pages/utils/get-docs-data';
import { Frontmatter } from '../types';
import { Category } from '../settings';

export interface DocLayoutInnerProps {
  pageContext?: any;
  children?: React.ReactNode;
  location: {
    pathname: string;
  };
}

export default function DocLayoutInner({ children }: DocLayoutInnerProps) {
  const { cx, classes } = useStyles();
  const data = getDocsData(useStaticQuery(query));
  const docMenu = getMenus(data);
  console.log(docMenu);
  const [expandedItems, setExpandedItems] = useState<string[]>([
    ...location.pathname.match(/([^\/]+)/g).map((x) => transformToCapitalized(x).toLowerCase())
  ]);
  const [selectedItem, setSelectedItem] = useState<string>(
    transformToCapitalized(location.pathname.match(/\/([^\/]*)\/?$/)[1]).toLowerCase()
  );

  useEffect(() => {
    setSelectedItem(
      transformToCapitalized(location.pathname.match(/\/([^\/]*)\/?$/)[1]).toLowerCase()
    );
  }, [location.pathname]);

  const sidebarRef = useRef<SidebarRef>(null);
  const toggleSidebar = () => sidebarRef.current.toggle();

  return (
    <Layout
      className={cx(classes.root, 'abc')}
      header={
        <Layout.Header fixed>
          <div className="content-center">
            <Header className="docs-header" toggleSidebar={toggleSidebar} isDocs hasSidebar />
          </div>
        </Layout.Header>
      }
      sidebars={
        <Sidebar
          className="menu-sidebar"
          responsive
          compactedBreakpoints={[]}
          collapsedBreakpoints={['xs', 'is', 'sm', 'md', 'lg']}
          ref={sidebarRef}
        >
          <Button wrapperClassName="collapse-all">Collapse all</Button>
          <Menu
            onExpand={(items) => setExpandedItems(items)}
            initialExpanded={expandedItems}
            onSelect={(item) => setSelectedItem(item)}
            initialSelected={selectedItem}
          >
            {docMenu.map((item) => (
              <MenuItem id={item.title.toLowerCase()} key={item.title} title={item.title}>
                {item.children.map((c) => {
                  if (c.to) {
                    return (
                      <MenuItem
                        id={c.title.toLowerCase()}
                        key={c.title}
                        title={c.title}
                        component={Link}
                        to={c.to}
                      />
                    );
                  }

                  return (
                    <MenuItem
                      id={c.title.toLowerCase()}
                      key={c.title}
                      title={c.title}
                      group={c.group}
                    >
                      {c.children.map((p) => {
                        if (p.to) {
                          return (
                            <MenuItem
                              id={p.title.toLowerCase()}
                              key={p.title}
                              title={p.title}
                              component={Link}
                              to={p.to}
                            />
                          );
                        }
                      })}
                    </MenuItem>
                  );
                })}
              </MenuItem>
            ))}
          </Menu>
        </Sidebar>
      }
      columns={
        <Layout.Column>
          {children}
          <div className="contact-us">
            <h2>Need some help or found an issue?</h2>
            <p>
              Ask on <a href="https://stackoverflow.com/questions/ask">Stack Overflow</a> with tag
              `nebular` or post an issue on{' '}
              <a href="https://github.com/akveo/nebular/issues/new">GitHub</a>.
            </p>
          </div>
        </Layout.Column>
      }
      footer={
        <Layout.Footer>
          <Footer />
        </Layout.Footer>
      }
    />
  );
}

const query = graphql`
  {
    allMdx {
      edges {
        node {
          id
          frontmatter {
            group
            title
            order
            slug
            category
            description
            package
          }
        }
      }
    }
  }
`;

function getMenus(
  allMdx: {
    uncategorized: Frontmatter[];
    groups: {
      category: Category;
      pages: Frontmatter[];
    }[];
    group: string;
  }[]
) {
  return allMdx.map((item) => {
    const children = [];
    if (item.uncategorized.length > 0) {
      item.uncategorized.forEach((uItem) => {
        children.push({
          title: transformToCapitalized(uItem.title),
          to: uItem.slug
        });
      });
    }

    if (item.groups.length > 0) {
      item.groups.forEach((g) => {
        const gChildren = [];
        if (g.pages.length > 0) {
          g.pages.forEach((p) => {
            gChildren.push({
              title: transformToCapitalized(p.title),
              to: p.slug
            });
          });
        }

        children.push({ title: g.category.title, group: true, children: gChildren });
      });
    }

    return {
      title: transformToCapitalized(item.group),
      group: false,
      children
    };
  });
}

function transformToCapitalized(original: string) {
  const parts = original.split('-');

  const capitalizedParts = parts.map((part) => {
    const firstLetter = part.charAt(0).toUpperCase();
    const rest = part.slice(1);
    return firstLetter + rest;
  });

  return capitalizedParts.join(' ');
}
