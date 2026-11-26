import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { ProgressBar } from '../ProgressBar';

const VIRTUAL_CARD_GAP = 8;

const useStyles = createStyles(() => ({
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--kanban-column-gap, 0.75rem)',
    width: '100%',
    minWidth: 0,
    overflowX: 'auto',
    padding: 'var(--kanban-padding, 0.25rem)',
    fontFamily: 'var(--kanban-font-family, inherit)'
  },

  rootSwimlanes: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--kanban-swimlane-gap, 1rem)'
  },

  swimlane: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: 'max-content',
    minWidth: '100%'
  },

  swimlaneHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    padding: 'var(--kanban-swimlane-header-padding, 0.35rem 0.5rem)',
    borderBottom:
      '1px solid var(--kanban-swimlane-header-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--kanban-swimlane-header-background-color, var(--background-basic-color-1, #ffffff))'
  },

  swimlaneTitle: {
    margin: 0,
    color: 'var(--kanban-swimlane-title-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--kanban-swimlane-title-font-size, 0.8125rem)',
    fontWeight: 700,
    lineHeight: 1.3
  },

  swimlaneColumns: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--kanban-column-gap, 0.75rem)'
  },

  column: {
    display: 'flex',
    flexDirection: 'column',
    flex: '0 0 auto',
    gap: '0.5rem',
    width: 'var(--kanban-column-width, 18rem)',
    maxWidth: 'var(--kanban-column-max-width, 24rem)',
    padding: 'var(--kanban-column-padding, 0.75rem)',
    border: '1px solid var(--kanban-column-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--kanban-column-border-radius, 0.5rem)',
    backgroundColor:
      'var(--kanban-column-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  columnFull: {
    borderColor: 'var(--kanban-column-full-border-color, var(--color-warning-500, #ffaa00))'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem'
  },

  title: {
    margin: 0,
    color: 'var(--kanban-title-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--kanban-title-font-size, 0.875rem)',
    fontWeight: 700,
    lineHeight: 1.3
  },

  count: {
    flex: '0 0 auto',
    padding: 'var(--kanban-count-padding, 0.075rem 0.45rem)',
    borderRadius: 'var(--kanban-count-border-radius, 999px)',
    backgroundColor: 'var(--kanban-count-background-color, rgba(143, 155, 179, 0.16))',
    color: 'var(--kanban-count-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--kanban-count-font-size, 0.75rem)',
    fontWeight: 600
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--kanban-card-gap, 0.5rem)',
    margin: 0,
    padding: 'var(--kanban-list-padding, 0.125rem)',
    listStyle: 'none',
    minHeight: 'var(--kanban-list-min-height, 3rem)',
    borderRadius: 'var(--kanban-list-border-radius, 0.375rem)',
    transition: 'background-color 120ms ease-in-out'
  },

  listVirtual: {
    gap: 0,
    padding: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain'
  },

  listOver: {
    backgroundColor: 'var(--kanban-list-over-background-color, rgba(51, 102, 255, 0.08))'
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    padding: 'var(--kanban-card-padding, 0.625rem 0.75rem)',
    border: '1px solid var(--kanban-card-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--kanban-card-border-radius, 0.375rem)',
    backgroundColor:
      'var(--kanban-card-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--kanban-card-shadow, 0 1px 2px rgba(0, 0, 0, 0.06))',
    color: 'var(--kanban-card-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--kanban-card-font-size, 0.8125rem)',
    cursor: 'grab',

    '&:active': {
      cursor: 'grabbing'
    },

    '&:focus-visible': {
      outline: '2px solid var(--kanban-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  cardDragging: {
    opacity: 0.5
  },

  virtualCard: {
    boxSizing: 'border-box',
    flex: '0 0 auto',
    overflow: 'hidden'
  },

  spacer: {
    flex: '0 0 auto',
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },

  cardTitle: {
    fontWeight: 600,
    lineHeight: 1.35
  },

  cardDescription: {
    color: 'var(--kanban-card-description-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--kanban-card-description-font-size, 0.75rem)',
    lineHeight: 1.35
  },

  cardTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem'
  },

  cardTag: {
    padding: 'var(--kanban-card-tag-padding, 0.05rem 0.35rem)',
    borderRadius: 'var(--kanban-card-tag-border-radius, 999px)',
    backgroundColor: 'var(--kanban-card-tag-background-color, rgba(51, 102, 255, 0.12))',
    color: 'var(--kanban-card-tag-color, var(--color-primary-600, #274bdb))',
    fontSize: 'var(--kanban-card-tag-font-size, 0.6875rem)',
    fontWeight: 600
  },

  cardLabels: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.25rem'
  },

  cardLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: 'var(--kanban-card-label-padding, 0.05rem 0.35rem)',
    border: 'none',
    borderRadius: 'var(--kanban-card-label-border-radius, 999px)',
    backgroundColor: 'var(--kanban-card-label-background-color, rgba(143, 155, 179, 0.16))',
    color: 'var(--kanban-card-label-color, var(--text-hint-color, #8f9bb3))',
    fontFamily: 'inherit',
    fontSize: 'var(--kanban-card-label-font-size, 0.6875rem)',
    fontWeight: 600,
    lineHeight: 1.4
  },

  cardLabelButton: {
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--kanban-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  cardLabelDot: {
    display: 'inline-block',
    flex: '0 0 auto',
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '50%'
  },

  cardAssignees: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.25rem'
  },

  cardAssignee: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--kanban-card-assignee-size, 1.5rem)',
    height: 'var(--kanban-card-assignee-size, 1.5rem)',
    padding: 0,
    border: '1px solid var(--kanban-card-assignee-border-color, rgba(143, 155, 179, 0.32))',
    borderRadius: '50%',
    backgroundColor:
      'var(--kanban-card-assignee-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--kanban-card-assignee-color, var(--text-hint-color, #8f9bb3))',
    fontFamily: 'inherit',
    fontSize: 'var(--kanban-card-assignee-font-size, 0.625rem)',
    fontWeight: 700,
    overflow: 'hidden',

    '&:focus-visible': {
      outline: '2px solid var(--kanban-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  cardAssigneeImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  checklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },

  checklistProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },

  checklistProgressValue: {
    flex: '0 0 auto',
    color: 'var(--kanban-checklist-progress-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--kanban-checklist-progress-font-size, 0.6875rem)',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums'
  },

  checklistProgressBar: {
    flex: '1 1 auto'
  },

  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    cursor: 'pointer',
    fontSize: 'var(--kanban-checklist-item-font-size, 0.75rem)',
    lineHeight: 1.4
  },

  checklistCheckbox: {
    flex: '0 0 auto',
    margin: 0
  },

  checklistItemLabel: {
    color: 'var(--kanban-checklist-item-color, var(--text-basic-color, #222b45))'
  },

  checklistItemLabelDone: {
    color: 'var(--kanban-checklist-item-done-color, var(--text-hint-color, #8f9bb3))',
    textDecoration: 'line-through'
  },

  cardEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--kanban-editor-gap, 0.35rem)',

    '&:focus': {
      outline: 'none'
    },

    '&:focus-visible': {
      outline: '2px solid var(--kanban-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  editorInput: {
    boxSizing: 'border-box',
    width: '100%',
    padding: 'var(--kanban-editor-input-padding, 0.25rem 0.4rem)',
    border:
      '1px solid var(--kanban-editor-input-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--kanban-editor-input-border-radius, 0.25rem)',
    backgroundColor:
      'var(--kanban-editor-input-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--kanban-editor-input-color, var(--text-basic-color, #222b45))',
    fontFamily: 'inherit',
    fontSize: 'inherit',

    '&:focus-visible': {
      outline: '2px solid var(--kanban-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  editorTextarea: {
    boxSizing: 'border-box',
    width: '100%',
    padding: 'var(--kanban-editor-input-padding, 0.25rem 0.4rem)',
    border:
      '1px solid var(--kanban-editor-input-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--kanban-editor-input-border-radius, 0.25rem)',
    backgroundColor:
      'var(--kanban-editor-input-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--kanban-editor-input-color, var(--text-basic-color, #222b45))',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    resize: 'vertical',

    '&:focus-visible': {
      outline: '2px solid var(--kanban-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  editorActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },

  editorButton: {
    padding: 'var(--kanban-editor-button-padding, 0.15rem 0.5rem)',
    border:
      '1px solid var(--kanban-editor-button-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--kanban-editor-button-border-radius, 0.25rem)',
    backgroundColor:
      'var(--kanban-editor-button-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--kanban-editor-button-color, var(--text-basic-color, #222b45))',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'var(--kanban-editor-button-font-size, 0.75rem)',
    fontWeight: 600,

    '&:focus-visible': {
      outline: '2px solid var(--kanban-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  editorSave: {
    borderColor: 'var(--kanban-editor-save-border-color, var(--color-primary-500, #3366ff))',
    backgroundColor:
      'var(--kanban-editor-save-background-color, var(--color-primary-500, #3366ff))',
    color: 'var(--kanban-editor-save-color, #ffffff)'
  },

  cardActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },

  editButton: {
    padding: 'var(--kanban-edit-button-padding, 0.05rem 0.4rem)',
    border: '1px solid transparent',
    borderRadius: 'var(--kanban-edit-button-border-radius, 0.25rem)',
    backgroundColor: 'transparent',
    color: 'var(--kanban-edit-button-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'var(--kanban-edit-button-font-size, 0.6875rem)',
    fontWeight: 600,

    '&:focus-visible': {
      outline: '2px solid var(--kanban-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  empty: {
    padding: 'var(--kanban-empty-padding, 0.5rem)',
    color: 'var(--kanban-empty-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--kanban-empty-font-size, 0.75rem)',
    textAlign: 'center',
    listStyle: 'none'
  },

  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  }
}));

export type KanbanStylesNames = Selectors<typeof useStyles>;

export interface KanbanChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface KanbanLabel {
  id: string;
  label: string;
  color?: string;
}

export interface KanbanAssignee {
  id: string;
  name: string;
  avatar?: string;
}

export interface KanbanCardEditorHelpers {
  onSave(next: KanbanCard): void;
  onCancel(): void;
}

export interface KanbanCard {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tags?: React.ReactNode[];
  /**
   * Optional checklist rendered inside the default card. Toggling an item
   * emits `onChecklistChange` with a new array; the props are never mutated.
   */
  checklist?: KanbanChecklistItem[];
  labels?: KanbanLabel[];
  assignees?: KanbanAssignee[];
}

export interface KanbanColumn {
  id: string;
  title: React.ReactNode;
  cards: KanbanCard[];
  limit?: number;
}

export interface KanbanSwimlane {
  key: string;
  label: React.ReactNode;
}

export interface KanbanMoveContext {
  fromColumnKey: string;
  toColumnKey: string;
  fromSwimlaneKey?: string;
  swimlaneKey?: string;
}

export interface KanbanVirtualCardRange {
  start: number;
  end: number;
  topSpacerHeight: number;
  bottomSpacerHeight: number;
}

export interface KanbanProps
  extends DefaultProps<KanbanStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  columns: KanbanColumn[];
  /**
   * Renders one horizontal band per swimlane. Cards are assigned through
   * `getCardSwimlane`; cards without a (known) swimlane fall back to the first
   * declared lane so they are never hidden.
   */
  swimlanes?: KanbanSwimlane[];
  getCardSwimlane?(card: KanbanCard): string | undefined;
  /**
   * WIP limits keyed by column id. Overrides `KanbanColumn.limit`. With
   * swimlanes enabled the limit applies to each lane/column cell.
   */
  wipLimits?: Record<string, number>;
  onWipLimitExceeded?(columnKey: string, limit: number): void;
  /**
   * When `false`, moves into a full cell are allowed but
   * `onWipLimitExceeded` is still called. Defaults to `true`.
   */
  enforceWipLimit?: boolean;
  /**
   * Renders only the cards inside each column viewport. Requires a fixed
   * height per card (`cardHeight`, taller content is clipped) and a bounded
   * list viewport (`maxColumnHeight` or a CSS max-height on the list).
   */
  virtualizeCards?: boolean;
  /** Fixed card height, in pixels. Defaults to 120. */
  cardHeight?: number;
  /** Extra cards rendered above and below the viewport. Defaults to 3. */
  overscan?: number;
  /** Max height of each column list, in pixels. */
  maxColumnHeight?: number;
  onCardMove?(
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    toIndex: number,
    context?: KanbanMoveContext
  ): void;
  renderCard?(card: KanbanCard): React.ReactNode;
  /**
   * Enables inline card editing. Double click, Enter on a focused card or the
   * "Edit card" button open the editor; Escape cancels it.
   */
  editable?: boolean;
  /**
   * Called when an inline edit is saved. `next` is a new card object; the
   * original `card` is never mutated.
   */
  onCardEdit?(card: KanbanCard, next: KanbanCard): void;
  /**
   * Full replacement for the inline editor. `onSave` receives the complete
   * next card, `onCancel` closes the editor and restores focus.
   */
  renderCardEditor?(card: KanbanCard, helpers: KanbanCardEditorHelpers): React.ReactNode;
  /** Called with the updated checklist (new array, original untouched). */
  onChecklistChange?(card: KanbanCard, checklist: KanbanChecklistItem[]): void;
  /** Renders the `x/y` progress bar above the checklist. Defaults to `true`. */
  showChecklistProgress?: boolean;
  onLabelClick?(card: KanbanCard, label: KanbanLabel): void;
  onAssigneeClick?(card: KanbanCard, assignee: KanbanAssignee): void;
  ariaLabel?: string;
  columnAriaLabel?(column: KanbanColumn): string;
}

const defaultProps: Partial<KanbanProps> = {
  ariaLabel: 'Kanban board',
  enforceWipLimit: true,
  virtualizeCards: false,
  cardHeight: 120,
  overscan: 3,
  editable: false,
  showChecklistProgress: true
};

const CARD_SHORTCUTS =
  'Use Alt+ArrowLeft or Alt+ArrowRight to move between columns, ' +
  'Alt+ArrowUp or Alt+ArrowDown to reorder.';

const getCardShortcuts = (hasSwimlanes: boolean): string =>
  hasSwimlanes
    ? `${CARD_SHORTCUTS} Alt+Shift+ArrowUp or Alt+Shift+ArrowDown to move between swimlanes.`
    : CARD_SHORTCUTS;

const getColumnLabel = (
  column: KanbanColumn,
  columnAriaLabel?: (column: KanbanColumn) => string
): string => {
  if (typeof columnAriaLabel === 'function') {
    return columnAriaLabel(column);
  }

  return typeof column.title === 'string' ? column.title : column.id;
};

const getLaneLabel = (swimlane: KanbanSwimlane): string => {
  if (typeof swimlane.label === 'string') {
    return swimlane.label;
  }

  return typeof swimlane.label === 'number' ? String(swimlane.label) : swimlane.key;
};

const getCardText = (card: KanbanCard): string =>
  typeof card.title === 'string' ? card.title : card.id;

const getCountText = (count: number, limit?: number): string => {
  if (limit !== undefined) {
    return `${count} of ${limit} ${limit === 1 ? 'card' : 'cards'}`;
  }

  return `${count} ${count === 1 ? 'card' : 'cards'}`;
};

const sanitizeId = (value: string): string => value.replace(/[^a-zA-Z0-9_-]+/g, '-');

const toEditableText = (value: React.ReactNode): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const isInteractiveTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  Boolean(target.closest('input, textarea, select, button, a[href], [contenteditable="true"]'));

const getChecklistCounts = (
  checklist: KanbanChecklistItem[]
): { total: number; done: number; percent: number } => {
  const total = checklist.length;
  const done = checklist.reduce((count, item) => (item.done ? count + 1 : count), 0);

  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
};

/**
 * Computes the visible card window for a fixed-height list. `gap` is the
 * distance between cards (the Kanban virtualized gap is fixed at 8px).
 */
export function getVirtualCardRange(
  count: number,
  scrollTop: number,
  viewportHeight: number,
  cardHeight: number,
  gap = VIRTUAL_CARD_GAP,
  overscan = 3
): KanbanVirtualCardRange {
  if (count <= 0) {
    return { start: 0, end: 0, topSpacerHeight: 0, bottomSpacerHeight: 0 };
  }

  if (!(viewportHeight > 0)) {
    return { start: 0, end: count, topSpacerHeight: 0, bottomSpacerHeight: 0 };
  }

  const slotHeight = Math.max(1, cardHeight) + Math.max(0, gap);
  const overscanCount = Math.max(0, overscan);
  const safeScrollTop = Math.max(0, scrollTop);
  const visibleStart = Math.floor(safeScrollTop / slotHeight);
  const visibleEnd = Math.ceil((safeScrollTop + viewportHeight) / slotHeight);
  const start = Math.max(0, Math.min(visibleStart, count) - overscanCount);
  const end = Math.min(count, Math.max(start, visibleEnd + overscanCount));

  return {
    start,
    end,
    topSpacerHeight: start * slotHeight,
    bottomSpacerHeight: Math.max(0, (count - end) * slotHeight)
  };
}

const _Kanban = forwardRef<HTMLDivElement, KanbanProps>((props, ref) => {
  const {
    columns,
    swimlanes,
    getCardSwimlane,
    wipLimits,
    onWipLimitExceeded,
    enforceWipLimit,
    virtualizeCards,
    cardHeight,
    overscan,
    maxColumnHeight,
    onCardMove,
    renderCard,
    editable,
    onCardEdit,
    renderCardEditor,
    onChecklistChange,
    showChecklistProgress,
    onLabelClick,
    onAssigneeClick,
    ariaLabel,
    columnAriaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'kanban', classNames, styles, unstyled });
  const reactId = sanitizeId(useId()) || 'kanban';
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverCellKey, setDragOverCellKey] = useState<string | null>(null);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const [scrollTopByCell, setScrollTopByCell] = useState<Record<string, number>>({});
  const [viewportHeightByCell, setViewportHeightByCell] = useState<Record<string, number>>({});
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const viewportHeightRef = useRef<Record<string, number>>({});
  const listRefs = useRef<Record<string, HTMLUListElement | null>>({});
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);
  const lastEditingCardIdRef = useRef<string | null>(null);
  const draggedCardRef = useRef<{
    cardId: string;
    fromColumnId: string;
    fromLaneKey?: string;
  } | null>(null);

  const hasSwimlanes = Array.isArray(swimlanes) && swimlanes.length > 0;
  const cardHeightPx = Math.max(1, cardHeight || 120);
  const slotHeight = cardHeightPx + VIRTUAL_CARD_GAP;

  const resolveLaneKey = (card: KanbanCard): string | undefined => {
    if (!hasSwimlanes) {
      return undefined;
    }

    const requested = typeof getCardSwimlane === 'function' ? getCardSwimlane(card) : undefined;

    if (requested && swimlanes.some((swimlane) => swimlane.key === requested)) {
      return requested;
    }

    return swimlanes[0]?.key;
  };

  const getCellCards = (column: KanbanColumn, laneKey?: string): KanbanCard[] => {
    if (laneKey === undefined) {
      return column.cards;
    }

    return column.cards.filter((card) => resolveLaneKey(card) === laneKey);
  };

  const getCellLimit = (column: KanbanColumn): number | undefined => {
    const override = wipLimits?.[column.id];

    return override !== undefined ? override : column.limit;
  };

  const getCellKey = (columnId: string, laneKey?: string): string =>
    laneKey === undefined ? `column:${columnId}` : `lane:${laneKey}:column:${columnId}`;

  const findCardLocation = (
    cardId: string
  ): { card: KanbanCard; column: KanbanColumn; laneKey?: string } | null => {
    for (const column of columns) {
      const card = column.cards.find((item) => item.id === cardId);

      if (card) {
        return { card, column, laneKey: resolveLaneKey(card) };
      }
    }

    return null;
  };

  const commitMove = (
    cardId: string,
    fromColumn: KanbanColumn,
    fromLaneKey: string | undefined,
    toColumn: KanbanColumn,
    toLaneKey: string | undefined,
    requestedIndex: number
  ) => {
    const targetCards = getCellCards(toColumn, toLaneKey);
    const sameCell = fromColumn.id === toColumn.id && fromLaneKey === toLaneKey;
    const limit = getCellLimit(toColumn);
    const targetFull = limit !== undefined && targetCards.length >= limit;

    if (!sameCell && targetFull && limit !== undefined) {
      typeof onWipLimitExceeded === 'function' && onWipLimitExceeded(toColumn.id, limit);

      if (enforceWipLimit !== false) {
        return;
      }
    }

    if (typeof onCardMove !== 'function') {
      return;
    }

    const maxIndex = sameCell ? targetCards.length - 1 : targetCards.length;
    const nextIndex = Math.max(0, Math.min(requestedIndex, maxIndex));

    if (sameCell) {
      const currentIndex = targetCards.findIndex((card) => card.id === cardId);

      if (currentIndex === nextIndex) {
        return;
      }
    }

    if (hasSwimlanes) {
      onCardMove(cardId, fromColumn.id, toColumn.id, nextIndex, {
        fromColumnKey: fromColumn.id,
        toColumnKey: toColumn.id,
        fromSwimlaneKey: fromLaneKey,
        swimlaneKey: toLaneKey
      });
      return;
    }

    onCardMove(cardId, fromColumn.id, toColumn.id, nextIndex);
  };

  const resolveDraggedCard = (
    event: React.DragEvent<HTMLElement>
  ): { cardId: string; fromColumn: KanbanColumn; fromLaneKey?: string } | null => {
    const dataTransferCardId = event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
    const cardId = dataTransferCardId || draggedCardRef.current?.cardId || '';

    if (!cardId) {
      return null;
    }

    const location = findCardLocation(cardId);

    return location
      ? {
          cardId,
          fromColumn: location.column,
          fromLaneKey: location.laneKey
        }
      : null;
  };

  const resetDragState = () => {
    draggedCardRef.current = null;
    setDraggingCardId(null);
    setDragOverCellKey(null);
  };

  const handleCardDragStart = (
    event: React.DragEvent<HTMLLIElement>,
    card: KanbanCard,
    column: KanbanColumn,
    laneKey?: string
  ) => {
    draggedCardRef.current = { cardId: card.id, fromColumnId: column.id, fromLaneKey: laneKey };
    setDraggingCardId(card.id);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', card.id);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>, cellKey: string) => {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    if (dragOverCellKey !== cellKey) {
      setDragOverCellKey(cellKey);
    }
  };

  const handleDropOnCard = (
    event: React.DragEvent<HTMLLIElement>,
    targetColumn: KanbanColumn,
    targetLaneKey: string | undefined,
    targetIndex: number
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const dragged = resolveDraggedCard(event);
    resetDragState();

    if (!dragged) {
      return;
    }

    let toIndex = targetIndex;

    if (dragged.fromColumn.id === targetColumn.id && dragged.fromLaneKey === targetLaneKey) {
      const currentIndex = getCellCards(targetColumn, targetLaneKey).findIndex(
        (card) => card.id === dragged.cardId
      );

      if (currentIndex >= 0 && targetIndex > currentIndex) {
        toIndex = targetIndex - 1;
      }
    }

    commitMove(
      dragged.cardId,
      dragged.fromColumn,
      dragged.fromLaneKey,
      targetColumn,
      targetLaneKey,
      toIndex
    );
  };

  const handleDropOnCell = (
    event: React.DragEvent<HTMLUListElement>,
    column: KanbanColumn,
    laneKey?: string
  ) => {
    event.preventDefault();

    const dragged = resolveDraggedCard(event);
    resetDragState();

    if (!dragged) {
      return;
    }

    const cellCards = getCellCards(column, laneKey);
    const sameCell = dragged.fromColumn.id === column.id && dragged.fromLaneKey === laneKey;
    const toIndex = sameCell ? Math.max(0, cellCards.length - 1) : cellCards.length;

    commitMove(dragged.cardId, dragged.fromColumn, dragged.fromLaneKey, column, laneKey, toIndex);
  };

  const handleCardKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
    card: KanbanCard,
    column: KanbanColumn,
    laneKey: string | undefined,
    cardIndex: number
  ) => {
    // Keys pressed inside the inline editor (inputs, buttons) belong to it.
    if (isInteractiveTarget(event.target)) {
      return;
    }

    if (event.key === 'Enter' && !event.altKey && editable && editingCardId !== card.id) {
      event.preventDefault();
      openCardEditor(card);
      return;
    }

    if (!event.altKey) {
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const columnIndex = columns.findIndex((item) => item.id === column.id);
      const targetColumn = columns[columnIndex + (event.key === 'ArrowRight' ? 1 : -1)];

      if (!targetColumn) {
        return;
      }

      event.preventDefault();
      commitMove(
        card.id,
        column,
        laneKey,
        targetColumn,
        laneKey,
        getCellCards(targetColumn, laneKey).length
      );
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const direction = event.key === 'ArrowDown' ? 1 : -1;

      if (hasSwimlanes && event.shiftKey) {
        const laneIndex = swimlanes.findIndex((swimlane) => swimlane.key === laneKey);
        const targetSwimlane = swimlanes[laneIndex + direction];

        if (!targetSwimlane) {
          return;
        }

        event.preventDefault();
        commitMove(
          card.id,
          column,
          laneKey,
          column,
          targetSwimlane.key,
          getCellCards(column, targetSwimlane.key).length
        );
        return;
      }

      const cellCards = getCellCards(column, laneKey);
      const targetIndex = cardIndex + direction;

      if (targetIndex < 0 || targetIndex >= cellCards.length) {
        return;
      }

      event.preventDefault();
      commitMove(card.id, column, laneKey, column, laneKey, targetIndex);
    }
  };

  const openCardEditor = (card: KanbanCard) => {
    if (!editable || editingCardId === card.id) {
      return;
    }

    setDraftTitle(toEditableText(card.title));
    setDraftDescription(toEditableText(card.description));
    setEditingCardId(card.id);
  };

  const closeCardEditor = () => {
    lastEditingCardIdRef.current = editingCardId;
    restoreFocusRef.current = true;
    setEditingCardId(null);
  };

  const saveCardEdit = (card: KanbanCard, next: KanbanCard) => {
    lastEditingCardIdRef.current = card.id;
    restoreFocusRef.current = true;
    setEditingCardId(null);

    if (typeof onCardEdit === 'function') {
      onCardEdit(card, next);
    }
  };

  const saveDraft = (card: KanbanCard) => {
    const titleText = toEditableText(card.title);
    const descriptionText = toEditableText(card.description);
    const nextDescription =
      draftDescription === descriptionText
        ? card.description
        : draftDescription === ''
          ? undefined
          : draftDescription;

    saveCardEdit(card, {
      ...card,
      title: draftTitle === titleText ? card.title : draftTitle,
      description: nextDescription
    });
  };

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeCardEditor();
      return;
    }

    if (
      event.key === 'Enter' &&
      (event.ctrlKey || event.metaKey) &&
      typeof renderCardEditor !== 'function' &&
      editingCardId !== null
    ) {
      event.preventDefault();
      const card = findCardLocation(editingCardId)?.card;

      if (card) {
        saveDraft(card);
      }
    }
  };

  const toggleChecklistItem = (card: KanbanCard, itemId: string) => {
    if (!card.checklist || typeof onChecklistChange !== 'function') {
      return;
    }

    onChecklistChange(
      card,
      card.checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item))
    );
  };

  useEffect(() => {
    if (editingCardId !== null) {
      const container = editorContainerRef.current;

      if (!container) {
        return;
      }

      const focusTarget =
        container.querySelector<HTMLElement>(
          'input, textarea, select, button, a[href], [contenteditable="true"]'
        ) ?? container;

      focusTarget.focus();
      return;
    }

    if (restoreFocusRef.current) {
      restoreFocusRef.current = false;
      const cardId = lastEditingCardIdRef.current;

      if (cardId) {
        cardRefs.current[cardId]?.focus();
      }
    }
  }, [editingCardId]);

  const handleCellScroll = (cellKey: string, event: React.UIEvent<HTMLUListElement>) => {
    const nextScrollTop = event.currentTarget.scrollTop;

    setScrollTopByCell((current) =>
      current[cellKey] === nextScrollTop ? current : { ...current, [cellKey]: nextScrollTop }
    );
  };

  const cellSignature = `${hasSwimlanes ? swimlanes.map((lane) => lane.key).join('|') : ''}#${columns
    .map((column) => column.id)
    .join('|')}`;

  useEffect(() => {
    if (!virtualizeCards) {
      return undefined;
    }

    const measure = () => {
      const next: Record<string, number> = {};
      let changed = false;

      Object.keys(listRefs.current).forEach((key) => {
        const element = listRefs.current[key];
        const height = element ? element.clientHeight : 0;

        next[key] = height;

        if (viewportHeightRef.current[key] !== height) {
          changed = true;
        }
      });

      if (changed) {
        viewportHeightRef.current = next;
        setViewportHeightByCell(next);
      }
    };

    measure();
    window.addEventListener('resize', measure);

    let observer: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      Object.keys(listRefs.current).forEach((key) => {
        const element = listRefs.current[key];

        if (element) {
          observer?.observe(element);
        }
      });
    }

    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [virtualizeCards, cellSignature]);

  const setListRef = (cellKey: string) => (element: HTMLUListElement | null) => {
    if (element) {
      listRefs.current[cellKey] = element;
      return;
    }

    delete listRefs.current[cellKey];
  };

  const renderLabel = (card: KanbanCard, label: KanbanLabel) => {
    const content = (
      <>
        {label.color && (
          <span
            className={cx(classes.cardLabelDot)}
            style={{ backgroundColor: label.color }}
            aria-hidden="true"
          />
        )}
        {label.label}
      </>
    );

    if (typeof onLabelClick === 'function') {
      return (
        <button
          key={label.id}
          type="button"
          className={cx(classes.cardLabel, classes.cardLabelButton)}
          aria-label={`Label ${label.label}`}
          onClick={() => onLabelClick(card, label)}
        >
          {content}
        </button>
      );
    }

    return (
      <span
        key={label.id}
        className={cx(classes.cardLabel)}
        aria-label={`Label ${label.label}`}
        title={label.label}
      >
        {content}
      </span>
    );
  };

  const renderAssignee = (card: KanbanCard, assignee: KanbanAssignee) => {
    const content = assignee.avatar ? (
      <img className={cx(classes.cardAssigneeImage)} src={assignee.avatar} alt="" />
    ) : (
      <span aria-hidden="true">{getInitials(assignee.name)}</span>
    );

    if (typeof onAssigneeClick === 'function') {
      return (
        <button
          key={assignee.id}
          type="button"
          className={cx(classes.cardAssignee)}
          aria-label={`Assignee ${assignee.name}`}
          title={assignee.name}
          onClick={() => onAssigneeClick(card, assignee)}
        >
          {content}
        </button>
      );
    }

    return (
      <span
        key={assignee.id}
        role="img"
        className={cx(classes.cardAssignee)}
        aria-label={`Assignee ${assignee.name}`}
        title={assignee.name}
      >
        {content}
      </span>
    );
  };

  const renderChecklist = (card: KanbanCard, checklist: KanbanChecklistItem[]) => {
    const { total, done, percent } = getChecklistCounts(checklist);

    return (
      <div className={cx(classes.checklist)} role="group" aria-label="Checklist">
        {showChecklistProgress !== false && (
          <div className={cx(classes.checklistProgress)}>
            <span className={cx(classes.checklistProgressValue)}>
              {done}/{total}
            </span>
            <ProgressBar
              className={cx(classes.checklistProgressBar)}
              value={percent}
              status="primary"
              size="tiny"
              role="progressbar"
              aria-label={`Checklist progress: ${getCardText(card)}`}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={done}
              aria-valuetext={`${done} of ${total} complete`}
            />
          </div>
        )}
        {checklist.map((item) => (
          <label key={item.id} className={cx(classes.checklistItem)}>
            <input
              type="checkbox"
              className={cx(classes.checklistCheckbox)}
              checked={item.done}
              aria-label={`Toggle ${item.label}`}
              onChange={() => toggleChecklistItem(card, item.id)}
            />
            <span
              className={cx(classes.checklistItemLabel, {
                [classes.checklistItemLabelDone]: item.done
              })}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
    );
  };

  const renderDefaultCard = (card: KanbanCard) => (
    <>
      <span className={cx(classes.cardTitle)}>{card.title}</span>
      {card.description != null && (
        <span className={cx(classes.cardDescription)}>{card.description}</span>
      )}
      {card.labels && card.labels.length > 0 && (
        <div className={cx(classes.cardLabels)} role="group" aria-label="Labels">
          {card.labels.map((label) => renderLabel(card, label))}
        </div>
      )}
      {card.assignees && card.assignees.length > 0 && (
        <div className={cx(classes.cardAssignees)} role="group" aria-label="Assignees">
          {card.assignees.map((assignee) => renderAssignee(card, assignee))}
        </div>
      )}
      {card.checklist && card.checklist.length > 0 && renderChecklist(card, card.checklist)}
      {card.tags && card.tags.length > 0 && (
        <span className={cx(classes.cardTags)}>
          {card.tags.map((tag, index) => (
            <span key={index} className={cx(classes.cardTag)}>
              {tag}
            </span>
          ))}
        </span>
      )}
    </>
  );

  const renderDefaultCardEditor = (card: KanbanCard) => (
    <>
      <input
        className={cx(classes.editorInput)}
        aria-label="Card title"
        value={draftTitle}
        onChange={(event) => setDraftTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            saveDraft(card);
          }
        }}
      />
      <textarea
        className={cx(classes.editorTextarea)}
        aria-label="Card description"
        rows={2}
        value={draftDescription}
        onChange={(event) => setDraftDescription(event.target.value)}
      />
      <div className={cx(classes.editorActions)}>
        <button
          type="button"
          className={cx(classes.editorButton, classes.editorSave)}
          aria-label="Save card"
          onClick={() => saveDraft(card)}
        >
          Save
        </button>
        <button
          type="button"
          className={cx(classes.editorButton)}
          aria-label="Cancel editing"
          onClick={closeCardEditor}
        >
          Cancel
        </button>
      </div>
    </>
  );

  const renderInlineEditor = (card: KanbanCard) => (
    <div
      ref={editorContainerRef}
      className={cx(classes.cardEditor)}
      role="group"
      aria-label={`Edit ${getCardText(card)}`}
      tabIndex={-1}
      onKeyDown={handleEditorKeyDown}
    >
      {typeof renderCardEditor === 'function'
        ? renderCardEditor(card, {
            onSave: (next) => saveCardEdit(card, next),
            onCancel: closeCardEditor
          })
        : renderDefaultCardEditor(card)}
    </div>
  );

  const renderCell = (column: KanbanColumn, laneKey?: string) => {
    const columnLabel = getColumnLabel(column, columnAriaLabel);
    const lane = hasSwimlanes ? swimlanes.find((item) => item.key === laneKey) : undefined;
    const laneLabel = lane ? getLaneLabel(lane) : undefined;
    const cellLabel = laneLabel ? `${columnLabel}, ${laneLabel}` : columnLabel;
    const cellCards = getCellCards(column, laneKey);
    const limit = getCellLimit(column);
    const isFull = limit !== undefined && cellCards.length >= limit;
    const cellKey = getCellKey(column.id, laneKey);
    const countDescriptionId = `${reactId}-${sanitizeId(cellKey)}-count`;
    const wipDescriptionId = `${reactId}-${sanitizeId(cellKey)}-wip`;
    const countText = getCountText(cellCards.length, limit);
    const wipDescription =
      limit === undefined
        ? countText
        : `${countText}. ${isFull ? 'WIP limit reached.' : 'WIP limit not reached.'}`;
    const describedById = limit === undefined ? countDescriptionId : wipDescriptionId;

    const scrollTop = scrollTopByCell[cellKey] ?? 0;
    const measuredHeight = viewportHeightByCell[cellKey] ?? 0;
    const fallbackHeight =
      typeof maxColumnHeight === 'number' && maxColumnHeight > 0 ? maxColumnHeight : 0;
    const viewportHeight = measuredHeight > 0 ? measuredHeight : fallbackHeight;
    const isVirtualized = Boolean(virtualizeCards) && viewportHeight > 0;
    const range = isVirtualized
      ? getVirtualCardRange(
          cellCards.length,
          scrollTop,
          viewportHeight,
          cardHeightPx,
          VIRTUAL_CARD_GAP,
          overscan
        )
      : { start: 0, end: cellCards.length, topSpacerHeight: 0, bottomSpacerHeight: 0 };

    let { start, end } = range;

    if (isVirtualized) {
      const pinCard = (cardId: string | null) => {
        if (!cardId) {
          return;
        }

        const index = cellCards.findIndex((card) => card.id === cardId);

        if (index >= 0) {
          start = Math.min(start, index);
          end = Math.max(end, index + 1);
        }
      };

      // Keep the focused/dragged card mounted so virtualization never steals
      // keyboard focus or cancels an in-progress drag.
      pinCard(focusedCardId);
      pinCard(draggingCardId);
      pinCard(editingCardId);
    }

    const visibleCards = isVirtualized ? cellCards.slice(start, end) : cellCards;
    const topSpacerHeight = isVirtualized ? start * slotHeight : 0;
    const bottomSpacerHeight = isVirtualized
      ? Math.max(0, (cellCards.length - end) * slotHeight)
      : 0;
    const listStyle =
      Boolean(virtualizeCards) && typeof maxColumnHeight === 'number' && maxColumnHeight > 0
        ? { maxHeight: maxColumnHeight }
        : undefined;
    const TitleTag = hasSwimlanes && laneKey !== undefined ? 'h4' : 'h3';

    return (
      <section
        key={cellKey}
        aria-label={cellLabel}
        data-wip-full={isFull ? 'true' : 'false'}
        data-wip-limit={limit}
        className={cx(classes.column, { [classes.columnFull]: isFull })}
      >
        <header className={cx(classes.header)}>
          <TitleTag className={cx(classes.title)}>{column.title}</TitleTag>
          <span className={cx(classes.count)} aria-hidden="true">
            {cellCards.length}
            {limit !== undefined ? ` / ${limit}` : ''}
          </span>
          <span id={countDescriptionId} className={cx(classes.visuallyHidden)}>
            {countText}
          </span>
          {limit !== undefined && (
            <span id={wipDescriptionId} className={cx(classes.visuallyHidden)}>
              {wipDescription}
            </span>
          )}
        </header>
        <ul
          ref={setListRef(cellKey)}
          aria-describedby={describedById}
          data-kanban-cell={cellKey}
          className={cx(classes.list, {
            [classes.listOver]: dragOverCellKey === cellKey,
            [classes.listVirtual]: Boolean(virtualizeCards)
          })}
          style={listStyle}
          onDragOver={(event) => handleDragOver(event, cellKey)}
          onDragLeave={() => setDragOverCellKey(null)}
          onDrop={(event) => handleDropOnCell(event, column, laneKey)}
          onScroll={virtualizeCards ? (event) => handleCellScroll(cellKey, event) : undefined}
        >
          {topSpacerHeight > 0 && (
            <li
              aria-hidden="true"
              className={cx(classes.spacer)}
              style={{ height: topSpacerHeight }}
              data-kanban-spacer="top"
            />
          )}
          {visibleCards.map((card, offset) => {
            const cardIndex = isVirtualized ? start + offset : offset;
            const isEditing = editingCardId === card.id;

            return (
              <li
                key={card.id}
                ref={(element) => {
                  if (element) {
                    cardRefs.current[card.id] = element;
                  } else {
                    delete cardRefs.current[card.id];
                  }
                }}
                draggable={!isEditing}
                // A focusable card is the pattern that enables keyboard drag and drop.
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={0}
                aria-label={`${getCardText(card)}. ${getCardShortcuts(hasSwimlanes)}`}
                aria-posinset={isVirtualized ? cardIndex + 1 : undefined}
                aria-setsize={isVirtualized ? cellCards.length : undefined}
                className={cx(classes.card, {
                  [classes.cardDragging]: draggingCardId === card.id,
                  [classes.virtualCard]: isVirtualized
                })}
                style={
                  isVirtualized
                    ? { height: cardHeightPx, marginBottom: VIRTUAL_CARD_GAP }
                    : undefined
                }
                onFocus={() => setFocusedCardId(card.id)}
                onBlur={() => setFocusedCardId(null)}
                onDoubleClick={editable ? () => openCardEditor(card) : undefined}
                onDragStart={(event) => handleCardDragStart(event, card, column, laneKey)}
                onDragEnd={resetDragState}
                onDragOver={(event) => handleDragOver(event, cellKey)}
                onDrop={(event) => handleDropOnCard(event, column, laneKey, cardIndex)}
                onKeyDown={(event) => handleCardKeyDown(event, card, column, laneKey, cardIndex)}
              >
                {isEditing ? (
                  renderInlineEditor(card)
                ) : (
                  <>
                    {typeof renderCard === 'function' ? renderCard(card) : renderDefaultCard(card)}
                    {editable && (
                      <div className={cx(classes.cardActions)}>
                        <button
                          type="button"
                          className={cx(classes.editButton)}
                          aria-label={`Edit card: ${getCardText(card)}`}
                          onClick={() => openCardEditor(card)}
                        >
                          Edit card
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
          {cellCards.length === 0 && (
            <li className={cx(classes.empty)} aria-hidden="true">
              No cards
            </li>
          )}
          {bottomSpacerHeight > 0 && (
            <li
              aria-hidden="true"
              className={cx(classes.spacer)}
              style={{ height: bottomSpacerHeight }}
              data-kanban-spacer="bottom"
            />
          )}
        </ul>
      </section>
    );
  };

  return (
    <div
      {...others}
      ref={ref}
      role="region"
      aria-label={ariaLabel}
      data-kanban-swimlanes={hasSwimlanes ? 'true' : undefined}
      className={cx(classes.root, { [classes.rootSwimlanes]: hasSwimlanes }, className)}
    >
      {hasSwimlanes
        ? swimlanes.map((swimlane) => (
            <section
              key={swimlane.key}
              aria-label={`${getLaneLabel(swimlane)} swimlane`}
              className={cx(classes.swimlane)}
            >
              <header className={cx(classes.swimlaneHeader)}>
                <h3 className={cx(classes.swimlaneTitle)}>{swimlane.label}</h3>
              </header>
              <div className={cx(classes.swimlaneColumns)}>
                {columns.map((column) => renderCell(column, swimlane.key))}
              </div>
            </section>
          ))
        : columns.map((column) => renderCell(column))}
    </div>
  );
});

_Kanban.displayName = 'Kanban';

export const Kanban = _Kanban;
