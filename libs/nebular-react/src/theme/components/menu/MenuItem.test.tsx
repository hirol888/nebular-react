/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbMenuItem } from './MenuItem';
import { Provider } from 'inversify-react';
import { container } from '@nebular-react';

describe('NbMenuItem', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should set icon to menu item', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbMenuItem
          data-testid="menuitem"
          menuItem={{
            title: 'random title',
            icon: 'some-icon'
          }}
        />
      </Provider>
    ));
    const menuIcon = screen.getByTestId('menuitem').querySelector('.menu-icon');

    expect(menuIcon).not.toBeNull();
    expect(menuIcon).not.toBeUndefined();
  });

  it('should set title to menu item', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbMenuItem
          data-testid="menuitem"
          menuItem={{
            title: 'random title',
            icon: { icon: 'checkmark-outline', pack: 'eva' }
          }}
        />
      </Provider>
    ));
    const menuTitle = screen
      .getByTestId('menuitem')
      .querySelector('.menu-title');

    expect(menuTitle).toHaveTextContent('random title');
  });

  it('should set target to menu item', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbMenuItem
          data-testid="menuitem"
          menuItem={{ title: 'Link with _blank target', target: '_blank' }}
        />
      </Provider>
    ));
    const menuLink = screen.getByTestId('menuitem').querySelector('a');

    expect(menuLink?.target).toBe('_blank');
  });

  it('should have only span, without link on group element', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbMenuItem
          data-testid="menuitem"
          menuItem={{ title: 'Group item', group: true }}
        />
      </Provider>
    ));

    const menuItem = screen.getByTestId('menuitem');

    expect(menuItem?.querySelectorAll('a').length).toBe(0);
    expect(menuItem?.querySelectorAll('span').length).toBe(1);
  });

  it('should set child menu items', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbMenuItem
          data-testid="menuitem"
          menuItem={{
            title: 'Parent item',
            expanded: true,
            children: [{ title: 'Child item' }]
          }}
        />
      </Provider>
    ));

    const parentItem = screen.getByTestId('menuitem');
    expect(parentItem.querySelectorAll('ul.menu-items').length).toBe(1);
  });

  it('should expand child menu items', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbMenuItem
          data-testid="menuitem"
          menuItem={{
            title: 'Parent item',
            expanded: true,
            children: [{ title: 'Child item' }]
          }}
        />
      </Provider>
    ));

    const childList = screen
      .getByTestId('menuitem')
      .querySelector('ul.menu-items');
    expect(childList).toHaveClass('expanded');
  });

  it('should set URL', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbMenuItem
          data-testid="menuitem"
          menuItem={{ title: 'Menu Item with link', url: 'https://test.link/' }}
        />
      </Provider>
    ));
    const itemLink = screen.getByTestId('menuitem').querySelector('a');

    expect(itemLink?.href).toBe('https://test.link/');
  });
});
