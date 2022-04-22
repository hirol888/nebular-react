import { NbThemeService } from '@nebular-react';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import React, { useEffect, useRef, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';
import './LayoutThemeToggle.scoped.scss';

const LayoutThemeToggle: React.FC = () => {
  const themeList = ['default', 'dark', 'cosmic', 'corporate'];

  const [currentTheme, setCurrentTheme] = useState<string>('');
  const destroy$ = useRef<Subject<void>>(new Subject<void>());

  const themeService = useInjection<NbThemeService>(TYPES.NbThemeService);

  const handleChange = (themeName: string) => {
    themeService.changeTheme(themeName);
  };

  useEffect(() => {
    themeService
      .onThemeChange()
      .pipe(takeUntil(destroy$.current))
      .subscribe((change) => {
        setCurrentTheme(change.name);
      });

    return () => {
      destroy$.current.next();
      destroy$.current.complete();
    };
  }, []);

  return (
    <div className="layout-theme-toggle" dir="ltr">
      {themeList.map((theme) => {
        return (
          <label className="theme-radio-label" key={theme}>
            <input
              type="radio"
              value={theme}
              name="theme"
              checked={theme === currentTheme}
              onChange={() => handleChange(theme)}
              className="theme-radio"
            />
            {theme}
          </label>
        );
      })}
    </div>
  );
};

export { LayoutThemeToggle };
