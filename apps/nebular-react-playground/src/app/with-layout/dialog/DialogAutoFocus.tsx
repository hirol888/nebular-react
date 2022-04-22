import { NbButton, NbCard, NbCardBody, NbCardFooter, NbCardHeader, NbDialog, NbDialogRef } from '@nebular-react';
import { NbDialogConfig } from 'libs/nebular-react/src/theme/components/dialog/dialog-config';
import React, { useRef } from 'react';
import './dialog-common.scss';

const DialogAutoFocus: React.FC = () => {
  const dialogRef = useRef<NbDialogRef>(null);

  const config = new NbDialogConfig();

  const openWithAutoFocus = () => {
    config.autoFocus = true;
    dialogRef.current?.open();
  };

  const openWithoutAutoFocus = () => {
    config.autoFocus = false;
    dialogRef.current?.open();
  };

  const close = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <NbButton onClick={openWithAutoFocus}>With Auto Focus</NbButton>
      <NbButton onClick={openWithoutAutoFocus}>Without Auto Focus</NbButton>
      <NbDialog ref={dialogRef} config={config}>
        <NbCard className="dialog-card">
          <NbCardHeader>Title</NbCardHeader>
          <NbCardBody>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt tincidunt. Vestibulum
            vulputate maximus massa vel tristique. Suspendisse potenti. Duis aliquet purus sed dictum dictum. Donec
            fringilla, purus at fermentum imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis
            eu mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum egestas mi nec iaculis
            varius. Morbi in risus sed sapien ultricies feugiat. Quisque pulvinar mattis purus, in aliquet massa aliquet
            et.
          </NbCardBody>
          <NbCardFooter>
            <NbButton status="primary" onClick={close}>
              Dismiss Dialog
            </NbButton>
          </NbCardFooter>
        </NbCard>
      </NbDialog>
    </>
  );
};

export { DialogAutoFocus };
