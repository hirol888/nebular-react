import { NbButton, NbInput, NbPopover, NbPopoverRef, NbTrigger } from '@nebular-react';
import { useRef } from 'react';
import './popover-noop.scoped.scss';

export function PopoverNoop() {
  const hostRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<NbPopoverRef>(null);

  const open = () => {
    popoverRef.current?.show();
  };

  const close = () => {
    popoverRef.current?.hide();
  };

  return (
    <>
      <NbInput ref={hostRef} placeholder="Enter your username" />
      <NbPopover ref={popoverRef} hostRef={hostRef} trigger={NbTrigger.NOOP}>
        Username is already taken
      </NbPopover>
      <div>
        <NbButton size="small" status="success" onClick={open}>
          Open Popover
        </NbButton>
        <NbButton size="small" status="danger" onClick={close}>
          Close Popover
        </NbButton>
      </div>
    </>
  );
}
