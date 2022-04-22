import { NbLayout, NbLayoutColumn, NbSidebar } from '@nebular-react';

const SidebarShowcase: React.FC = () => {
  return (
    <NbLayout>
      <NbSidebar>Sidebar content</NbSidebar>
      <NbLayoutColumn className="colored-column-sucess">
        Layout Content
      </NbLayoutColumn>
    </NbLayout>
  );
};

export { SidebarShowcase };
