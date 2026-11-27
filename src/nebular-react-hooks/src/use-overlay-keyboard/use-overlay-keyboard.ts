import React, { useEffect } from 'react';

export function useOverlayKeyboard(handler: React.MutableRefObject<Function>, opened: boolean) {
  useEffect(() => {
    const keydownListener = (event: KeyboardEvent) => {
      handler.current && handler.current(event);
    };

    if (opened) {
      document.body.addEventListener('keydown', keydownListener);
    }

    return () => {
      document.body.removeEventListener('keydown', keydownListener);
    };
  }, [opened, handler]);
}
