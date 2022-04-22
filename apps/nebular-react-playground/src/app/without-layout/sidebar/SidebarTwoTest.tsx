import {
  NbLayout,
  NbLayoutFooter,
  NbLayoutHeader,
  NbSidebar
} from '@nebular-react';

const SidebarTwoTest: React.FC = () => {
  return (
    <NbLayout>
      <NbLayoutHeader></NbLayoutHeader>

      <NbSidebar>Left</NbSidebar>
      <NbSidebar right fixed>
        Right
      </NbSidebar>

      <NbLayoutFooter></NbLayoutFooter>
    </NbLayout>
  );
};

export { SidebarTwoTest };
