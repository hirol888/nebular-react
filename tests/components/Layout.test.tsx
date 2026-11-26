import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Layout, NebularProvider, Sidebar, changeScrollable } from '@nebular-react/core';

function getRoot(container: HTMLElement) {
  return container.querySelector('.nebular-layout-root') as HTMLElement;
}

describe('Layout', () => {
  afterEach(() => {
    document.body.style.overflow = '';
    document.documentElement.classList.remove('global-scrollblock');
  });

  it('renders header, subheader, sidebars, columns and footer', () => {
    const { container } = render(
      <Layout
        header={<Layout.Header>Layout header</Layout.Header>}
        subheader={<Layout.Header subheader>Layout subheader</Layout.Header>}
        sidebars={
          <Sidebar>
            <span>Sidebar navigation</span>
          </Sidebar>
        }
        columns={
          <>
            <Layout.Column>First column</Layout.Column>
            <Layout.Column>Second column</Layout.Column>
          </>
        }
        footer={<Layout.Footer>Layout footer</Layout.Footer>}
      />
    );

    const root = getRoot(container);
    const layoutContainer = root.querySelector('.nebular-layout-layoutContainer') as HTMLElement;
    const content = root.querySelector('.nebular-layout-content') as HTMLElement;

    expect(root).toHaveClass('nebular-layout-root', 'nebular-layout-withSubheader');
    expect(root.querySelector('.nebular-layout-header-root')).toHaveTextContent('Layout header');
    expect(root.querySelector('.nebular-layout-footer-root')).toHaveTextContent('Layout footer');
    expect(root.querySelector('.nebular-layout-header-root nav')).toHaveTextContent(
      'Layout header'
    );
    expect(root.querySelector('.nebular-layout-footer-root nav')).toHaveTextContent(
      'Layout footer'
    );

    expect(layoutContainer.children[0]).toHaveClass('nebular-sidebar-root');
    expect(layoutContainer.children[1]).toHaveClass('nebular-layout-content');
    expect(screen.getByText('Sidebar navigation')).toBeInTheDocument();
    expect(content).toHaveTextContent('Layout subheader');
    expect(content).toHaveTextContent('First column');
    expect(content).toHaveTextContent('Second column');
    expect(content).toHaveTextContent('Layout footer');
  });

  it('does not render optional regions when they are not provided', () => {
    const { container } = render(<Layout columns={<Layout.Column>Only content</Layout.Column>} />);
    const root = getRoot(container);

    expect(root).not.toHaveClass('nebular-layout-withSubheader');
    expect(root.querySelector('.nebular-layout-header-root')).toBeNull();
    expect(root.querySelector('.nebular-layout-footer-root')).toBeNull();
    expect(root.querySelector('.nebular-sidebar-root')).toBeNull();
    expect(screen.getByText('Only content')).toBeInTheDocument();
  });

  it('applies the windowMode and center variations', () => {
    const { container } = render(
      <Layout windowMode center columns={<Layout.Column>Centered content</Layout.Column>} />
    );
    const root = getRoot(container);

    expect(root).toHaveClass('nebular-layout-windowMode');
    expect(root.querySelector('.nebular-layout-content')).toHaveClass(
      'nebular-layout-contentCenter'
    );
  });

  it('does not apply the centered content class by default', () => {
    const { container } = render(<Layout columns={<Layout.Column>Content</Layout.Column>} />);

    expect(getRoot(container).querySelector('.nebular-layout-content')).not.toHaveClass(
      'nebular-layout-contentCenter'
    );
  });

  it('marks fixed headers and prevents subheaders from being fixed', () => {
    const { container } = render(
      <>
        <Layout.Header fixed>Fixed header</Layout.Header>
        <Layout.Header subheader fixed>
          Subheader
        </Layout.Header>
      </>
    );

    const headers = container.querySelectorAll('.nebular-layout-header-root');

    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveClass('nebular-layout-header-fixed');
    expect(headers[1]).not.toHaveClass('nebular-layout-header-fixed');
    expect(headers[1]).toHaveTextContent('Subheader');
    expect(headers[0].querySelector('nav')).toContainElement(screen.getByText('Fixed header'));
  });

  it('positions columns with left and start modifiers', () => {
    const { container } = render(
      <>
        <Layout.Column left>Left column</Layout.Column>
        <Layout.Column start>Start column</Layout.Column>
      </>
    );

    const columns = container.querySelectorAll('.nebular-layout-column-root');

    expect(columns).toHaveLength(2);
    expect(columns[0]).toHaveClass('nebular-layout-column-left');
    expect(columns[0]).not.toHaveClass('nebular-layout-column-start');
    expect(columns[1]).toHaveClass('nebular-layout-column-start');
    expect(columns[1]).not.toHaveClass('nebular-layout-column-left');
  });

  it('blocks document scrolling when withScroll is enabled', () => {
    const { container, rerender } = render(
      <Layout withScroll columns={<Layout.Column>Scrollable content</Layout.Column>} />
    );
    const root = getRoot(container);

    expect(root).toHaveClass('nebular-layout-withScroll');
    expect(root.querySelector('.nebular-layout-scrollableContainer')).toHaveClass(
      'nebular-layout-withScroll'
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<Layout columns={<Layout.Column>Scrollable content</Layout.Column>} />);

    expect(root).not.toHaveClass('nebular-layout-withScroll');
    expect(document.body.style.overflow).toBe('initial');
  });

  it('blocks document scrolling when the provider is not scrollable', () => {
    render(
      <NebularProvider scrollable={false}>
        <Layout withScroll columns={<Layout.Column>Content</Layout.Column>} />
      </NebularProvider>
    );

    expect(document.documentElement).toHaveClass('global-scrollblock');
    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      changeScrollable(true);
    });

    expect(document.documentElement).not.toHaveClass('global-scrollblock');
  });

  it('forwards className and refs to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <Layout ref={ref} className="custom-layout" data-testid="layout" />
    );

    expect(ref.current).toBe(getRoot(container));
    expect(ref.current).toHaveClass('custom-layout');
    expect(screen.getByTestId('layout')).toBe(ref.current);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Layout
        header={
          <Layout.Header>
            <a href="#home">Home</a>
          </Layout.Header>
        }
        columns={
          <Layout.Column>
            <h1>Dashboard</h1>
          </Layout.Column>
        }
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders a fixed footer and gives left precedence over start', () => {
    const { container } = render(
      <Layout
        footer={<Layout.Footer fixed>Footer</Layout.Footer>}
        columns={
          <Layout.Column left start>
            <h1>Column</h1>
          </Layout.Column>
        }
      />
    );

    expect(container.querySelector('.nebular-layout-footer-fixed')).not.toBeNull();
    expect(container.querySelector('.nebular-layout-column-left')).not.toBeNull();
    expect(container.querySelector('.nebular-layout-column-start')).toBeNull();
  });

  it('restores the scroll position when requested', () => {
    const scrollTo = jest.fn();
    const original = HTMLElement.prototype.scrollTo;
    HTMLElement.prototype.scrollTo = scrollTo;

    try {
      render(
        <Layout restoreScrollTop>
          <span>Content</span>
        </Layout>
      );

      expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 });
    } finally {
      HTMLElement.prototype.scrollTo = original;
    }
  });
});
