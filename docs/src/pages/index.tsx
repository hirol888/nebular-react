import React, { useState } from 'react';
import { NebularProvider } from '@nebular-react/core';
import { PageHead } from '../components/PageHead/PageHead';
import { HomePage } from '../components/HomePage/HomePage';
import { DOCS_HOME_THEME } from '../theme/DocsHomeTheme';

export default function Index() {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

  return (
    <NebularProvider theme={DOCS_HOME_THEME} dir={dir}>
      <HomePage />
    </NebularProvider>
  );
}

export const Head = () => <PageHead title="Nebular" disableTitleTemplate />;
