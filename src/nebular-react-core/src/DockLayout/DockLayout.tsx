import React, {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  useSyncExternalStore
} from 'react';
import { createPortal } from 'react-dom';
import { useUncontrolled } from '@mantine/hooks';
import { useIsomorphicEffect } from '@nebular-react/hooks';
import { DefaultProps, Selectors, createStyles, useNebularDir } from '@nebular-react/styles';
import { Button } from '../Button';
import { NativeSelect } from '../NativeSelect';
import { SplitPane, SplitPaneOrientation } from '../SplitPane';

export interface DockLayoutGroup {
  type: 'group';
  id: string;
  label?: string;
  panelIds: readonly string[];
  activePanelId?: string;
}

export interface DockLayoutSplit {
  type: 'split';
  id: string;
  orientation: SplitPaneOrientation;
  /** Percentage occupied by the first child. */
  size?: number;
  first: DockLayoutNode;
  second: DockLayoutNode;
}

export type DockLayoutNode = DockLayoutGroup | DockLayoutSplit;

export interface DockLayoutPanel {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface DockLayoutLabels {
  region: string;
  group: (position: number) => string;
  resize: string;
  moveTo: string;
  movePanel: string;
  chooseGroup: string;
  empty: string;
}

export interface DockLayoutProps
  extends DefaultProps<DockLayoutStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  /** Each node ID and each panel placement must be unique within the layout. */
  layout?: DockLayoutNode;
  defaultLayout?: DockLayoutNode;
  panels: readonly DockLayoutPanel[];
  onLayoutChange?: (layout: DockLayoutNode) => void;
  readOnly?: boolean;
  labels?: Partial<DockLayoutLabels>;
}

const defaultLabels: DockLayoutLabels = {
  region: 'Dock layout',
  group: (position) => `Group ${position}`,
  resize: 'Resize panels',
  moveTo: 'Move to group',
  movePanel: 'Move active panel',
  chooseGroup: 'Choose a group',
  empty: 'No panels in this group.'
};

const useStyles = createStyles(() => ({
  root: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    color: 'var(--text-basic-color, #222b45)'
  },
  group: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    backgroundColor: 'var(--background-basic-color-1, #fff)',
    '&[data-drop-target="true"]': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-2px'
    }
  },
  header: {
    display: 'grid',
    minWidth: 0,
    backgroundColor: 'var(--background-basic-color-2, #f7f9fc)',
    borderBlockEnd: '1px solid var(--border-basic-color-3, #e4e9f2)'
  },
  name: {
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem'
  },
  tabs: {
    display: 'flex',
    minWidth: 0,
    overflowX: 'auto',
    gap: '0.25rem',
    paddingInline: '0.5rem'
  },
  tab: {
    appearance: 'none',
    background: 'transparent',
    border: 'none',
    borderBlockEnd: '2px solid transparent',
    padding: '0.5rem',
    flex: '0 0 auto',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    '&[aria-selected="true"]': {
      borderBlockEndColor: 'var(--color-primary-500, #3366ff)',
      fontWeight: 600
    },
    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-2px'
    }
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem'
  },
  destination: { flex: '1 1 8rem', minWidth: 0 },
  panel: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: 'auto'
  },
  empty: { padding: '0.75rem' }
}));

export type DockLayoutStylesNames = Selectors<typeof useStyles>;

type GroupLabel = { id: string; label: string };
type PanelMove = { panelId: string; groupId: string };
type MoveFocus = PanelMove & { previous: Element | null };

interface DockTreeProps {
  classes: Record<DockLayoutStylesNames, string>;
  groups: GroupLabel[];
  labels: DockLayoutLabels;
  panels: ReadonlyMap<string, DockLayoutPanel>;
  tabRefs: Map<string, HTMLButtonElement>;
  registerFrame(id: string, node: HTMLDivElement | null): void;
  selectTab(groupId: string, panelId: string): void;
  resizeSplit(splitId: string, size: number): void;
  moveTab(from: PanelMove, to: string, previous?: Element): void;
  dragging: React.RefObject<PanelMove | null>;
  dropTarget: string | undefined;
  clearDrag(): void;
  hydrated: boolean;
  readOnly: boolean;
  direction: string;
}

function getGroups(node: DockLayoutNode): DockLayoutGroup[] {
  return node.type === 'group' ? [node] : [...getGroups(node.first), ...getGroups(node.second)];
}

function changeNode(
  node: DockLayoutNode,
  update: (node: DockLayoutNode) => DockLayoutNode
): DockLayoutNode {
  const next = update(node);
  if (next !== node || node.type === 'group') return next;

  const first = changeNode(node.first, update);
  const second = changeNode(node.second, update);
  return first === node.first && second === node.second ? node : { ...node, first, second };
}

function getDropGroup(target: EventTarget | null, root: HTMLElement) {
  if (!(target instanceof Element) || target.closest('[data-nebular-dock-layout]') !== root) {
    return undefined;
  }
  return target.closest<HTMLElement>('[data-nebular-dock-group]')?.dataset.nebularDockGroup;
}

const subscribeToHydration = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface PanelContentProps {
  panel: DockLayoutPanel;
  layout: DockLayoutNode;
  getFrame(id: string): HTMLDivElement | undefined;
}

function PanelContent({ panel, layout, getFrame }: PanelContentProps) {
  const [host, setHost] = useState<HTMLDivElement>();

  useIsomorphicEffect(() => {
    const frame = getFrame(panel.id);
    if (!frame) return;

    // The portal container follows the tab while the React subtree keeps its identity.
    const container = host ?? frame.ownerDocument.createElement('div');
    if (container.parentNode !== frame) frame.appendChild(container);
    if (!host) setHost(container);
  }, [panel.id, layout, getFrame, host]);

  useIsomorphicEffect(() => () => host?.remove(), [host]);
  return host ? createPortal(panel.content, host) : null;
}

interface DockPanelFrameProps {
  panel: DockLayoutPanel;
  domId: string;
  active: boolean;
  tree: DockTreeProps;
}

function DockPanelFrame({ panel, domId, active, tree }: DockPanelFrameProps) {
  const { registerFrame } = tree;
  const ref = useCallback(
    (node: HTMLDivElement | null) => registerFrame(panel.id, node),
    [panel.id, registerFrame]
  );
  return (
    <div
      ref={ref}
      id={`${domId}-panel`}
      className={tree.classes.panel}
      role="tabpanel"
      aria-labelledby={`${domId}-tab`}
      hidden={!active}
      tabIndex={active ? 0 : undefined}
    >
      {!tree.hydrated && panel.content}
    </div>
  );
}

function DockGroup({ group, tree }: { group: DockLayoutGroup; tree: DockTreeProps }) {
  const {
    classes,
    labels,
    panels,
    groups,
    tabRefs,
    selectTab,
    moveTab,
    dragging,
    dropTarget,
    clearDrag,
    readOnly,
    direction
  } = tree;
  const id = useId();
  const [destination, setDestination] = useState('');
  const name = groups.find((item) => item.id === group.id)?.label;
  const targets = groups.filter((item) => item.id !== group.id);
  const targetId = targets.some((target) => target.id === destination) ? destination : '';
  const items = group.panelIds.flatMap((panelId) => {
    const panel = panels.get(panelId);
    return panel ? [panel] : [];
  });
  const active = items.find((panel) => panel.id === group.activePanelId) ?? items[0];

  const navigate = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    let target = index;
    if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = items.length - 1;
    else if (event.key === 'ArrowRight') target += direction === 'rtl' ? -1 : 1;
    else if (event.key === 'ArrowLeft') target += direction === 'rtl' ? 1 : -1;
    else return;

    event.preventDefault();
    const next = items[(target + items.length) % items.length];
    tabRefs.get(next.id)?.focus();
    if (next.id !== active?.id) selectTab(group.id, next.id);
  };

  return (
    <div
      role="group"
      aria-label={name}
      className={classes.group}
      data-nebular-dock-group={group.id}
      data-drop-target={dropTarget === group.id || undefined}
    >
      <div className={classes.header}>
        <span className={classes.name}>{name}</span>
        {items.length > 0 && (
          <div role="tablist" aria-label={name} className={classes.tabs}>
            {items.map((panel, index) => (
              <button
                key={panel.id}
                ref={(button) => {
                  if (button) tabRefs.set(panel.id, button);
                  else tabRefs.delete(panel.id);
                }}
                id={`${id}-${index}-tab`}
                type="button"
                role="tab"
                aria-selected={panel.id === active?.id}
                aria-controls={`${id}-${index}-panel`}
                tabIndex={panel.id === active?.id ? 0 : -1}
                className={classes.tab}
                draggable={!readOnly && targets.length > 0}
                onClick={() => {
                  if (panel.id !== active?.id) selectTab(group.id, panel.id);
                }}
                onKeyDown={(event) => navigate(event, index)}
                onDragStart={(event) => {
                  if (readOnly || targets.length === 0) return;
                  event.dataTransfer.setData('application/x-nebular-dock-panel', panel.id);
                  event.dataTransfer.effectAllowed = 'move';
                  dragging.current = { panelId: panel.id, groupId: group.id };
                }}
                onDragEnd={clearDrag}
              >
                {panel.title}
              </button>
            ))}
          </div>
        )}
        {!readOnly && active && targets.length > 0 && (
          <div className={classes.controls}>
            <NativeSelect
              className={classes.destination}
              ariaLabel={labels.moveTo}
              placeholder={labels.chooseGroup}
              data={targets.map((target) => ({ value: target.id, label: target.label }))}
              size="sm"
              value={targetId}
              onChange={setDestination}
            />
            <Button
              type="button"
              size="small"
              appearance="outline"
              disabled={!targetId}
              onClick={(event) => {
                moveTab({ panelId: active.id, groupId: group.id }, targetId, event.currentTarget);
                setDestination('');
              }}
            >
              {labels.movePanel}
            </Button>
          </div>
        )}
      </div>
      {items.map((panel, index) => (
        <DockPanelFrame
          key={panel.id}
          panel={panel}
          active={panel.id === active?.id}
          domId={`${id}-${index}`}
          tree={tree}
        />
      ))}
      {!active && <div className={classes.empty}>{labels.empty}</div>}
    </div>
  );
}

function DockTree({ node, tree }: { node: DockLayoutNode; tree: DockTreeProps }) {
  if (node.type === 'group') return <DockGroup group={node} tree={tree} />;

  return (
    <SplitPane
      orientation={node.orientation}
      size={Number.isFinite(node.size) ? node.size : 50}
      disabled={tree.readOnly}
      separatorLabel={tree.labels.resize}
      onSizeChange={(size) => tree.resizeSplit(node.id, size)}
    >
      <DockTree key={node.first.id} node={node.first} tree={tree} />
      <DockTree key={node.second.id} node={node.second} tree={tree} />
    </SplitPane>
  );
}

export const DockLayout = forwardRef<HTMLDivElement, DockLayoutProps>((props, ref) => {
  const {
    layout: controlledLayout,
    defaultLayout,
    panels,
    onLayoutChange,
    readOnly = false,
    labels: labelOverrides,
    className,
    classNames,
    styles,
    unstyled,
    dir,
    onDragOver,
    onDragLeave,
    onDrop,
    ...others
  } = props;
  const labels = { ...defaultLabels, ...labelOverrides };
  const { classes, cx } = useStyles(null, { name: 'dock-layout', classNames, styles, unstyled });
  const themeDirection = useNebularDir();
  const hydrated = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const [layout, setLayout] = useUncontrolled<DockLayoutNode>({
    value: controlledLayout,
    defaultValue: defaultLayout,
    finalValue: { type: 'group', id: 'main', panelIds: panels.map((panel) => panel.id) },
    onChange: onLayoutChange
  });
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const frames = useRef(new Map<string, HTMLDivElement>());
  const dragging = useRef<PanelMove | null>(null);
  const pendingFocus = useRef<MoveFocus | null>(null);
  const [dropTarget, setDropTarget] = useState<string>();
  const groups = getGroups(layout);
  const panelMap = new Map(panels.map((panel) => [panel.id, panel]));
  const placed = new Set(groups.flatMap((group) => group.panelIds));
  const disabled = readOnly || (controlledLayout !== undefined && !onLayoutChange);
  const clearDrag = () => {
    dragging.current = null;
    setDropTarget(undefined);
  };

  const registerFrame = useCallback((panelId: string, node: HTMLDivElement | null) => {
    if (node) frames.current.set(panelId, node);
    else frames.current.delete(panelId);
  }, []);
  const getFrame = useCallback((panelId: string) => frames.current.get(panelId), []);

  useIsomorphicEffect(() => {
    const pending = pendingFocus.current;
    if (
      !pending ||
      !groups.some(
        (group) => group.id === pending.groupId && group.activePanelId === pending.panelId
      )
    )
      return;

    pendingFocus.current = null;
    const button = tabRefs.current.get(pending.panelId);
    const current = button?.ownerDocument.activeElement;
    if (button && (current === pending.previous || current === button.ownerDocument.body)) {
      button.focus();
    }
  }, [groups]);

  const emit = (next: DockLayoutNode) => {
    if (next !== layout) setLayout(next);
  };
  const moveTab = (from: PanelMove, to: string, previous?: Element) => {
    if (disabled || from.groupId === to || !panelMap.has(from.panelId)) return;
    const source = groups.find((group) => group.id === from.groupId);
    const target = groups.find((group) => group.id === to);
    if (
      !source ||
      !target ||
      !source.panelIds.includes(from.panelId) ||
      target.panelIds.includes(from.panelId)
    )
      return;

    if (previous) pendingFocus.current = { panelId: from.panelId, groupId: to, previous };
    emit(
      changeNode(layout, (node) => {
        if (node.type !== 'group') return node;
        if (node.id === to) {
          return {
            ...node,
            panelIds: [...node.panelIds, from.panelId],
            activePanelId: from.panelId
          };
        }
        if (node.id !== from.groupId) return node;

        const visible = node.panelIds.filter((panelId) => panelMap.has(panelId));
        const active = visible.find((panelId) => panelId === node.activePanelId) ?? visible[0];
        const panelIds = node.panelIds.filter((panelId) => panelId !== from.panelId);
        const remaining = visible.filter((panelId) => panelId !== from.panelId);
        const removeIndex = visible.indexOf(from.panelId);
        const nextActive =
          active === from.panelId ? remaining[Math.min(removeIndex, remaining.length - 1)] : active;
        const { activePanelId: _, ...group } = node;
        return nextActive === undefined
          ? { ...group, panelIds }
          : {
              ...group,
              panelIds,
              activePanelId: nextActive
            };
      })
    );
  };
  const tree: DockTreeProps = {
    classes,
    labels,
    panels: panelMap,
    tabRefs: tabRefs.current,
    registerFrame,
    hydrated,
    groups: groups.map((group, index) => ({
      id: group.id,
      label: group.label ?? labels.group(index + 1)
    })),
    readOnly: disabled,
    direction: dir ?? themeDirection,
    dragging,
    dropTarget,
    clearDrag,
    moveTab,
    selectTab(groupId, panelId) {
      emit(
        changeNode(layout, (node) =>
          node.type === 'group' && node.id === groupId ? { ...node, activePanelId: panelId } : node
        )
      );
    },
    resizeSplit(splitId, size) {
      if (disabled) return;
      emit(
        changeNode(layout, (node) =>
          node.type === 'split' && node.id === splitId ? { ...node, size } : node
        )
      );
    }
  };

  return (
    <div
      role="region"
      aria-label={labels.region}
      {...others}
      dir={dir}
      ref={ref}
      className={cx(classes.root, className)}
      data-nebular-dock-layout=""
      onDragOver={(event) => {
        onDragOver?.(event);
        if (event.defaultPrevented || disabled || !dragging.current) return;
        const target = getDropGroup(event.target, event.currentTarget);
        if (!target || target === dragging.current.groupId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDropTarget(target);
      }}
      onDragLeave={(event) => {
        onDragLeave?.(event);
        const leaving = getDropGroup(event.target, event.currentTarget);
        const entering = getDropGroup(event.relatedTarget, event.currentTarget);
        if (leaving !== entering) {
          setDropTarget((current) => (current === leaving ? undefined : current));
        }
      }}
      onDrop={(event) => {
        onDrop?.(event);
        const source = dragging.current;
        const target = getDropGroup(event.target, event.currentTarget);
        if (event.defaultPrevented || disabled || !source || !target || source.groupId === target) {
          return;
        }
        event.preventDefault();
        clearDrag();
        moveTab(source, target);
      }}
    >
      <DockTree key={layout.id} node={layout} tree={tree} />
      {hydrated &&
        panels
          .filter((panel) => placed.has(panel.id))
          .map((panel) => (
            <PanelContent key={panel.id} panel={panel} layout={layout} getFrame={getFrame} />
          ))}
    </div>
  );
});

DockLayout.displayName = 'DockLayout';
