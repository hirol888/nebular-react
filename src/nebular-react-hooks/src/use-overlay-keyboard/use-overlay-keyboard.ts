import React, { useEffect } from 'react';

export function useOverlayKeyboard(handler: React.MutableRefObject<Function>, opened: boolean) {
  // const mounted = useRef(false);

  useEffect(() => {
    // if (!mounted.current) {
    if (opened) {
      document.body.addEventListener('keydown', keydownListener);
      // mounted.current = true;
    }
    // }

    return () => {
      document.body.removeEventListener('keydown', keydownListener);
    };
  }, [opened]);

  const keydownListener = (event: KeyboardEvent) => {
    handler.current && handler.current(event);
  };
}
