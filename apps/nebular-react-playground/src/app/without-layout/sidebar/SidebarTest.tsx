import { NbLayout, NbLayoutColumn, NbLayoutFooter, NbLayoutHeader, NbSidebar, NbSidebarService } from '@nebular-react';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import NbSidebarHeader from 'libs/nebular-react/src/theme/components/sidebar/SidebarHeader';

const SidebarTest: React.FC = () => {
  const sidebarService = new NbSidebarService();

  let content = 'First ';

  const toggleLeft = () => {
    sidebarService.toggle(false, 'left');
  };

  const toggleRight = () => {
    sidebarService.toggle(true, 'right');
  };

  for (let i = 0; i < 1000; i++) {
    content += 'Akveo ';
  }
  content += ' Last';

  return (
    <NbLayout>
      <NbLayoutHeader fixed>
        <a href="#" className="navbar-brand">
          Akveo
        </a>
        <button id="collapse-left" onClick={toggleLeft}>
          Toggle Left
        </button>
        <button id="collapse-right" onClick={toggleRight}>
          Toggle Right
        </button>
      </NbLayoutHeader>
      <NbSidebar state="collapsed" fixed tagName="left"></NbSidebar>
      <NbSidebar right state="compacted" tagName="right">
        <NbSidebarHeader>Some Header</NbSidebarHeader>
        {content}
      </NbSidebar>
      <NbLayoutColumn left>{content}</NbLayoutColumn>
      <NbLayoutColumn>{content}</NbLayoutColumn>
      <NbLayoutColumn>{content}</NbLayoutColumn>
      <NbLayoutFooter fixed>&copy; Akveo 2017</NbLayoutFooter>
    </NbLayout>
  );
};

export { SidebarTest };
