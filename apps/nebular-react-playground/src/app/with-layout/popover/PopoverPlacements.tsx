import { NbButton, NbPopover, NbPosition } from '@nebular-react';
import { useRef } from 'react';
import './popover-modes.scoped.scss';

export function PopoverPlacements() {
  const bottomHostRef = useRef<HTMLDivElement>(null);
  const rightHostRef = useRef<HTMLDivElement>(null);
  const leftHostRef = useRef<HTMLDivElement>(null);
  const endHostRef = useRef<HTMLDivElement>(null);
  const startHostRef = useRef<HTMLDivElement>(null);
  const topHostRef = useRef<HTMLDivElement>(null);

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
