import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Kanban, KanbanCard, KanbanColumn } from '@nebular-react/core';

const createDataTransfer = () => {
  const store: Record<string, string> = {};

  return {
    dropEffect: 'none',
    effectAllowed: 'all',
    setData(format: string, value: string) {
      store[format] = value;
    },
    getData(format: string) {
      return store[format] || '';
    },
    clearData() {
      Object.keys(store).forEach((format) => {
        delete store[format];
      });
    },
    setDragImage: jest.fn()
  };
};

const columns: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [
      {
        id: 'design',
        title: 'Design landing page',
        description: 'Hero and pricing',
        tags: ['design']
      },
      { id: 'api', title: 'Ship API' }
    ]
  },
  {
    id: 'in-progress',
    title: 'In progress',
    cards: [{ id: 'tests', title: 'Write tests' }]
  },
  { id: 'done', title: 'Done', cards: [] }
];

const limitedColumns: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [{ id: 'design', title: 'Design landing page' }]
  },
  {
    id: 'done',
    title: 'Done',
    limit: 1,
    cards: [{ id: 'ship', title: 'Ship release' }]
  }
];

type LaneCard = KanbanCard & { lane: string };

const laneCard = (id: string, title: string, lane: string): KanbanCard =>
  ({ id, title, lane }) as KanbanCard;

const swimlanes = [
  { key: 'urgent', label: 'Urgent' },
  { key: 'standard', label: 'Standard' }
];

const swimlaneColumns: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [laneCard('outage', 'Fix outage', 'urgent'), laneCard('docs', 'Write docs', 'standard')]
  },
  { id: 'done', title: 'Done', cards: [] }
];

const getCardSwimlane = (card: KanbanCard) => (card as LaneCard).lane;

const wipColumns: KanbanColumn[] = [
  { id: 'todo', title: 'To do', cards: [{ id: 'design', title: 'Design landing page' }] },
  { id: 'done', title: 'Done', cards: [{ id: 'ship', title: 'Ship release' }] }
];

const manyCards: KanbanCard[] = Array.from({ length: 20 }, (_, index) => ({
  id: `card-${index}`,
  title: `Card ${index + 1}`
}));

const editableColumns: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [{ id: 'design', title: 'Design landing page', description: 'Hero and pricing' }]
  },
  { id: 'done', title: 'Done', cards: [] }
];

const initialChecklist = [
  { id: 'spec', label: 'Write spec', done: true },
  { id: 'qa', label: 'QA review', done: false }
];

const checklistCard: KanbanCard = {
  id: 'release',
  title: 'Release 2.0',
  checklist: initialChecklist
};

const richCard: KanbanCard = {
  id: 'payments',
  title: 'Payments revamp',
  labels: [
    { id: 'l-design', label: 'design', color: '#3366ff' },
    { id: 'l-backend', label: 'backend' }
  ],
  assignees: [
    { id: 'u-ana', name: 'Ana Souza' },
    { id: 'u-bruno', name: 'Bruno Lima', avatar: 'https://example.com/bruno.png' }
  ],
  checklist: [
    { id: 'c-spec', label: 'Write spec', done: true },
    { id: 'c-qa', label: 'QA review', done: false }
  ]
};

const richColumns: KanbanColumn[] = [
  { id: 'todo', title: 'To do', cards: [richCard] },
  { id: 'done', title: 'Done', cards: [] }
];

function ChecklistBoard({ onChecklistChange }: { onChecklistChange: jest.Mock }) {
  const [cards, setCards] = React.useState<KanbanCard[]>([checklistCard]);

  return (
    <Kanban
      columns={[{ id: 'todo', title: 'To do', cards }]}
      onChecklistChange={(card, checklist) => {
        onChecklistChange(card, checklist);
        setCards((current) =>
          current.map((item) => (item.id === card.id ? { ...item, checklist } : item))
        );
      }}
    />
  );
}

describe('Kanban', () => {
  it('Kanban_Render_ShouldShowColumnsCardsAndCounts', () => {
    render(<Kanban columns={columns} />);

    const todo = screen.getByRole('region', { name: 'To do' });
    const inProgress = screen.getByRole('region', { name: 'In progress' });
    const done = screen.getByRole('region', { name: 'Done' });

    expect(todo).toBeInTheDocument();
    expect(inProgress).toBeInTheDocument();
    expect(done).toBeInTheDocument();

    expect(within(todo).getAllByRole('listitem')).toHaveLength(2);
    expect(within(inProgress).getAllByRole('listitem')).toHaveLength(1);
    expect(within(done).queryAllByRole('listitem')).toHaveLength(0);

    expect(screen.getByText('Design landing page')).toBeInTheDocument();
    expect(screen.getByText('Hero and pricing')).toBeInTheDocument();
    expect(screen.getByText('design')).toBeInTheDocument();

    expect(screen.getByText('2 cards')).toBeInTheDocument();
    expect(screen.getByText('1 card')).toBeInTheDocument();
    expect(screen.getByText('0 cards')).toBeInTheDocument();
  });

  it('Kanban_Render_ShouldExposeFocusableDraggableCardsWithShortcutLabel', () => {
    render(<Kanban columns={columns} />);

    const card = screen.getByRole('listitem', { name: /Design landing page/ });

    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveAttribute('draggable', 'true');
    expect(card).toHaveAccessibleName(/Alt\+ArrowLeft or Alt\+ArrowRight/);
    expect(card).toHaveAccessibleName(/Alt\+ArrowUp or Alt\+ArrowDown/);
  });

  it('Kanban_RenderCard_ShouldRenderCustomCardContent', () => {
    render(<Kanban columns={columns} renderCard={(card) => <span>Custom {card.id}</span>} />);

    expect(screen.getByText('Custom design')).toBeInTheDocument();
    expect(screen.getByText('Custom api')).toBeInTheDocument();
    expect(screen.queryByText('Hero and pricing')).not.toBeInTheDocument();
  });

  it('Kanban_Drag_ShouldMoveCardToAnotherColumn', () => {
    const onCardMove = jest.fn();
    const dataTransfer = createDataTransfer();

    render(<Kanban columns={columns} onCardMove={onCardMove} />);

    const card = screen.getByRole('listitem', { name: /Design landing page/ });
    const targetList = within(screen.getByRole('region', { name: 'In progress' })).getByRole(
      'list'
    );

    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragOver(targetList, { dataTransfer });
    fireEvent.drop(targetList, { dataTransfer });

    expect(onCardMove).toHaveBeenCalledWith('design', 'todo', 'in-progress', 1);
  });

  it('Kanban_DropOnCard_ShouldInsertAtCardPosition', () => {
    const onCardMove = jest.fn();
    const dataTransfer = createDataTransfer();

    render(<Kanban columns={columns} onCardMove={onCardMove} />);

    const source = screen.getByRole('listitem', { name: /Design landing page/ });
    const target = screen.getByRole('listitem', { name: /Write tests/ });

    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });

    expect(onCardMove).toHaveBeenCalledWith('design', 'todo', 'in-progress', 0);
  });

  it('Kanban_Drag_ShouldReorderCardWithinItsColumn', () => {
    const onCardMove = jest.fn();
    const dataTransfer = createDataTransfer();

    render(<Kanban columns={columns} onCardMove={onCardMove} />);

    const source = screen.getByRole('listitem', { name: /Ship API/ });
    const target = screen.getByRole('listitem', { name: /Design landing page/ });

    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });

    expect(onCardMove).toHaveBeenCalledWith('api', 'todo', 'todo', 0);
  });

  it('Kanban_Keyboard_ShouldMoveCardBetweenColumns', async () => {
    const user = userEvent.setup();
    const onCardMove = jest.fn();

    render(<Kanban columns={columns} onCardMove={onCardMove} />);

    const card = screen.getByRole('listitem', { name: /Design landing page/ });
    card.focus();
    await user.keyboard('{Alt>}{ArrowRight}{/Alt}');

    expect(onCardMove).toHaveBeenCalledWith('design', 'todo', 'in-progress', 1);

    onCardMove.mockClear();
    card.focus();
    await user.keyboard('{Alt>}{ArrowLeft}{/Alt}');

    expect(onCardMove).not.toHaveBeenCalled();
  });

  it('Kanban_Keyboard_ShouldReorderCardWithinColumn', async () => {
    const user = userEvent.setup();
    const onCardMove = jest.fn();

    render(<Kanban columns={columns} onCardMove={onCardMove} />);

    const apiCard = screen.getByRole('listitem', { name: /Ship API/ });
    apiCard.focus();
    await user.keyboard('{Alt>}{ArrowUp}{/Alt}');

    expect(onCardMove).toHaveBeenCalledWith('api', 'todo', 'todo', 0);

    const designCard = screen.getByRole('listitem', { name: /Design landing page/ });
    designCard.focus();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');

    expect(onCardMove).toHaveBeenLastCalledWith('design', 'todo', 'todo', 1);
  });

  it('Kanban_Limit_ShouldBlockMovesToFullColumn', async () => {
    const user = userEvent.setup();
    const onCardMove = jest.fn();
    const dataTransfer = createDataTransfer();

    render(<Kanban columns={limitedColumns} onCardMove={onCardMove} />);

    expect(screen.getByText('1 of 1 card')).toBeInTheDocument();

    const card = screen.getByRole('listitem', { name: /Design landing page/ });
    const doneList = within(screen.getByRole('region', { name: 'Done' })).getByRole('list');

    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragOver(doneList, { dataTransfer });
    fireEvent.drop(doneList, { dataTransfer });

    expect(onCardMove).not.toHaveBeenCalled();

    card.focus();
    await user.keyboard('{Alt>}{ArrowRight}{/Alt}');

    expect(onCardMove).not.toHaveBeenCalled();
  });

  it('Kanban_ColumnAriaLabel_ShouldNameColumns', () => {
    render(
      <Kanban
        columns={columns}
        ariaLabel="Roadmap"
        columnAriaLabel={(column) => `${column.title} column`}
      />
    );

    expect(screen.getByRole('region', { name: 'Roadmap' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'To do column' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Done column' })).toBeInTheDocument();
  });

  it('Kanban_Swimlanes_ShouldRenderEveryLaneAndEmptyLaneCells', () => {
    render(
      <Kanban columns={swimlaneColumns} swimlanes={swimlanes} getCardSwimlane={getCardSwimlane} />
    );

    const urgent = screen.getByRole('region', { name: 'Urgent swimlane' });
    const standard = screen.getByRole('region', { name: 'Standard swimlane' });

    expect(urgent).toBeInTheDocument();
    expect(standard).toBeInTheDocument();
    expect(within(urgent).getByRole('heading', { name: 'Urgent' })).toBeInTheDocument();

    const urgentTodo = within(urgent).getByRole('region', { name: 'To do, Urgent' });
    const standardTodo = within(standard).getByRole('region', { name: 'To do, Standard' });

    expect(within(urgentTodo).getByText('Fix outage')).toBeInTheDocument();
    expect(within(urgentTodo).queryByText('Write docs')).not.toBeInTheDocument();
    expect(within(standardTodo).getByText('Write docs')).toBeInTheDocument();

    const standardDone = within(standard).getByRole('region', { name: 'Done, Standard' });

    expect(within(standardDone).getByText('No cards')).toBeInTheDocument();
  });

  it('Kanban_Swimlanes_ShouldMoveCardBetweenLanesWithContext', () => {
    const onCardMove = jest.fn();
    const dataTransfer = createDataTransfer();

    render(
      <Kanban
        columns={swimlaneColumns}
        swimlanes={swimlanes}
        getCardSwimlane={getCardSwimlane}
        onCardMove={onCardMove}
      />
    );

    const source = screen.getByRole('listitem', { name: /Write docs/ });
    const targetList = within(screen.getByRole('region', { name: 'Done, Urgent' })).getByRole(
      'list'
    );

    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(targetList, { dataTransfer });
    fireEvent.drop(targetList, { dataTransfer });

    expect(onCardMove).toHaveBeenCalledWith('docs', 'todo', 'done', 0, {
      fromColumnKey: 'todo',
      toColumnKey: 'done',
      fromSwimlaneKey: 'standard',
      swimlaneKey: 'urgent'
    });
  });

  it('Kanban_Swimlanes_ShouldMoveCardBetweenLanesOfTheSameColumn', () => {
    const onCardMove = jest.fn();
    const dataTransfer = createDataTransfer();

    render(
      <Kanban
        columns={swimlaneColumns}
        swimlanes={swimlanes}
        getCardSwimlane={getCardSwimlane}
        onCardMove={onCardMove}
      />
    );

    const source = screen.getByRole('listitem', { name: /Write docs/ });
    const urgentTodoList = within(screen.getByRole('region', { name: 'To do, Urgent' })).getByRole(
      'list'
    );

    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(urgentTodoList, { dataTransfer });
    fireEvent.drop(urgentTodoList, { dataTransfer });

    expect(onCardMove).toHaveBeenCalledWith('docs', 'todo', 'todo', 1, {
      fromColumnKey: 'todo',
      toColumnKey: 'todo',
      fromSwimlaneKey: 'standard',
      swimlaneKey: 'urgent'
    });
  });

  it('Kanban_WipLimits_ShouldBlockMovesAndExposeLimitState', async () => {
    const user = userEvent.setup();
    const onCardMove = jest.fn();
    const onWipLimitExceeded = jest.fn();
    const dataTransfer = createDataTransfer();

    render(
      <Kanban
        columns={wipColumns}
        wipLimits={{ done: 1 }}
        onCardMove={onCardMove}
        onWipLimitExceeded={onWipLimitExceeded}
      />
    );

    const done = screen.getByRole('region', { name: 'Done' });
    const doneList = within(done).getByRole('list');

    expect(within(done).getByText('1 / 1')).toBeInTheDocument();
    expect(done).toHaveAttribute('data-wip-full', 'true');

    const describedBy = doneList.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      '1 of 1 card. WIP limit reached.'
    );

    const card = screen.getByRole('listitem', { name: /Design landing page/ });

    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragOver(doneList, { dataTransfer });
    fireEvent.drop(doneList, { dataTransfer });

    expect(onCardMove).not.toHaveBeenCalled();
    expect(onWipLimitExceeded).toHaveBeenCalledWith('done', 1);

    card.focus();
    await user.keyboard('{Alt>}{ArrowRight}{/Alt}');

    expect(onCardMove).not.toHaveBeenCalled();
    expect(onWipLimitExceeded).toHaveBeenCalledTimes(2);
  });

  it('Kanban_WipLimits_ShouldWarnButAllowMovesWhenEnforcementIsDisabled', () => {
    const onCardMove = jest.fn();
    const onWipLimitExceeded = jest.fn();
    const dataTransfer = createDataTransfer();

    render(
      <Kanban
        columns={wipColumns}
        wipLimits={{ done: 1 }}
        enforceWipLimit={false}
        onCardMove={onCardMove}
        onWipLimitExceeded={onWipLimitExceeded}
      />
    );

    const card = screen.getByRole('listitem', { name: /Design landing page/ });
    const doneList = within(screen.getByRole('region', { name: 'Done' })).getByRole('list');

    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragOver(doneList, { dataTransfer });
    fireEvent.drop(doneList, { dataTransfer });

    expect(onWipLimitExceeded).toHaveBeenCalledWith('done', 1);
    expect(onCardMove).toHaveBeenCalledWith('design', 'todo', 'done', 1);
  });

  it('Kanban_Virtualization_ShouldRenderOnlyVisibleCardsAndUpdateOnScroll', () => {
    render(
      <Kanban
        columns={[{ id: 'todo', title: 'To do', cards: manyCards }]}
        virtualizeCards
        cardHeight={100}
        overscan={2}
        maxColumnHeight={300}
      />
    );

    const list = within(screen.getByRole('region', { name: 'To do' })).getByRole('list');

    expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    expect(within(list).getByText('Card 1')).toBeInTheDocument();
    expect(within(list).queryByText('Card 6')).not.toBeInTheDocument();
    expect(list.querySelector('[data-kanban-spacer="top"]')).toBeNull();

    list.scrollTop = 500;
    fireEvent.scroll(list);

    expect(within(list).getAllByRole('listitem')).toHaveLength(8);
    expect(within(list).queryByText('Card 1')).not.toBeInTheDocument();
    expect(within(list).getByText('Card 3')).toBeInTheDocument();
    expect(within(list).getByText('Card 10')).toBeInTheDocument();
    expect(within(list).queryByText('Card 11')).not.toBeInTheDocument();
    expect(list.querySelector('[data-kanban-spacer="top"]')).toHaveStyle({ height: '216px' });
  });

  it('Kanban_Virtualization_ShouldRecalculateWhenViewportResizes', () => {
    render(
      <Kanban
        columns={[{ id: 'todo', title: 'To do', cards: manyCards }]}
        virtualizeCards
        cardHeight={100}
        overscan={2}
        maxColumnHeight={300}
      />
    );

    const list = within(screen.getByRole('region', { name: 'To do' })).getByRole('list');

    expect(within(list).getAllByRole('listitem')).toHaveLength(5);

    Object.defineProperty(list, 'clientHeight', { configurable: true, value: 600 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(within(list).getAllByRole('listitem')).toHaveLength(8);
    expect(within(list).getByText('Card 8')).toBeInTheDocument();
    expect(within(list).queryByText('Card 9')).not.toBeInTheDocument();
  });

  it('Kanban_Virtualization_ShouldPreserveDragAndDrop', () => {
    const onCardMove = jest.fn();
    const dataTransfer = createDataTransfer();

    render(
      <Kanban
        columns={[{ id: 'todo', title: 'To do', cards: manyCards }]}
        virtualizeCards
        cardHeight={100}
        overscan={2}
        maxColumnHeight={300}
        onCardMove={onCardMove}
      />
    );

    const source = screen.getByRole('listitem', { name: /^Card 1\./ });
    const target = screen.getByRole('listitem', { name: /^Card 3\./ });

    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });

    expect(onCardMove).toHaveBeenCalledWith('card-0', 'todo', 'todo', 1);
  });

  it('Kanban_Virtualization_ShouldKeepFocusedCardRenderedWhenScrolledAway', () => {
    render(
      <Kanban
        columns={[{ id: 'todo', title: 'To do', cards: manyCards }]}
        virtualizeCards
        cardHeight={100}
        overscan={2}
        maxColumnHeight={300}
      />
    );

    const list = within(screen.getByRole('region', { name: 'To do' })).getByRole('list');
    const card = within(list).getByRole('listitem', { name: /^Card 2\./ });

    card.focus();
    expect(document.activeElement).toBe(card);

    list.scrollTop = 1000;
    fireEvent.scroll(list);

    const stillRendered = within(list).getByRole('listitem', { name: /^Card 2\./ });

    expect(stillRendered).toBeInTheDocument();
    expect(document.activeElement).toBe(stillRendered);
  });

  it('Kanban_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(<Kanban columns={columns} onCardMove={jest.fn()} />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('Kanban_SwimlanesWipAndVirtualization_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Kanban
        columns={swimlaneColumns}
        swimlanes={swimlanes}
        getCardSwimlane={getCardSwimlane}
        wipLimits={{ todo: 2, done: 1 }}
        virtualizeCards
        cardHeight={80}
        maxColumnHeight={240}
        onCardMove={jest.fn()}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('Kanban_Editable_ShouldOpenOnDoubleClickAndSaveTitleAndDescription', () => {
    const onCardEdit = jest.fn();

    render(<Kanban columns={editableColumns} editable onCardEdit={onCardEdit} />);

    const card = screen.getByRole('listitem', { name: /Design landing page/ });

    fireEvent.doubleClick(card);

    const titleInput = screen.getByRole('textbox', { name: 'Card title' });
    const descriptionInput = screen.getByRole('textbox', { name: 'Card description' });

    expect(titleInput).toHaveValue('Design landing page');
    expect(descriptionInput).toHaveValue('Hero and pricing');
    expect(document.activeElement).toBe(titleInput);

    fireEvent.change(titleInput, { target: { value: 'Design checkout page' } });
    fireEvent.change(descriptionInput, { target: { value: 'New hero and pricing' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save card' }));

    expect(onCardEdit).toHaveBeenCalledTimes(1);

    const [original, next] = onCardEdit.mock.calls[0];

    expect(original).toBe(editableColumns[0].cards[0]);
    expect(original.title).toBe('Design landing page');
    expect(next).not.toBe(original);
    expect(next).toMatchObject({
      id: 'design',
      title: 'Design checkout page',
      description: 'New hero and pricing'
    });

    expect(screen.queryByRole('textbox', { name: 'Card title' })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(card);
  });

  it('Kanban_Editable_ShouldOpenWithEnterAndEditButton', () => {
    render(<Kanban columns={editableColumns} editable onCardEdit={jest.fn()} />);

    const card = screen.getByRole('listitem', { name: /Design landing page/ });

    act(() => card.focus());
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(screen.getByRole('textbox', { name: 'Card title' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel editing' }));

    expect(screen.queryByRole('textbox', { name: 'Card title' })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(card);

    fireEvent.click(screen.getByRole('button', { name: 'Edit card: Design landing page' }));

    expect(screen.getByRole('textbox', { name: 'Card title' })).toBeInTheDocument();
  });

  it('Kanban_Editable_ShouldCancelWithEscapeWithoutSaving', () => {
    const onCardEdit = jest.fn();

    render(<Kanban columns={editableColumns} editable onCardEdit={onCardEdit} />);

    const card = screen.getByRole('listitem', { name: /Design landing page/ });

    fireEvent.doubleClick(card);
    fireEvent.change(screen.getByRole('textbox', { name: 'Card title' }), {
      target: { value: 'Discarded title' }
    });
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Card title' }), { key: 'Escape' });

    expect(onCardEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox', { name: 'Card title' })).not.toBeInTheDocument();
    expect(screen.getByText('Design landing page')).toBeInTheDocument();
    expect(document.activeElement).toBe(card);
  });

  it('Kanban_Editable_ShouldSaveWithEnterOnTitleField', () => {
    const onCardEdit = jest.fn();

    render(<Kanban columns={editableColumns} editable onCardEdit={onCardEdit} />);

    fireEvent.doubleClick(screen.getByRole('listitem', { name: /Design landing page/ }));

    const titleInput = screen.getByRole('textbox', { name: 'Card title' });

    fireEvent.change(titleInput, { target: { value: 'Design v2' } });
    fireEvent.keyDown(titleInput, { key: 'Enter' });

    expect(onCardEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'design' }),
      expect.objectContaining({ id: 'design', title: 'Design v2' })
    );
    expect(screen.queryByRole('textbox', { name: 'Card title' })).not.toBeInTheDocument();
  });

  it('Kanban_Editable_ShouldRenderCustomEditorWithHelpers', () => {
    const onCardEdit = jest.fn();

    render(
      <Kanban
        columns={editableColumns}
        editable
        onCardEdit={onCardEdit}
        renderCardEditor={(card, helpers) => (
          <div>
            <span>Custom editor for {card.id}</span>
            <button type="button" onClick={() => helpers.onSave({ ...card, title: 'Renamed' })}>
              Apply
            </button>
            <button type="button" onClick={helpers.onCancel}>
              Dismiss
            </button>
          </div>
        )}
      />
    );

    const card = screen.getByRole('listitem', { name: /Design landing page/ });

    fireEvent.doubleClick(card);

    const editor = screen.getByRole('group', { name: 'Edit Design landing page' });

    expect(within(editor).getByText('Custom editor for design')).toBeInTheDocument();
    expect(document.activeElement).toBe(within(editor).getByRole('button', { name: 'Apply' }));

    fireEvent.click(within(editor).getByRole('button', { name: 'Apply' }));

    expect(onCardEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'design' }),
      expect.objectContaining({ id: 'design', title: 'Renamed' })
    );
    expect(screen.queryByText('Custom editor for design')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(card);
  });

  it('Kanban_Editable_ShouldIgnoreEditGesturesAndShortcutsWhenDisabled', () => {
    const onCardMove = jest.fn();

    render(<Kanban columns={editableColumns} onCardMove={onCardMove} />);

    const card = screen.getByRole('listitem', { name: /Design landing page/ });

    fireEvent.doubleClick(card);
    act(() => card.focus());
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(screen.queryByRole('textbox', { name: 'Card title' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit card/ })).not.toBeInTheDocument();
    expect(onCardMove).not.toHaveBeenCalled();
  });

  it('Kanban_Editable_ShouldIgnoreBoardShortcutsWhileEditing', () => {
    const onCardMove = jest.fn();

    render(<Kanban columns={editableColumns} editable onCardMove={onCardMove} />);

    fireEvent.doubleClick(screen.getByRole('listitem', { name: /Design landing page/ }));

    const titleInput = screen.getByRole('textbox', { name: 'Card title' });

    fireEvent.keyDown(titleInput, { key: 'ArrowRight', altKey: true });

    expect(onCardMove).not.toHaveBeenCalled();
  });

  it('Kanban_Checklist_ShouldToggleItemsAndUpdateProgressWithoutMutatingProps', () => {
    const onChecklistChange = jest.fn();

    render(<ChecklistBoard onChecklistChange={onChecklistChange} />);

    expect(screen.getByText('1/2')).toBeInTheDocument();

    const progress = screen.getByRole('progressbar', { name: 'Checklist progress: Release 2.0' });

    expect(progress).toHaveAttribute('aria-valuenow', '1');
    expect(progress).toHaveAttribute('aria-valuemax', '2');
    expect(progress).toHaveAttribute('aria-valuetext', '1 of 2 complete');
    expect(screen.getByRole('checkbox', { name: 'Toggle Write spec' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Toggle QA review' })).not.toBeChecked();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Toggle QA review' }));

    expect(onChecklistChange).toHaveBeenCalledTimes(1);

    const [editedCard, nextChecklist] = onChecklistChange.mock.calls[0];

    expect(editedCard.id).toBe('release');
    expect(nextChecklist).not.toBe(initialChecklist);
    expect(nextChecklist).toEqual([
      { id: 'spec', label: 'Write spec', done: true },
      { id: 'qa', label: 'QA review', done: true }
    ]);
    expect(initialChecklist[1].done).toBe(false);

    expect(screen.getByText('2/2')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Checklist progress: Release 2.0' })
    ).toHaveAttribute('aria-valuenow', '2');
    expect(screen.getByRole('checkbox', { name: 'Toggle QA review' })).toBeChecked();
  });

  it('Kanban_Checklist_ShouldHideProgressWhenDisabled', () => {
    render(
      <Kanban
        columns={[{ id: 'todo', title: 'To do', cards: [checklistCard] }]}
        showChecklistProgress={false}
      />
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('1/2')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Toggle Write spec' })).toBeChecked();
  });

  it('Kanban_LabelsAndAssignees_ShouldRenderChipsAvatarsAndInitials', () => {
    render(<Kanban columns={richColumns} />);

    const labels = screen.getByRole('group', { name: 'Labels' });

    expect(within(labels).getByText('design')).toBeInTheDocument();
    expect(within(labels).getByText('backend')).toBeInTheDocument();
    expect(within(labels).getByLabelText('Label design')).toHaveTextContent('design');

    const assignees = screen.getByRole('group', { name: 'Assignees' });
    const ana = within(assignees).getByRole('img', { name: 'Assignee Ana Souza' });
    const bruno = within(assignees).getByRole('img', { name: 'Assignee Bruno Lima' });

    expect(ana).toHaveTextContent('AS');
    expect(bruno.querySelector('img')).toHaveAttribute('src', 'https://example.com/bruno.png');
  });

  it('Kanban_LabelsAndAssignees_ShouldNotifyClicks', () => {
    const onLabelClick = jest.fn();
    const onAssigneeClick = jest.fn();

    render(
      <Kanban columns={richColumns} onLabelClick={onLabelClick} onAssigneeClick={onAssigneeClick} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Label design' }));

    expect(onLabelClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'payments' }),
      expect.objectContaining({ id: 'l-design', label: 'design' })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Assignee Ana Souza' }));

    expect(onAssigneeClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'payments' }),
      expect.objectContaining({ id: 'u-ana', name: 'Ana Souza' })
    );
  });

  it('Kanban_EditableChecklistLabels_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Kanban
        columns={richColumns}
        editable
        onCardEdit={jest.fn()}
        onChecklistChange={jest.fn()}
        onLabelClick={jest.fn()}
        onAssigneeClick={jest.fn()}
      />
    );

    fireEvent.doubleClick(screen.getByRole('listitem', { name: /Payments revamp/ }));

    expect(screen.getByRole('textbox', { name: 'Card title' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
