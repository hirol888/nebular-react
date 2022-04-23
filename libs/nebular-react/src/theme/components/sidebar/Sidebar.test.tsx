import { container } from '@nebular-react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { NbMenu, NbMenuItemModel } from '../menu';
import { NbSidebar } from './Sidebar';
import { NbSidebarService } from './sidebar.service';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'libs/nebular-react/src/ioc-provider';

const menuItems: NbMenuItemModel[] = [
  {
    title: 'no children'
  },
  {
    title: 'parent',
    children: [{ title: 'child' }]
  },
  {
    title: 'group',
    group: true
  }
];

describe('NbSidebar', () => {
  let unmount: () => void;
  let sidebarService: NbSidebarService;

  beforeEach(() => {
    ({ unmount } = render(
      <Provider container={container}>
        <BrowserRouter>
          <NbSidebar responsive={false} state="expanded" data-testid="sidebar">
            <button id="button-outside-menu" data-testid="outside-button"></button>
            <NbMenu items={menuItems}></NbMenu>
          </NbSidebar>
        </BrowserRouter>
      </Provider>
    ));

    sidebarService = container.get<NbSidebarService>(TYPES.NbSidebarService);
  });

  afterEach(() => {
    unmount();
  });

  describe('States (expanded, collapsed, compacted)', () => {
    it(`should collapse when collapse method called`, () => {
      act(() => {
        sidebarService.collapse();
      });

      const sidebar = screen.getByTestId('sidebar');

      expect(sidebar).not.toHaveClass('expanded');
    });

    it('should become compacted when compact method called', () => {
      act(() => {
        sidebarService.compact();
      });

      const sidebar = screen.getByTestId('sidebar');

      expect(sidebar).toHaveClass('compacted');
    });

    it('should not expand when clicked outside menu', () => {
      const buttonOutside = screen.getByTestId('outside-button');
      act(() => {
        sidebarService.compact();
      });

      fireEvent.click(buttonOutside);

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('compacted');
    });

    it('should not expand when clicked on menu item without children', () => {
      act(() => {
        sidebarService.compact();
      });

      const sidebar = screen.getByTestId('sidebar');
      const menuItemWithNoChildren = sidebar.querySelectorAll('.nb-menu-item')[0];
      fireEvent.click(menuItemWithNoChildren);

      expect(sidebar).toHaveClass('compacted');
    });

    it('should not expand when clicked on menu group', () => {
      act(() => {
        sidebarService.compact();
      });

      const sidebar = screen.getByTestId('sidebar');
      const menuGroup = sidebar.querySelectorAll('.nb-menu-item')[2].querySelector('span');
      fireEvent.click(menuGroup!);

      expect(sidebar).toHaveClass('compacted');
    });

    it('should expand when icon of menu item with child items clicked', () => {
      act(() => {
        sidebarService.compact();
      });

      const sidebar = screen.getByTestId('sidebar');
      const menuItemWithChildren = sidebar.querySelectorAll('.nb-menu-item')[1].querySelector('a');
      fireEvent.click(menuItemWithChildren!);

      expect(sidebar).toHaveClass('expanded');
    });
  });
});
