import React, { ReactPortal, useRef, useState } from 'react';
import { useComponentDefaultProps } from '@nebular-react/styles';
import { useIsomorphicEffect, OVERLAY_CONTAINER_CLASS } from '@nebular-react/hooks';
import { createPortal } from 'react-dom';

export interface ProtalProps {
  children: React.ReactNode;
  target?: HTMLElement | string;
}

export function Portal(props: ProtalProps): ReactPortal {
  const { children, target } = useComponentDefaultProps({}, props);

  const [mounted, setMounted] = useState<boolean>(false);
  const ref = useRef<HTMLElement>(null);

  useIsomorphicEffect(() => {
    setMounted(true);

    if (!target) {
      let defaultNode: HTMLElement | null = document.querySelector(`.${OVERLAY_CONTAINER_CLASS}`);
      if (!defaultNode) {
        defaultNode = document.createElement('div');
        defaultNode.classList.add(OVERLAY_CONTAINER_CLASS);
      }
      ref.current = defaultNode;
    } else {
      ref.current = typeof target === 'string' ? document.querySelector(target) : target;
    }

    if (!target) {
      document.body.appendChild(ref.current);
    }
  }, [target]);

  if (!mounted) {
    return null;
  }

  return createPortal(<>{children}</>, ref.current);
}

Portal.displayName = '@nebular-react/core/Portal';
