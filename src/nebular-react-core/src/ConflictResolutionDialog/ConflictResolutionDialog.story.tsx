import React, { useState } from 'react';
import { Button } from '../Button';
import {
  ConflictResolutionChoices,
  ConflictResolutionDialog,
  ConflictResolutionField,
  ConflictResolutionResult
} from './ConflictResolutionDialog';

export default { title: 'ConflictResolutionDialog', component: ConflictResolutionDialog };

const documentFields: ConflictResolutionField<string>[] = [
  {
    id: 'title',
    label: 'Document title',
    localValue: 'Planning notes',
    savedValue: 'Project plan'
  },
  {
    id: 'description',
    label: 'Description',
    localValue: 'Draft the schedule.\nShare the first version on Monday.',
    savedValue: 'Draft the schedule.\nShare the first version on Thursday.',
    showTextDiff: true
  }
];

export function DocumentChanges() {
  const [opened, setOpened] = useState(false);
  const [choices, setChoices] = useState<ConflictResolutionChoices>({});
  const [resolved, setResolved] = useState<ConflictResolutionResult<string>[]>([]);

  return (
    <>
      <Button onClick={() => setOpened(true)}>Compare document versions</Button>
      <ConflictResolutionDialog
        opened={opened}
        fields={documentFields}
        choices={choices}
        onChoiceChange={(id, choice) => setChoices((current) => ({ ...current, [id]: choice }))}
        onResolve={(results) => {
          setResolved(results);
          setOpened(false);
        }}
        onClose={() => setOpened(false)}
      />
      {resolved.length > 0 && (
        <ul aria-label="Chosen values">
          {resolved.map(({ id, value }) => (
            <li key={id}>{value}</li>
          ))}
        </ul>
      )}
    </>
  );
}

const preferences: ConflictResolutionField<boolean>[] = [
  { id: 'reminders', label: 'Lembretes', localValue: true, savedValue: false },
  { id: 'sharing', label: 'Compartilhamento', localValue: false, savedValue: true }
];

export function WorkspacePreferences() {
  const [opened, setOpened] = useState(false);
  const [choices, setChoices] = useState<ConflictResolutionChoices>({});
  const [error, setError] = useState('');

  return (
    <>
      <Button
        onClick={() => {
          setChoices({});
          setError('');
          setOpened(true);
        }}
      >
        Revisar preferências
      </Button>
      <ConflictResolutionDialog
        opened={opened}
        fields={preferences}
        choices={choices}
        labels={{
          title: 'Resolver conflitos de preferências',
          local: 'Minha edição',
          saved: 'Valor salvo',
          chooseLocal: 'Manter minha edição',
          chooseSaved: 'Manter valor salvo',
          choiceGroup: (field) => `Resolução para ${field}`,
          confirm: 'Aplicar escolhas',
          cancel: 'Cancelar',
          submitting: 'Aplicando escolhas…'
        }}
        error={error}
        renderValue={(enabled) => (enabled ? 'Ativado' : 'Desativado')}
        onChoiceChange={(id, choice) => setChoices((current) => ({ ...current, [id]: choice }))}
        onResolve={() => {
          if (!error) {
            setError('Falha ao salvar. Tente aplicar novamente.');
            return;
          }
          setError('');
          setOpened(false);
        }}
        onClose={() => setOpened(false)}
      />
    </>
  );
}
