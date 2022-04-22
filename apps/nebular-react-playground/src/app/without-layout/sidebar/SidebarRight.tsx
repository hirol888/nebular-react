import { NbLayout, NbLayoutColumn, NbSidebar } from '@nebular-react';

const SidebarRight: React.FC = () => {
  return (
    <NbLayout>
      <NbSidebar right>Right Sidebar</NbSidebar>
      <NbLayoutColumn className="colored-column-warning">
        Layout Content
      </NbLayoutColumn>
    </NbLayout>
  );
};

export { SidebarRight };
