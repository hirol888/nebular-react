import { NbButton, NbPopover, NbPosition } from '@nebular-react';
import { useRef } from 'react';

export function PopoverShowcase() {
  const hostRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <NbButton ref={hostRef}>Open Popover</NbButton>
      <NbPopover hostRef={hostRef} position={NbPosition.BOTTOM}>
        Hi, I'm popover!
      </NbPopover>
    </>
  );
}
