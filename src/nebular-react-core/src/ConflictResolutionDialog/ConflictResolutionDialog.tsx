import React from 'react';
import { useFocusTrap, useMergedRef } from '@nebular-react/hooks';
import { DefaultProps, Selectors, createStyles } from '@nebular-react/styles';
import { Button } from '../Button';
import { DiffViewer } from '../DiffViewer';
import { Fieldset } from '../Fieldset';
import { Modal } from '../Modal';
import { RadioGroup } from '../Radio';

export type ConflictResolutionChoice = 'local' | 'saved';
export type ConflictResolutionChoices = Readonly<Partial<Record<string, ConflictResolutionChoice>>>;
export type ConflictResolutionValue = string | number | boolean | bigint | null | undefined;

export interface ConflictResolutionField<Value = ConflictResolutionValue> {
  id: string;
  label: string;
  localValue: Value;
  savedValue: Value;
  /** Show an additional text comparison when both values are strings. */
  showTextDiff?: boolean;
}

export interface ConflictResolutionResult<Value = ConflictResolutionValue> {
  id: string;
  choice: ConflictResolutionChoice;
  value: Value;
}

export interface ConflictResolutionLabels {
  title: string;
  local: string;
  saved: string;
  emptyValue: string;
  noConflicts: string;
  diff(field: string): string;
  chooseLocal: string;
  chooseSaved: string;
  choiceGroup(field: string): string;
  confirm: string;
  cancel: string;
  submitting: string;
}

const defaultLabels: ConflictResolutionLabels = {
  title: 'Resolve conflicts',
  local: 'Your edit',
  saved: 'Saved value',
  emptyValue: '—',
  noConflicts: 'There are no conflicts to resolve.',
  diff: (field) => `Changes in ${field}`,
  chooseLocal: 'Keep my edit',
  chooseSaved: 'Keep saved value',
  choiceGroup: (field) => `Resolution for ${field}`,
  confirm: 'Apply choices',
  cancel: 'Cancel',
  submitting: 'Applying choices…'
};

const useStyles = createStyles(() => ({
  fields: {
    display: 'grid',
    gap: 'var(--conflict-resolution-gap, 1rem)',
    minWidth: 0
  },
  field: {
    minWidth: 0
  },
  comparison: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 13rem), 1fr))',
    gap: '0.5rem',
    margin: 0
  },
  side: {
    minWidth: 0,
    padding: '0.625rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--conflict-resolution-side-radius, 0.375rem)',
    background:
      'var(--conflict-resolution-side-background, var(--background-basic-color-2, #f7f9fc))'
  },
  heading: {
    marginBottom: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: 700
  },
  value: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere'
  },
  error: {
    margin: 0,
    fontWeight: 600,
    color: 'var(--conflict-resolution-error-color, var(--text-danger-color, #b81d51))'
  },
  status: { margin: 0, overflowWrap: 'anywhere' },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: '0.5rem'
  }
}));

export type ConflictResolutionStylesNames = Selectors<typeof useStyles>;

export interface ConflictResolutionDialogProps<
  Value = ConflictResolutionValue
> extends DefaultProps<ConflictResolutionStylesNames> {
  opened: boolean;
  fields: readonly ConflictResolutionField<Value>[];
  choices: ConflictResolutionChoices;
  onChoiceChange(id: string, choice: ConflictResolutionChoice): void;
  onResolve(results: ConflictResolutionResult<Value>[]): void;
  onClose(): void;
  submitting?: boolean;
  error?: React.ReactNode;
  labels?: Partial<ConflictResolutionLabels>;
  /** Display values with domain-specific types, formatting or markup. */
  renderValue?(
    value: Value,
    side: ConflictResolutionChoice,
    field: ConflictResolutionField<Value>
  ): React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

function getChoice(choices: ConflictResolutionChoices, id: string) {
  if (!Object.hasOwn(choices, id)) return undefined;
  const choice = choices[id];
  return choice === 'local' || choice === 'saved' ? choice : undefined;
}

function ConflictResolutionDialog<Value = ConflictResolutionValue>(
  props: ConflictResolutionDialogProps<Value>
) {
  const {
    opened,
    fields,
    choices,
    onChoiceChange,
    onResolve,
    onClose,
    submitting = false,
    error,
    labels,
    renderValue,
    ref,
    className,
    classNames,
    style,
    styles,
    unstyled
  } = props;
  const { classes } = useStyles(undefined, {
    name: 'conflict-resolution-dialog',
    classNames,
    styles,
    unstyled
  });
  const { elementRef } = useFocusTrap(!opened);
  const modalRef = useMergedRef(ref, elementRef);
  const text = { ...defaultLabels, ...labels };
  const resolved = fields.flatMap<ConflictResolutionResult<Value>>((field) => {
    const choice = getChoice(choices, field.id);
    return choice
      ? [{ id: field.id, choice, value: choice === 'local' ? field.localValue : field.savedValue }]
      : [];
  });
  const canResolve = !submitting && fields.length > 0 && resolved.length === fields.length;

  const displayValue = (field: ConflictResolutionField<Value>, side: ConflictResolutionChoice) => {
    const value = side === 'local' ? field.localValue : field.savedValue;
    return renderValue ? renderValue(value, side, field) : String(value ?? text.emptyValue);
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <Modal
      ref={modalRef}
      opened={opened}
      onClose={handleClose}
      title={text.title}
      size={720}
      className={className}
      style={style}
      unstyled={unstyled}
      withCloseButton={false}
      closeOnEsc={!submitting}
      closeOnOverlayClick={false}
      footer={
        <div className={classes.actions}>
          <Button
            type="button"
            appearance="ghost"
            onClick={handleClose}
            disabled={submitting}
            styles={{ disabled: { pointerEvents: 'auto' } }}
          >
            {text.cancel}
          </Button>
          <Button
            type="button"
            status="primary"
            styles={{ disabled: { pointerEvents: 'auto' } }}
            disabled={!canResolve}
            onClick={() => onResolve(resolved)}
          >
            {text.confirm}
          </Button>
        </div>
      }
    >
      <div className={classes.fields}>
        {submitting && (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keep a tab stop while all controls are disabled.
          <p role="status" className={classes.status} tabIndex={0}>
            {text.submitting}
          </p>
        )}
        {error && (
          <div role="alert" className={classes.error}>
            {error}
          </div>
        )}
        {fields.length === 0 && <p className={classes.status}>{text.noConflicts}</p>}
        {fields.map((field) => (
          <Fieldset className={classes.field} key={field.id} legend={field.label}>
            <dl className={classes.comparison}>
              <div className={classes.side}>
                <dt className={classes.heading}>{text.local}</dt>
                <dd className={classes.value}>{displayValue(field, 'local')}</dd>
              </div>
              <div className={classes.side}>
                <dt className={classes.heading}>{text.saved}</dt>
                <dd className={classes.value}>{displayValue(field, 'saved')}</dd>
              </div>
            </dl>
            {field.showTextDiff &&
              typeof field.savedValue === 'string' &&
              typeof field.localValue === 'string' && (
                <details>
                  <summary>{text.diff(field.label)}</summary>
                  <DiffViewer
                    before={field.savedValue}
                    after={field.localValue}
                    ariaLabel={text.diff(field.label)}
                    mode="unified"
                    maxHeight={240}
                  />
                </details>
              )}
            <RadioGroup
              ariaLabel={text.choiceGroup(field.label)}
              value={getChoice(choices, field.id) ?? ''}
              disabled={submitting}
              data={[
                { value: 'local', label: text.chooseLocal },
                { value: 'saved', label: text.chooseSaved }
              ]}
              onChange={(choice) => {
                if (!submitting && (choice === 'local' || choice === 'saved')) {
                  onChoiceChange(field.id, choice);
                }
              }}
            />
          </Fieldset>
        ))}
      </div>
    </Modal>
  );
}

export { ConflictResolutionDialog };
