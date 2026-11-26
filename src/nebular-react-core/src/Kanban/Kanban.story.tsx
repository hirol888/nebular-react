import React, { useState } from 'react';
import { Badge } from '../Badge';
import { Kanban, KanbanCard, KanbanColumn, KanbanSwimlane } from './Kanban';

export default { title: 'Kanban', component: Kanban };

const initialColumns: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      {
        id: 'design',
        title: 'Design onboarding flow',
        description: 'Wireframes and copy review',
        tags: ['design']
      },
      { id: 'billing', title: 'Billing webhooks', tags: ['backend'] },
      { id: 'docs', title: 'Update API docs' }
    ]
  },
  {
    id: 'in-progress',
    title: 'In progress',
    cards: [
      {
        id: 'search',
        title: 'Search filters',
        description: 'Faceted search for the catalog',
        tags: ['frontend']
      }
    ]
  },
  {
    id: 'review',
    title: 'Review',
    cards: [{ id: 'a11y', title: 'Keyboard audit', tags: ['a11y'] }]
  },
  { id: 'done', title: 'Done', cards: [] }
];

function moveCard(
  columns: KanbanColumn[],
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  toIndex: number
): KanbanColumn[] {
  const fromColumn = columns.find((column) => column.id === fromColumnId);
  const card = fromColumn?.cards.find((item) => item.id === cardId);

  if (!card) {
    return columns;
  }

  return columns.map((column) => {
    if (column.id === fromColumnId && column.id === toColumnId) {
      const cards = column.cards.filter((item) => item.id !== cardId);
      cards.splice(toIndex, 0, card);

      return { ...column, cards };
    }

    if (column.id === fromColumnId) {
      return { ...column, cards: column.cards.filter((item) => item.id !== cardId) };
    }

    if (column.id === toColumnId) {
      const cards = [...column.cards];
      cards.splice(toIndex, 0, card);

      return { ...column, cards };
    }

    return column;
  });
}

export function Showcase() {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);

  return (
    <Kanban
      columns={columns}
      onCardMove={(cardId, fromColumnId, toColumnId, toIndex) =>
        setColumns((current) => moveCard(current, cardId, fromColumnId, toColumnId, toIndex))
      }
    />
  );
}

export function WithLimit() {
  const columns = initialColumns.map((column) =>
    column.id === 'in-progress' ? { ...column, limit: 2 } : column
  );

  return (
    <Kanban
      columns={columns}
      onCardMove={() => undefined}
      renderCard={(card) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <strong>{card.title}</strong>
          {card.description && (
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{card.description}</span>
          )}
          {card.tags && card.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {card.tags.map((tag, index) => (
                <Badge key={index} text={String(tag)} status="primary" />
              ))}
            </div>
          )}
        </div>
      )}
    />
  );
}

type SwimlaneDemoCard = KanbanCard & { lane: string };

const swimlaneCard = (id: string, title: string, lane: string): KanbanCard =>
  ({ id, title, lane }) as KanbanCard;

const swimlanes: KanbanSwimlane[] = [
  { key: 'urgent', label: 'Urgent' },
  { key: 'standard', label: 'Standard' },
  { key: 'blocked', label: 'Blocked' }
];

const initialSwimlaneColumns: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      swimlaneCard('outage', 'Fix checkout outage', 'urgent'),
      swimlaneCard('onboarding', 'Design onboarding flow', 'standard'),
      swimlaneCard('billing', 'Billing webhooks', 'standard'),
      swimlaneCard('vendor', 'Waiting on vendor contract', 'blocked')
    ]
  },
  {
    id: 'in-progress',
    title: 'In progress',
    cards: [
      swimlaneCard('search', 'Search filters', 'standard'),
      swimlaneCard('incident', 'Incident follow-up', 'urgent')
    ]
  },
  { id: 'review', title: 'Review', cards: [swimlaneCard('a11y', 'Keyboard audit', 'standard')] },
  { id: 'done', title: 'Done', cards: [] }
];

function moveSwimlaneCard(
  columns: KanbanColumn[],
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  toIndex: number,
  swimlaneKey?: string
): KanbanColumn[] {
  const sourceColumn = columns.find((column) => column.id === fromColumnId);
  const card = sourceColumn?.cards.find((item) => item.id === cardId) as
    SwimlaneDemoCard | undefined;

  if (!card) {
    return columns;
  }

  const movedCard: SwimlaneDemoCard = { ...card, lane: swimlaneKey ?? card.lane };
  const withoutCard = columns.map((column) =>
    column.id === fromColumnId || column.id === toColumnId
      ? { ...column, cards: column.cards.filter((item) => item.id !== cardId) }
      : column
  );

  return withoutCard.map((column) => {
    if (column.id !== toColumnId) {
      return column;
    }

    const laneCards = column.cards.filter(
      (item) => (item as SwimlaneDemoCard).lane === movedCard.lane
    );
    const otherCards = column.cards.filter(
      (item) => (item as SwimlaneDemoCard).lane !== movedCard.lane
    );
    laneCards.splice(toIndex, 0, movedCard);

    return { ...column, cards: [...otherCards, ...laneCards] };
  });
}

export function Swimlanes() {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialSwimlaneColumns);

  return (
    <Kanban
      columns={columns}
      swimlanes={swimlanes}
      getCardSwimlane={(card) => (card as SwimlaneDemoCard).lane}
      onCardMove={(cardId, fromColumnId, toColumnId, toIndex, context) =>
        setColumns((current) =>
          moveSwimlaneCard(current, cardId, fromColumnId, toColumnId, toIndex, context?.swimlaneKey)
        )
      }
    />
  );
}

export function WipLimits() {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [notice, setNotice] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem' }}>
        In progress is limited to 2 cards. Drops beyond the limit are blocked.
      </p>
      {notice && (
        <p role="status" style={{ margin: 0, fontSize: '0.8125rem' }}>
          {notice}
        </p>
      )}
      <Kanban
        columns={columns}
        wipLimits={{ 'in-progress': 2, review: 1 }}
        onWipLimitExceeded={(columnKey, limit) =>
          setNotice(`WIP limit reached for "${columnKey}" (${limit} cards).`)
        }
        onCardMove={(cardId, fromColumnId, toColumnId, toIndex) =>
          setColumns((current) => moveCard(current, cardId, fromColumnId, toColumnId, toIndex))
        }
      />
    </div>
  );
}

const virtualizedColumns: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog (120 cards)',
    cards: Array.from({ length: 120 }, (_, index) => ({
      id: `task-${index}`,
      title: `Task ${index + 1}`,
      description: 'Fixed height card rendered by the virtualizer',
      tags: [index % 3 === 0 ? 'frontend' : 'backend']
    }))
  },
  {
    id: 'in-progress',
    title: 'In progress (60 cards)',
    cards: Array.from({ length: 60 }, (_, index) => ({
      id: `wip-${index}`,
      title: `Feature ${index + 1}`,
      description: 'Scroll the column to render the next window of cards'
    }))
  }
];

export function Virtualized() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem' }}>
        Virtualization requires a fixed card height (96px) and a bounded column height (420px).
        Cards taller than cardHeight are clipped.
      </p>
      <Kanban
        columns={virtualizedColumns}
        virtualizeCards
        cardHeight={96}
        overscan={3}
        maxColumnHeight={420}
        onCardMove={() => undefined}
      />
    </div>
  );
}

const cardLabel = (card: KanbanCard): string =>
  typeof card.title === 'string' ? card.title : card.id;

const replaceCard = (columns: KanbanColumn[], next: KanbanCard): KanbanColumn[] =>
  columns.map((column) => ({
    ...column,
    cards: column.cards.map((card) => (card.id === next.id ? next : card))
  }));

export function CardEditing() {
  const [columns, setColumns] = useState(initialColumns);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem' }}>
        Double click a card, press Enter on a focused card or use the &quot;Edit card&quot; button.
        Escape cancels the edit and focus returns to the card.
      </p>
      <Kanban
        columns={columns}
        editable
        onCardEdit={(_card, next) => setColumns((current) => replaceCard(current, next))}
      />
    </div>
  );
}

export function CustomCardEditor() {
  const [columns, setColumns] = useState(initialColumns);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem' }}>
        <code>renderCardEditor</code> replaces the inline editor. The helpers receive the complete
        next card, so the consumer keeps full control over the UI.
      </p>
      <Kanban
        columns={columns}
        editable
        onCardEdit={(_card, next) => setColumns((current) => replaceCard(current, next))}
        renderCardEditor={(card, helpers) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <strong style={{ fontSize: '0.8125rem' }}>Editing “{cardLabel(card)}”</strong>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => helpers.onSave({ ...card, title: `${cardLabel(card)} (edited)` })}
              >
                Append &quot;(edited)&quot;
              </button>
              <button type="button" onClick={helpers.onCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}

const checklistColumnsSeed: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      {
        id: 'release',
        title: 'Release 2.0',
        description: 'Cut the release candidate',
        checklist: [
          { id: 'spec', label: 'Write release notes', done: true },
          { id: 'qa', label: 'QA regression', done: false },
          { id: 'docs', label: 'Update API docs', done: false }
        ]
      },
      {
        id: 'audit',
        title: 'Accessibility audit',
        checklist: [{ id: 'axe', label: 'Run axe on every story', done: false }]
      }
    ]
  },
  { id: 'done', title: 'Done', cards: [] }
];

export function Checklist() {
  const [columns, setColumns] = useState(checklistColumnsSeed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem' }}>
        Checklist items are controlled by the card: <code>onChecklistChange</code> receives a new
        array and never mutates the props. The <code>x/y</code> progress bar can be hidden with
        <code>showChecklistProgress=&#123;false&#125;</code>.
      </p>
      <Kanban
        columns={columns}
        onChecklistChange={(card, checklist) =>
          setColumns((current) =>
            current.map((column) => ({
              ...column,
              cards: column.cards.map((item) =>
                item.id === card.id ? { ...item, checklist } : item
              )
            }))
          )
        }
      />
    </div>
  );
}

const labeledColumns: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      {
        id: 'payments',
        title: 'Payments revamp',
        description: 'Checkout, retries and receipts',
        labels: [
          { id: 'design', label: 'design', color: '#3366ff' },
          { id: 'backend', label: 'backend', color: '#00d68f' }
        ],
        assignees: [
          { id: 'ana', name: 'Ana Souza' },
          { id: 'bruno', name: 'Bruno Lima' },
          {
            id: 'carla',
            name: 'Carla Dias',
            avatar: 'https://i.pravatar.cc/48?img=5'
          }
        ]
      },
      {
        id: 'search',
        title: 'Search filters',
        labels: [{ id: 'frontend', label: 'frontend', color: '#ffaa00' }],
        assignees: [{ id: 'ana', name: 'Ana Souza' }]
      }
    ]
  },
  { id: 'review', title: 'Review', cards: [] }
];

export function LabelsAndAssignees() {
  const [selection, setSelection] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem' }}>
        Labels render as chips (with an optional color dot) and assignees as avatars, falling back
        to initials when no image is provided. Both expose accessible names.
      </p>
      <p role="status" style={{ margin: 0, fontSize: '0.8125rem' }}>
        {selection || 'Click a label or an assignee'}
      </p>
      <Kanban
        columns={labeledColumns}
        onLabelClick={(card, label) => setSelection(`Label "${label.label}" on ${cardLabel(card)}`)}
        onAssigneeClick={(card, assignee) =>
          setSelection(`Assignee "${assignee.name}" on ${cardLabel(card)}`)
        }
      />
    </div>
  );
}
