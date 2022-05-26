import { NbButton, NbPopover, NbPosition } from '@nebular-react';
import { useRef } from 'react';
import './popover-modes.scoped.scss';

export function PopoverPlacements() {
  const bottomHostRef = useRef<HTMLButtonElement>(null);
  const rightHostRef = useRef<HTMLButtonElement>(null);
  const leftHostRef = useRef<HTMLButtonElement>(null);
  const endHostRef = useRef<HTMLButtonElement>(null);
  const startHostRef = useRef<HTMLButtonElement>(null);
  const topHostRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <NbButton ref={bottomHostRef}>Bottom</NbButton>
      <NbPopover hostRef={bottomHostRef} position={NbPosition.BOTTOM}>
        Bottom Popover!
      </NbPopover>
      <NbButton ref={rightHostRef}>Right</NbButton>
      <NbPopover hostRef={rightHostRef} position={NbPosition.RIGHT}>
        Right Popover!
      </NbPopover>
      <NbButton ref={leftHostRef}>Left</NbButton>
      <NbPopover hostRef={leftHostRef} position={NbPosition.LEFT}>
        Left Popover!
      </NbPopover>
      <NbButton ref={endHostRef}>End</NbButton>
      <NbPopover hostRef={endHostRef} position={NbPosition.END}>
        End Popover!
      </NbPopover>
      <NbButton ref={startHostRef}>Start</NbButton>
      <NbPopover hostRef={startHostRef} position={NbPosition.START}>
        Start Popover!
      </NbPopover>
      <NbButton ref={topHostRef}>Top</NbButton>
      <NbPopover hostRef={topHostRef} position={NbPosition.TOP}>
        Top Popover!
      </NbPopover>
    </>
  );
}
