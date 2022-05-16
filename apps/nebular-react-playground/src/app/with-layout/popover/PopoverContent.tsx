import { NbButton, NbPopover } from '@nebular-react';
import { useRef } from 'react';

export function PopoverContent() {
  const hostRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <NbButton ref={hostRef}>Rich Content Popover</NbButton>
      <NbPopover hostRef={hostRef}>
        <div>
          <strong>Hello, popover!</strong>
        </div>
      </NbPopover>
    </>
  );
}
