import React, { useMemo } from 'react';
import { Global } from '@emotion/react';
import { NebularTheme } from './types';

export const ThemeVariables = React.memo(({ theme }: { theme: NebularTheme }) => {
  const styleVariables = useMemo(() => {
    const styles = {};
    for (const [key, value] of Object.entries(theme)) {
      if (key !== 'theme_name' && key !== 'isDarkTheme' && key !== 'fns') {
        styles[`--${key.replaceAll('_', '-')}`] = value;
      }
    }
    return styles;
  }, [JSON.stringify(theme)]);

  return <Global styles={{ ':root': styleVariables }} />;
});
