import { NbMenu, NbCard, NbMenuItemModel } from '@nebular-react';
import React from 'react';

const MenuShowcase: React.FC = () => {
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

  return (
    <NbCard>
      <NbMenu items={items} tagName="menu1"></NbMenu>
    </NbCard>
  );
};

export { MenuShowcase };
