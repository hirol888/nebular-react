/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbMenuItemModel } from './menu.service';
import { NbMenu } from './Menu';
import { Provider } from 'inversify-react';
import { container } from '@nebular-react';

describe('NbMenu', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  const items: NbMenuItemModel[] = [
    {
      title: 'Profile',
      icon: 'person-outline'
    },
    {
      title: 'Change Password',
      icon: 'lock-outline'
    },
    {
      title: 'Privacy Policy',
      icon: { icon: 'checkmark-outline', pack: 'eva' }
    },
    {
      title: 'Logout',
      icon: 'unlock-outline'
    }
  ];

  it('should not render hidden element', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbMenu
          data-testid="menu"
          items={[
            { title: 'Visible item' },
            { title: 'Hidden item', hidden: true },
            { title: 'Visible item2' }
          ]}
          tagName="menu"
        ></NbMenu>
      </Provider>
    ));

    const menuList = screen.getByTestId('menu').querySelectorAll('.menu-item');

    expect(menuList.length).toBe(2);
  });

  it('should set selected item', () => {
    ({ unmount } = render(
      <Provider container={container}>
        {' '}
        <NbMenu
          data-testid="menu"
          items={[
            { title: 'Menu item not selected' },
            { title: 'Menu item selected', selected: true }
          ]}
          tagName="menu"
        ></NbMenu>
      </Provider>
    ));

    const activeItem = screen.getByTestId('menu').querySelector('a.active');
    expect(activeItem?.querySelector('span')).toHaveTextContent(
      'Menu item selected'
    );
  });

  // TODO get selected menu item
  // it('', () => {
  //   const menu = mount(
  //     <Provider store={nebularStore}>
  //       <NbMenu items={[{ title: 'Existing item' }]} tag='menu'></NbMenu>
  //     </Provider>
  //   );
  // })

  // TODO: select
});
