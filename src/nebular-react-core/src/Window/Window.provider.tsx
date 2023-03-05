import React, { useRef, useState } from 'react';
import { GlobalPositionStrategy, useGlobalPositionStrategy } from '@nebular-react/hooks';
import { DefaultProps, useNebularDir } from '@nebular-react/styles';
import { Portal } from '../Portal';
import { useWindowEvents } from './events';
import { WindowConfig } from './types';
import { Window } from './Window';

export interface WindowsProviderProps extends DefaultProps {
  children?: React.ReactNode;
}

export function WindowProvider({ children, ...others }: WindowsProviderProps) {
  const [windowConfigs, setWindowConfigs] = useState<WindowConfig[]>([]);
  const dir = useNebularDir();
  const positionStrategy = useRef<GlobalPositionStrategy>(
    new GlobalPositionStrategy().right().bottom()
  );
  const { apply, paneRef, globalWrapperRef } = useGlobalPositionStrategy(
    positionStrategy.current,
    dir
  );

  const showWindow = (windowConfig: Partial<WindowConfig>) => {
    const config = new WindowConfig({ ...windowConfig });
    setWindowConfigs((current) => {
      const results = [...current];
      results.push(config);
      return results;
    });
  };

  const closeWindow = (windowConfig: WindowConfig) => {
    setWindowConfigs((current) => {
      const newWindowConfigs = current.filter((config) => config.id !== windowConfig.id);
      return newWindowConfigs;
    });
  };

  useWindowEvents({ showWindow, closeWindow });

  return (
    <div {...others}>
      <Portal>
        <div
          className="global-overlay-wrapper windows-overlay-container"
          ref={globalWrapperRef}
          dir={dir}
        >
          <div ref={paneRef} className="overlay-pane">
            {windowConfigs.map((config) => (
              <Window
                windowConfig={config}
                apply={apply}
                paneRef={paneRef}
                globalWrapperRef={globalWrapperRef}
              />
            ))}
          </div>
        </div>
      </Portal>
      {children}
    </div>
  );
}
