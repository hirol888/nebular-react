import { NbButton, NbLayout, NbLayoutColumn, NbLayoutHeader, NbSidebar, NbSidebarService } from '@nebular-react';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';

const SidebarToggle: React.FC = () => {
  const sidebarService = new NbSidebarService();

  const toggle = () => {
    sidebarService.toggle(false, 'left');
  };

  const toggleCompact = () => {
    sidebarService.toggle(true, 'right');
  };

  return (
    <NbLayout>
      <NbLayoutHeader fixed>
        <NbButton status="success" size="tiny" onClick={toggle}>
          Toggle
        </NbButton>
        <NbButton status="info" size="tiny" onClick={toggleCompact} style={{ marginLeft: 'auto' }}>
          Toggle Compact
        </NbButton>
      </NbLayoutHeader>
      <NbSidebar tagName="left"></NbSidebar>
      <NbSidebar right tagName="right"></NbSidebar>
      <NbLayoutColumn className="colored-column-warning">Layout Content</NbLayoutColumn>
    </NbLayout>
  );
};

export { SidebarToggle };
