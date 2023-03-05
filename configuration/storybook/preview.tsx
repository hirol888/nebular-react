import React, { useState } from 'react';
import {
  DialogProvider,
  WindowProvider,
  ToastrProvider,
  Toggle,
  Select,
  Option
} from '@nebular-react/core';
import {
  Direction,
  NebularProvider,
  DEFAULT_THEME,
  COSMIC_THEME,
  CORPORATE_THEME,
  DARK_THEME,
  NebularTheme
} from '@nebular-react/styles';

const AllThemes = [
  {
    name: 'light',
    theme: DEFAULT_THEME
  },
  {
    name: 'cosmic',
    theme: COSMIC_THEME
  },
  {
    name: 'corporate',
    theme: CORPORATE_THEME
  },
  {
    name: 'dark',
    theme: DARK_THEME
  }
];

function ThemeWrapper(props: any) {
  const [dir, setDir] = useState<Direction>('ltr');
  const [_theme, setTheme] = useState<NebularTheme>(DEFAULT_THEME);

  document.body.style.height = '100vh';
  document.body.style.backgroundColor =
    _theme.theme_name === 'cosmic'
      ? '#1b1b38'
      : _theme.theme_name === 'dark'
      ? '#151a30'
      : 'rgb(246, 249, 252)';

  const handleDirectionChange = (checked: boolean) => {
    setDir(checked ? 'rtl' : 'ltr');
  };

  const themes: Option[] = [
    { type: 'option', label: 'Light', value: 'light' },
    { type: 'option', label: 'Cosmic', value: 'cosmic' },
    { type: 'option', label: 'Corporate', value: 'corporate' },
    { type: 'option', label: 'Dark', value: 'dark' }
  ];

  const handleSelectTheme = (selected: Option) => {
    const { theme } = AllThemes.find((t) => t.name === selected.value);
    setTheme(theme);
  };

  return (
    <NebularProvider dir={dir} theme={_theme}>
      <WindowProvider>
        <DialogProvider>
          <ToastrProvider>{props.children}</ToastrProvider>
          <div
            style={{
              position: 'fixed',
              right: dir === 'rtl' ? 'unset' : 0,
              left: dir === 'rtl' ? 0 : 'unset',
              bottom: 0,
              display: 'flex'
            }}
          >
            <div style={{ margin: '0.25rem' }}>
              <Select
                options={themes}
                status="primary"
                defaultSelected={{ type: 'option', label: 'Light', value: 'light' }}
                onSelect={handleSelectTheme}
              />
            </div>
            <div style={{ margin: '0.25rem', display: 'flex' }}>
              <Toggle onCheckedChange={handleDirectionChange}>RTL</Toggle>
            </div>
          </div>
        </DialogProvider>
      </WindowProvider>
    </NebularProvider>
  );
}

const Story = ({ storyFn }) => storyFn();

export const decorators = [
  (storyFn) => (
    <ThemeWrapper>
      <Story storyFn={storyFn} />
    </ThemeWrapper>
  )
];
