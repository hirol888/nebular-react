import React from 'react';
import { render } from '@testing-library/react';
import htmlReactParser from 'html-react-parser';
import type { EmotionServer } from '@emotion/server/create-instance';
import { createEmotionCache, defaultNebularEmotionCache } from '@nebular-react/styles';
import { createStylesServer, getSSRStyles, ServerStyles } from '@nebular-react/ssr';

// html-react-parser v6 is ESM-only, so Jest cannot load it through the CJS build of
// @nebular-react/ssr. This mock mirrors its behaviour for the markup emotion generates.
// Sucrase's `jest` transform hoists this call above the imports.
jest.mock('html-react-parser', () => {
  const mockReact = jest.requireActual('react');

  const parseStyleTags = (html: string) => {
    const nodes: React.ReactNode[] = [];
    const pattern = /<style data-emotion="([^"]*)">([\s\S]*?)<\/style>/g;
    let match = pattern.exec(html);

    while (match) {
      nodes.push(
        mockReact.createElement('style', {
          key: `style-${nodes.length}`,
          'data-emotion': match[1],
          dangerouslySetInnerHTML: { __html: match[2] }
        })
      );
      match = pattern.exec(html);
    }

    return nodes;
  };

  return { __esModule: true, default: jest.fn(parseStyleTags) };
});

const emotionServerModule = jest.requireActual<{ default: (...args: any[]) => any }>(
  '@emotion/server/create-instance'
);
const createEmotionServerSpy = jest.spyOn(emotionServerModule, 'default');
const htmlReactParserMock = jest.mocked(htmlReactParser);

function createFakeServer(styles: string, html = ''): EmotionServer {
  return {
    extractCriticalToChunks: jest.fn(() => ({ html, styles: [] })),
    constructStyleTagsFromChunks: jest.fn(() => styles)
  } as unknown as EmotionServer;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createStylesServer', () => {
  it('createStylesServer_WithoutCache_ShouldUseTheDefaultNebularCache', () => {
    const server = createStylesServer();

    expect(createEmotionServerSpy).toHaveBeenCalledTimes(1);
    expect(createEmotionServerSpy).toHaveBeenCalledWith(defaultNebularEmotionCache);
    expect(typeof server.extractCriticalToChunks).toBe('function');
    expect(typeof server.constructStyleTagsFromChunks).toBe('function');
  });

  it('createStylesServer_WithCustomCache_ShouldUseTheProvidedCache', () => {
    const cache = createEmotionCache({ key: 'custom-nebular' });

    const server = createStylesServer(cache);

    expect(createEmotionServerSpy).toHaveBeenCalledTimes(1);
    expect(createEmotionServerSpy).toHaveBeenCalledWith(cache);
    expect(createEmotionServerSpy).not.toHaveBeenCalledWith(defaultNebularEmotionCache);
    expect(server).toBeDefined();
  });
});

describe('getSSRStyles', () => {
  it('getSSRStyles_WithExtractedChunks_ShouldGenerateAStyleTagPerChunk', () => {
    const cache = createEmotionCache({ key: 'ssr-test' });

    cache.inserted['chunk-a'] = '.chunk-a{color:red;}';
    cache.inserted['chunk-b'] = '.chunk-b{color:blue;}';

    const server = createStylesServer(cache);
    const styles = getSSRStyles('<div class="chunk-a chunk-b">Hello</div>', server);

    expect(styles).toContain('data-emotion="ssr-test-global chunk-a"');
    expect(styles).toContain('.chunk-a{color:red;}');
    expect(styles).toContain('data-emotion="ssr-test-global chunk-b"');
    expect(styles).toContain('.chunk-b{color:blue;}');
    expect(styles.match(/<style/g)).toHaveLength(3);
  });

  it('getSSRStyles_WithEmptyHtml_ShouldNotGenerateAnyCssRule', () => {
    const cache = createEmotionCache({ key: 'empty-test' });
    const server = createStylesServer(cache);

    const styles = getSSRStyles('', server);

    expect(styles).not.toContain('{');
    expect(styles).not.toContain('color');
  });

  it('getSSRStyles_ShouldExtractCriticalChunksFromTheProvidedHtml', () => {
    const server = createFakeServer('<style data-emotion="nebular a">.a{}</style>');
    const html = '<html><body><div class="a">Hello</div></body></html>';

    const styles = getSSRStyles(html, server);

    expect(server.extractCriticalToChunks).toHaveBeenCalledTimes(1);
    expect(server.extractCriticalToChunks).toHaveBeenCalledWith(html);
    expect(server.constructStyleTagsFromChunks).toHaveBeenCalledTimes(1);
    expect(styles).toBe('<style data-emotion="nebular a">.a{}</style>');
  });
});

describe('ServerStyles', () => {
  it('ServerStyles_WithMultipleChunks_ShouldRenderEveryStyleTag', () => {
    const server = createFakeServer(
      '<style data-emotion="nebular a">.a{color:red;}</style>' +
        '<style data-emotion="nebular b">.b{color:blue;}</style>',
      '<div class="a b">Hello</div>'
    );

    const { container } = render(
      <ServerStyles html="<div class='a b'>Hello</div>" server={server} />
    );
    const styleTags = Array.from(container.querySelectorAll('style'));

    expect(styleTags).toHaveLength(2);
    expect(styleTags[0]).toHaveAttribute('data-emotion', 'nebular a');
    expect(styleTags[0].textContent).toBe('.a{color:red;}');
    expect(styleTags[1]).toHaveAttribute('data-emotion', 'nebular b');
    expect(styleTags[1].textContent).toBe('.b{color:blue;}');
  });

  it('ServerStyles_WithEmptyStyles_ShouldRenderNothing', () => {
    const server = createFakeServer('', '');
    const { container } = render(<ServerStyles html="" server={server} />);

    expect(container.innerHTML).toBe('');
    expect(server.extractCriticalToChunks).toHaveBeenCalledWith('');
    expect(htmlReactParserMock).toHaveBeenCalledWith('');
  });

  it('ServerStyles_ShouldOnlyParseTheGeneratedStyles', () => {
    const styles = '<style data-emotion="nebular c">.c{color:green;}</style>';
    const server = createFakeServer(styles, '<div class="c">Hello</div>');
    const pageHtml =
      '<html><body><div class="c">Hello</div><script>window.__nebular = "injected";</script></body></html>';

    const { container } = render(<ServerStyles html={pageHtml} server={server} />);

    expect(htmlReactParserMock).toHaveBeenCalledTimes(1);
    expect(htmlReactParserMock).toHaveBeenCalledWith(styles);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('div')).toBeNull();
    expect(container.querySelectorAll('style')).toHaveLength(1);
  });

  it('ServerStyles_WithSpecialCharactersInCss_ShouldKeepTheStylesIntact', () => {
    const css = '@media (min-width: 40rem){.d > .e::after{content:">"}}';
    const server = createFakeServer(`<style data-emotion="nebular d">${css}</style>`);

    const { container } = render(<ServerStyles html="" server={server} />);
    const style = container.querySelector('style') as HTMLStyleElement;

    expect(style).not.toBeNull();
    expect(style.textContent).toBe(css);
    expect(container.querySelectorAll('style')).toHaveLength(1);
  });

  it('ServerStyles_WithEmptyIds_ShouldKeepTheChunkKeyWithATrailingSpace', () => {
    const server = createFakeServer('<style data-emotion="nebular "></style>');

    const { container } = render(<ServerStyles html="" server={server} />);
    const style = container.querySelector('style') as HTMLStyleElement;

    expect(style).toHaveAttribute('data-emotion', 'nebular ');
    expect(style.textContent).toBe('');
  });
});
