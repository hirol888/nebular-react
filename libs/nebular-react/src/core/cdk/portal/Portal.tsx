import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { containerClass } from '../helper';
import { OverlayReference } from '../overlay';
import { InversifyContext, Provider } from 'libs/nebular-react/src/ioc-provider';

export const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

export type PortalProps = {
  overlayRef: OverlayReference | null;
  isOpen: boolean;
  updateKey?: string;
  paneRef: React.RefObject<HTMLDivElement>;
  targetNodeToAttach?: HTMLElement | null;
};

const Portal: React.FC<PortalProps> = ({ overlayRef, isOpen, updateKey, paneRef, targetNodeToAttach, children }) => {
  let defaultNode: HTMLElement | null = null;
  const [, setUpdateKeyValue] = useState<string | undefined>(updateKey);

  const hostRef = useRef<HTMLDivElement>(null);
  const { container } = useContext(InversifyContext);

  useLayoutEffect(() => {
    if (isOpen && overlayRef && hostRef.current && paneRef.current) {
      overlayRef.init(hostRef.current, paneRef.current);
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    if (updateKey) {
      setUpdateKeyValue(updateKey);
    }
  }, [updateKey]);

  if (!canUseDOM) {
    return null;
  }

  defaultNode = document.querySelector(`.${containerClass}`);

  if (!defaultNode) {
    defaultNode = document.createElement('div');
    defaultNode.classList.add(containerClass);
    document.body.appendChild(defaultNode);
  }

  if (targetNodeToAttach) {
    defaultNode = targetNodeToAttach;
  }

  return (
    defaultNode &&
    ReactDOM.createPortal(
      <Provider container={container!}>{isOpen && <div ref={hostRef}>{children}</div>}</Provider>,
      defaultNode!
    )
  );
};

export { Portal };
