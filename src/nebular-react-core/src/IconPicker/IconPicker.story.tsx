import React, { useState } from 'react';
import { IconPicker } from './IconPicker';
import type { IconPickerValue } from './IconPicker';

export default { title: 'IconPicker', component: IconPicker };

export function ChooseAnEssentialIcon() {
  const [value, setValue] = useState<IconPickerValue | null>(null);
  return (
    <IconPicker
      packs={['nebular-essentials']}
      value={value}
      onChange={setValue}
      clearable
      labels={{ search: 'Buscar ícones', results: 'Ícones encontrados', clear: 'Limpar seleção' }}
      style={{ maxWidth: '26rem' }}
    />
  );
}
