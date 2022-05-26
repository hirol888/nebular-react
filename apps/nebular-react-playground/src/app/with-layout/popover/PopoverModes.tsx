import { NbButton, NbPopover, NbPosition, NbTrigger } from '@nebular-react';
import { useRef } from 'react';
import './popover-modes.scoped.scss';

export function PopoverModes() {
  const clickHostRef = useRef<HTMLButtonElement>(null);
  const hintHostRef = useRef<HTMLButtonElement>(null);
  const hoverHostRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <NbButton ref={clickHostRef}>Click Mode</NbButton>
      <NbPopover hostRef={clickHostRef} trigger={NbTrigger.CLICK} position={NbPosition.BOTTOM}>
        Click Mode
      </NbPopover>
      <NbButton ref={hintHostRef}>Hint Mode</NbButton>
      <NbPopover hostRef={hintHostRef} trigger={NbTrigger.HINT} position={NbPosition.BOTTOM}>
        Hint Mode
      </NbPopover>
      <NbButton ref={hoverHostRef}>Hover Mode</NbButton>
      <NbPopover hostRef={hoverHostRef} trigger={NbTrigger.HOVER} position={NbPosition.BOTTOM}>
        Hover Mode
      </NbPopover>
    </>
  );
}
