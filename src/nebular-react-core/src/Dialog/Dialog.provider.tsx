import React, { useRef, useState } from 'react';
import { GlobalPositionStrategy, useGlobalPositionStrategy } from '@nebular-react/hooks';
import { useNebularDir } from '@nebular-react/styles';
import { Portal } from '../Portal';
import { Dialog } from './Dialog';
import { useDialogEvents } from './events';
import { DialogConfig } from './types';

export interface DialogProviderProps {
  children?: React.ReactNode;
}

export function DialogProvider({ children }: DialogProviderProps) {
  const [dialogConfigs, setDialogConfigs] = useState<DialogConfig[]>([]);
  const positionStrategy = useRef<GlobalPositionStrategy>(
    new GlobalPositionStrategy().centerHorizontally().centerVertically()
  );
  const dir = useNebularDir();
  const { apply, paneRef, globalWrapperRef } = useGlobalPositionStrategy(
    positionStrategy.current,
    dir
  );

  const showDialog = (dialogConfig: Partial<DialogConfig>) => {
    const config = new DialogConfig({ ...dialogConfig });
    setDialogConfigs((current) => {
      const results = [...current];
      results.push(config);
      return results;
    });
  };

  const closeDialog = (id: string) =>
    setDialogConfigs((current) => current.filter((d) => d.id !== id));

  useDialogEvents({ showDialog, closeDialog });

  return (
    <>
      <Portal>
        <div
          className="global-overlay-wrapper dialog-overlay-container"
          ref={globalWrapperRef}
          dir={dir}
        >
          <div ref={paneRef} className="overlay-pane">
            {dialogConfigs.map((config) => (
              <Dialog
                key={config.id}
                dialogConfig={config}
                apply={apply}
                paneRef={paneRef}
                globalWrapperRef={globalWrapperRef}
              />
            ))}
          </div>
        </div>
      </Portal>
      {children}
    </>
  );
}
