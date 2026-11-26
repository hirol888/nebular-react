import React from 'react';
import { Icon } from '../Icon';
import { ThemeIcon } from './ThemeIcon';

export default { title: 'ThemeIcon', component: ThemeIcon };

export function Showcase() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <ThemeIcon ariaLabel="Success">
        <Icon icon="checkmark" />
      </ThemeIcon>
      <ThemeIcon status="success" ariaLabel="Success">
        <Icon icon="checkmark" />
      </ThemeIcon>
      <ThemeIcon status="warning" variant="light" ariaLabel="Warning">
        <Icon icon="alert-circle-outline" />
      </ThemeIcon>
      <ThemeIcon status="danger" variant="outline" ariaLabel="Danger">
        <Icon icon="close" />
      </ThemeIcon>
      <ThemeIcon color="#8a2be2" ariaLabel="Custom color">
        <Icon icon="star" />
      </ThemeIcon>
    </div>
  );
}

export function SizesAndRadius() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <ThemeIcon size="sm" radius="sm" ariaLabel="Small">
        <Icon icon="star" />
      </ThemeIcon>
      <ThemeIcon size="md" radius="md" ariaLabel="Medium">
        <Icon icon="star" />
      </ThemeIcon>
      <ThemeIcon size="lg" radius="xl" ariaLabel="Large">
        <Icon icon="star" />
      </ThemeIcon>
      <ThemeIcon size={44} radius={22} ariaLabel="Custom size">
        <Icon icon="star" />
      </ThemeIcon>
    </div>
  );
}
