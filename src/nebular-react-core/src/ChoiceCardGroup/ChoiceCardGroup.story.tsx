import React from 'react';
import { ChoiceCardGroup } from './ChoiceCardGroup';
import { Icon } from '../Icon';

export default { title: 'ChoiceCardGroup', component: ChoiceCardGroup };

export function ChooseAPlan() {
  return (
    <ChoiceCardGroup
      label="Plano"
      defaultValue="standard"
      options={[
        {
          value: 'standard',
          label: 'Padrão',
          description: 'Um espaço de trabalho.',
          icon: <Icon component="span" pack="nebular-essentials" icon="file-text-outline" />
        },
        {
          value: 'team',
          label: 'Equipe',
          description: 'Espaços compartilhados e colaboração.'
        }
      ]}
    />
  );
}

export function MultipleChoices() {
  return (
    <ChoiceCardGroup
      multiple
      label="Preferências de notificação"
      defaultValue={['comments']}
      options={[
        {
          value: 'comments',
          label: 'Comentários',
          description: 'Novos comentários em documentos.'
        },
        { value: 'mentions', label: 'Menções', description: 'Mensagens que mencionam você.' }
      ]}
    />
  );
}
