import React from 'react';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { Menu } from './Menu';
import { MenuItem } from './MenuItem';

export default { title: 'Menu' };

export function Showcase() {
  return (
    <Card>
      <Menu>
        <MenuItem id="Profile" title="Profile" icon={<Icon icon="person-outline" />} />
        <MenuItem
          id="Change Password"
          title="Change Password"
          icon={<Icon icon="lock-outline" />}
        />
        <MenuItem
          id="Privacy Policy"
          title="Privacy Policy"
          icon={<Icon icon="checkmark-outline" pack="eva" />}
        />
        <MenuItem id="Logout" title="Logout" icon={<Icon icon="unlock-outline" />} />
      </Menu>
    </Card>
  );
}

export function Multiple() {
  return (
    <Card>
      <Menu multiple initialExpanded={['Profile']}>
        <MenuItem id="Profile" title="Profile">
          <MenuItem id="Change Password" title="Change Password" />
          <MenuItem id="Privacy Policy" title="Privacy Policy" />
          <MenuItem id="Logout" title="Logout" />
        </MenuItem>
        <MenuItem id="Shopping Bag" title="Shopping Bag">
          <MenuItem id="First Product" title="First Product" />
          <MenuItem id="Second Product" title="Second Product" />
          <MenuItem id="Third Product" title="Third Product" />
        </MenuItem>
        <MenuItem id="Orders" title="Orders">
          <MenuItem id="First Order" title="First Order" />
          <MenuItem id="Second Order" title="Second Order" />
          <MenuItem id="Third Order" title="Third Order" />
        </MenuItem>
      </Menu>
    </Card>
  );
}

export function Single() {
  return (
    <Card>
      <Menu<false> initialExpanded="Profile">
        <MenuItem id="Profile" title="Profile">
          <MenuItem id="Change Password" title="Change Password" />
          <MenuItem id="Privacy Policy" title="Privacy Policy" />
          <MenuItem id="Logout" title="Logout" />
        </MenuItem>
        <MenuItem id="Shopping Bag" title="Shopping Bag">
          <MenuItem id="First Product" title="First Product" />
          <MenuItem id="Second Product" title="Second Product" />
          <MenuItem id="Third Product" title="Third Product" />
        </MenuItem>
        <MenuItem id="Orders" title="Orders">
          <MenuItem id="First Order" title="First Order" />
          <MenuItem id="Second Order" title="Second Order" />
          <MenuItem id="Third Order" title="Third Order" />
        </MenuItem>
      </Menu>
    </Card>
  );
}

export function Badges() {
  return (
    <Card style={{ width: '20rem' }}>
      <Menu initialExpanded={['Profile']}>
        <MenuItem id="Profile" title="Profile" badge={<Badge text="30" status="primary" />}>
          <MenuItem id="Messages" title="Messages" badge={<Badge text="99+" status="danger" />} />
          <MenuItem
            id="Notifications"
            title="Notifications"
            badge={<Badge dotMode status="warning" />}
          />
          <MenuItem id="Emails" title="Emails" badge={<Badge text="new" status="success" />} />
        </MenuItem>
      </Menu>
    </Card>
  );
}

export function Children() {
  return (
    <Card>
      <Menu initialExpanded={['Profile']}>
        <MenuItem id="Profile" title="Profile">
          <MenuItem id="Change Password" title="Change Password" />
          <MenuItem id="Privacy Policy" title="Privacy Policy" />
          <MenuItem id="Logout" title="Logout" />
        </MenuItem>
        <MenuItem id="Shopping Bag" title="Shopping Bag" />
        <MenuItem id="Orders" title="Orders" />
      </Menu>
    </Card>
  );
}

export function Links() {
  return (
    <Card>
      <Menu initialExpanded={['Menu links']}>
        <MenuItem id="Menu links" title="Menu links">
          <MenuItem id="Google" title="Google" href="https://www.google.com" />
          <MenuItem
            id="GoogleNewWindow"
            title="Will be opened in new window (target=`_blank`)"
            href="https://www.google.com"
            target="_blank"
          />
          <MenuItem
            id="WithIcon"
            title="Menu item with icon"
            href="https://www.google.com"
            icon={<Icon icon="search-outline" />}
          />
        </MenuItem>
      </Menu>
    </Card>
  );
}

export function Group() {
  return (
    <Card>
      <Menu>
        <MenuItem id="Profile" title="Profile" group>
          <MenuItem id="Change Password" title="Change Password" />
          <MenuItem id="Privacy Policy" title="Privacy Policy" />
          <MenuItem id="Logout" title="Logout" />
        </MenuItem>
        <MenuItem id="other-item" title="Other Items" group>
          <MenuItem id="Shopping Bag" title="Shopping Bag" />
          <MenuItem id="Orders" title="Orders" />
        </MenuItem>
      </Menu>
    </Card>
  );
}
