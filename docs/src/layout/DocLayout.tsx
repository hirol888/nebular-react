import React from 'react';
import { NebularProvider } from '@nebular-react/core';
import { DOCS_PAGE_THEME } from '../theme/DocsPageTheme';
import DocLayoutInner, { DocLayoutInnerProps } from './DocLLayoutInner';

export default function DocLayout({ children, pageContext, location }: DocLayoutInnerProps) {
  if (pageContext.layout === 'home') {
    return <>{children}</>;
  }

  document.documentElement.style.scrollPaddingTop = '9.51rem';

  return (
    <NebularProvider theme={DOCS_PAGE_THEME}>
      <DocLayoutInner location={location}>{children}</DocLayoutInner>
    </NebularProvider>
  );
}
