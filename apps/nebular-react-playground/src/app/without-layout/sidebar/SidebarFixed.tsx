import { NbButton, NbLayout, NbLayoutColumn, NbLayoutHeader, NbSidebar, NbSidebarService } from '@nebular-react';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';

const SidebarFixed: React.FC = () => {
  const sidebarService = new NbSidebarService();

  const toggle = () => {
    sidebarService.toggle();
  };

  return (
    <NbLayout>
      <NbLayoutHeader fixed>
        <NbButton status="success" size="tiny" onClick={toggle}>
          Toggle
        </NbButton>
      </NbLayoutHeader>
      <NbSidebar fixed></NbSidebar>
      <NbLayoutColumn className="colored-column-info">
        Long layout content so that it is clear that fixed sidebar is shown on top of the content.
      </NbLayoutColumn>
    </NbLayout>
  );
};

export { SidebarFixed };
