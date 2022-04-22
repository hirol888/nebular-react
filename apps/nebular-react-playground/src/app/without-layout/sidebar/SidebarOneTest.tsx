import { NbLayout, NbSidebar } from '@nebular-react';

const SidebarOneTest: React.FC = () => {
  return (
    <NbLayout>
      <NbSidebar tagName="left">Left</NbSidebar>
      <NbSidebar tagName="right" right>
        Right
      </NbSidebar>
    </NbLayout>
  );
};

export { SidebarOneTest };
