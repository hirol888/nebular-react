import React from 'react';
import { render, screen } from '@testing-library/react';
import type { DocumentContext } from 'next/document';
import NextDocument from 'next/document';
import { createStylesServer, ServerStyles } from '@nebular-react/ssr';
import { createGetInitialProps } from '@nebular-react/next';
import { createEmotionCache } from '@nebular-react/styles';

jest.mock('next/document', () => ({
  __esModule: true,
  default: { getInitialProps: jest.fn() }
}));

jest.mock('@nebular-react/ssr', () => {
  const mockReact = jest.requireActual('react');

  return {
    __esModule: true,
    createStylesServer: jest.fn(() => ({ mocked: true })),
    ServerStyles: jest.fn(({ html }: { html: string }) =>
      mockReact.createElement('style', { 'data-testid': 'nebular-server-styles' }, html)
    )
  };
});

const getInitialPropsMock = jest.mocked(NextDocument.getInitialProps);
const createStylesServerMock = jest.mocked(createStylesServer);
const serverStylesMock = jest.mocked(ServerStyles);

const html = '<div class="nebular-ssr">Nebula</div>';

function createDocumentContext(): DocumentContext {
  return {
    pathname: '/',
    query: {},
    renderPage: jest.fn(),
    defaultGetInitialProps: jest.fn()
  } as unknown as DocumentContext;
}

beforeEach(() => {
  jest.clearAllMocks();
  getInitialPropsMock.mockResolvedValue({
    html,
    head: [React.createElement('title', { key: 'title' }, 'Nebula')],
    styles: [React.createElement('link', { key: 'app-css', rel: 'stylesheet', href: '/app.css' })]
  });
});

describe('createGetInitialProps', () => {
  it('createGetInitialProps_ShouldCallNextDocumentGetInitialPropsWithTheContext', async () => {
    const ctx = createDocumentContext();
    const getInitialProps = createGetInitialProps();

    await getInitialProps(ctx);

    expect(getInitialPropsMock).toHaveBeenCalledTimes(1);
    expect(getInitialPropsMock).toHaveBeenCalledWith(ctx);
  });

  it('createGetInitialProps_ShouldMergeTheDocumentInitialProps', async () => {
    const getInitialProps = createGetInitialProps();

    const result = await getInitialProps(createDocumentContext());

    expect(result.html).toBe(html);
    expect(result.head).toHaveLength(1);
    expect(result.head[0].type).toBe('title');
  });

  it('createGetInitialProps_ShouldPreserveTheExistingStyles', async () => {
    const getInitialProps = createGetInitialProps();

    const result = await getInitialProps(createDocumentContext());

    const { container } = render(<>{result.styles}</>);
    const appStylesheet = container.querySelector('link[rel="stylesheet"]');

    expect(appStylesheet).not.toBeNull();
    expect(appStylesheet).toHaveAttribute('href', '/app.css');
  });

  it('createGetInitialProps_ShouldAppendTheNebularServerStyles', async () => {
    const getInitialProps = createGetInitialProps();

    const result = await getInitialProps(createDocumentContext());

    render(<>{result.styles}</>);

    expect(screen.getByTestId('nebular-server-styles')).toBeInTheDocument();
    expect(serverStylesMock).toHaveBeenCalledTimes(1);
    expect(serverStylesMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({ html, server: expect.anything() })
    );
  });

  it('createGetInitialProps_WithoutCache_ShouldUseTheDefaultStylesServer', async () => {
    const getInitialProps = createGetInitialProps();

    await getInitialProps(createDocumentContext());

    expect(createStylesServerMock).toHaveBeenCalledTimes(1);
    expect(createStylesServerMock).toHaveBeenCalledWith(undefined);
  });

  it('createGetInitialProps_WithCustomCache_ShouldForwardItToTheStylesServer', async () => {
    const cache = createEmotionCache({ key: 'next-test' });
    const getInitialProps = createGetInitialProps(cache);

    await getInitialProps(createDocumentContext());

    expect(createStylesServerMock).toHaveBeenCalledTimes(1);
    expect(createStylesServerMock).toHaveBeenCalledWith(cache);
  });

  it('createGetInitialProps_ShouldReuseTheServerCreatedAtSetupTime', async () => {
    const getInitialProps = createGetInitialProps();

    const first = await getInitialProps(createDocumentContext());
    const second = await getInitialProps(createDocumentContext());

    render(<>{first.styles}</>);
    render(<>{second.styles}</>);

    const stylesServer = createStylesServerMock.mock.results[0].value;

    expect(createStylesServerMock).toHaveBeenCalledTimes(1);
    expect(serverStylesMock).toHaveBeenCalledTimes(2);
    expect(serverStylesMock.mock.calls[0][0].server).toBe(stylesServer);
    expect(serverStylesMock.mock.calls[1][0].server).toBe(stylesServer);
  });

  it('createGetInitialProps_ShouldPropagateErrorsFromNextDocument', async () => {
    const error = new Error('document failed');
    getInitialPropsMock.mockRejectedValue(error);
    const getInitialProps = createGetInitialProps();

    await expect(getInitialProps(createDocumentContext())).rejects.toThrow('document failed');
  });
});
