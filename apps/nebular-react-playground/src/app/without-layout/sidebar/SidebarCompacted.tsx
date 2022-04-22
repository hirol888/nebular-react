import { NbLayout, NbLayoutColumn, NbSidebar } from '@nebular-react';

const SidebarCompacted: React.FC = () => {
  return (
    <NbLayout>
      <NbSidebar state="compacted">Sidebar content</NbSidebar>
      <NbLayoutColumn className="colored-column-primary">
        Layout Content
      </NbLayoutColumn>
    </NbLayout>
  );
};

export { SidebarCompacted };
