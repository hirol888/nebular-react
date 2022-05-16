import { NbButton, NbPopover, NbPosition, NbTrigger } from '@nebular-react';
import { useRef, useState } from 'react';
import './popover-dynamic.scoped.scss';

export function PopoverDisable() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [disabled, setDisabled] = useState<boolean>(false);

  const changeDisabled = (value: boolean) => {
    setDisabled(value);
  };

  return (
    <div className="popover-dynamic">
      <div className="popover-container">
        <NbButton ref={hostRef}>Click Mode</NbButton>
        <NbPopover hostRef={hostRef} trigger={NbTrigger.CLICK} position={NbPosition.BOTTOM} disabled={disabled}>
          Hi, I'm popover!
        </NbPopover>
      </div>
      <div className="section">
        <NbButton size="small" status="warning" onClick={() => changeDisabled(true)}>
          Disable
        </NbButton>
        <NbButton size="small" status="success" onClick={() => changeDisabled(false)}>
          Enable
        </NbButton>
      </div>
    </div>
  );
}
