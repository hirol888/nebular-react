import {
  NbLayout,
  NbLayoutFooter,
  NbLayoutHeader,
  NbSidebar
} from '@nebular-react';

const SidebarThreeTest: React.FC = () => {
  return (
    <NbLayout>
      <NbLayoutHeader></NbLayoutHeader>
      <NbSidebar state="collapsed">Left</NbSidebar>
      <NbSidebar state="compacted" fixed right>
        Right
      </NbSidebar>
      <NbLayoutFooter></NbLayoutFooter>
    </NbLayout>
  );
};

export { SidebarThreeTest };
