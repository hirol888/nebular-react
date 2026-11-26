import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { WorkflowDesigner, WorkflowEdge, WorkflowNode } from '@nebular-react/core';

// jsdom does not implement PointerEvent, so the drag helpers fall back to MouseEvent, which
// exposes the `clientX`/`clientY`/`button` surface used by the component.
beforeAll(() => {
  if (typeof window.PointerEvent === 'undefined') {
    Object.defineProperty(window, 'PointerEvent', {
      configurable: true,
      writable: true,
      value: window.MouseEvent
    });
  }
});

const nodes: WorkflowNode[] = [
  { id: 'start', label: 'Start', x: 0, y: 0 },
  { id: 'review', label: 'Review', x: 160, y: 0 },
  { id: 'done', label: 'Done', x: 320, y: 0 }
];

const edges: WorkflowEdge[] = [
  { id: 'start-review', from: 'start', to: 'review', label: 'submit' },
  { id: 'review-done', from: 'review', to: 'done' }
];

describe('WorkflowDesigner', () => {
  it('announces a rejected connection and lets a keyboard user retry', async () => {
    const user = userEvent.setup();
    const onConnect = jest.fn();
    render(
      <WorkflowDesigner
        nodes={nodes}
        defaultSelectedNodeId="start"
        onConnect={onConnect}
        validateConnection={({ target }) => target.id !== 'done' || 'Start requires review.'}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Connect to…' }));
    screen.getByRole('button', { name: 'Done' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Start requires review.');
    expect(onConnect).not.toHaveBeenCalled();
    screen.getByRole('button', { name: 'Review' }).focus();
    await user.keyboard('{Enter}');
    expect(onConnect).toHaveBeenCalledWith('start', 'review');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('applies node properties and restores a connection with one history step per change', async () => {
    const user = userEvent.setup();
    function Example() {
      const [graph, setGraph] = React.useState({ nodes, edges: [] as WorkflowEdge[] });
      return (
        <WorkflowDesigner
          {...graph}
          editable
          withHistory
          defaultSelectedNodeId="start"
          onGraphChange={setGraph}
          renderNodeProperties={({ node, onChange }) => (
            <button type="button" onClick={() => onChange({ label: 'Draft' })}>
              Rename {node.id}
            </button>
          )}
        />
      );
    }
    const { container } = render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Rename start' }));
    expect(screen.getByRole('button', { name: 'Draft' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Connect to…' }));
    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(container.querySelector('[data-workflow-edge-from="start"]')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(container.querySelector('[data-workflow-edge-from="start"]')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Draft' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Redo' }));
    expect(container.querySelector('[data-workflow-edge-from="start"]')).toBeInTheDocument();
  });

  it('coalesces pointer moves and only enables history once the caller accepts the graph', async () => {
    const user = userEvent.setup();
    const onGraphChange = jest.fn();
    const { rerender } = render(
      <WorkflowDesigner
        nodes={nodes}
        edges={edges}
        editable
        withHistory
        onGraphChange={onGraphChange}
      />
    );
    const start = screen.getByRole('button', { name: 'Start' });
    fireEvent.pointerDown(start, { clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerMove(start, { clientX: 15, clientY: 0 });
    fireEvent.pointerMove(start, { clientX: 38, clientY: 0 });
    expect(onGraphChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(start, { clientX: 38, clientY: 0 });
    expect(onGraphChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    expect(start).toHaveStyle({ left: '0px' });

    rerender(
      <WorkflowDesigner
        {...onGraphChange.mock.lastCall?.[0]}
        editable
        withHistory
        onGraphChange={onGraphChange}
      />
    );
    expect(start).toHaveStyle({ left: '40px' });
    start.focus();
    await user.keyboard('{Control>}z{/Control}');
    expect(onGraphChange).toHaveBeenLastCalledWith({ nodes, edges });
  });

  it('WorkflowDesigner_Render_ShouldShowNodesEdgesAndCanvas', () => {
    const { container } = render(
      <WorkflowDesigner nodes={nodes} edges={edges} ariaLabel="Deployment workflow" />
    );

    expect(screen.getByRole('group', { name: 'Deployment workflow' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();

    expect(screen.getByText('submit')).toBeInTheDocument();

    const edgePath = container.querySelector('[data-workflow-edge="start-review"]');

    expect(edgePath).not.toBeNull();
    expect(edgePath?.getAttribute('marker-end')).toMatch(/^url\(#.+\)$/);
    expect(container.querySelector('[data-workflow-marker]')).not.toBeNull();
    expect(container.querySelector('[data-workflow-canvas]')).not.toBeNull();
  });

  it('WorkflowDesigner_Nodes_ShouldRenderAtGridPositionsUsingCustomRenderer', () => {
    const { container } = render(
      <WorkflowDesigner
        nodes={nodes}
        className="custom-designer"
        renderNode={(node) => <strong>{`Custom ${node.id}`}</strong>}
      />
    );

    const start = screen.getByRole('button', { name: 'Start' });

    expect(screen.getByText('Custom start')).toBeInTheDocument();
    expect(screen.getByText('Custom done')).toBeInTheDocument();
    expect(start).toHaveStyle({ left: '0px', top: '0px' });
    expect(container.firstChild).toHaveClass('custom-designer');
  });

  it('WorkflowDesigner_Select_ShouldNotifyAndMarkSelectedNode', async () => {
    const user = userEvent.setup();
    const onSelectNode = jest.fn();

    render(<WorkflowDesigner nodes={nodes} onSelectNode={onSelectNode} />);

    const review = screen.getByRole('button', { name: 'Review' });

    expect(review).toHaveAttribute('aria-pressed', 'false');

    await user.click(review);

    expect(onSelectNode).toHaveBeenCalledWith('review');
    expect(review).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Start' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('WorkflowDesigner_ControlledSelection_ShouldRespectSelectedNodeId', async () => {
    const user = userEvent.setup();
    const onSelectNode = jest.fn();

    render(<WorkflowDesigner nodes={nodes} selectedNodeId="review" onSelectNode={onSelectNode} />);

    expect(screen.getByRole('button', { name: 'Review' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(onSelectNode).toHaveBeenCalledWith('start');
    // The parent owns the selection, so the clicked node does not become selected.
    expect(screen.getByRole('button', { name: 'Review' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('WorkflowDesigner_Keyboard_ShouldSelectFocusedNodeOnEnter', async () => {
    const user = userEvent.setup();
    const onSelectNode = jest.fn();

    render(<WorkflowDesigner nodes={nodes} onSelectNode={onSelectNode} />);

    const start = screen.getByRole('button', { name: 'Start' });

    expect(start).toHaveAttribute('tabindex', '0');

    start.focus();
    expect(start).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onSelectNode).toHaveBeenCalledWith('start');
    expect(start).toHaveAttribute('aria-pressed', 'true');
  });

  it('WorkflowDesigner_Drag_ShouldSnapToGridAndEmitNodes', () => {
    const onNodesChange = jest.fn();

    render(<WorkflowDesigner nodes={nodes} editable gridSize={20} onNodesChange={onNodesChange} />);

    const start = screen.getByRole('button', { name: 'Start' });

    fireEvent.pointerDown(start, { clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerMove(start, { clientX: 33, clientY: 7 });
    fireEvent.pointerUp(start, { clientX: 33, clientY: 7 });

    expect(onNodesChange).toHaveBeenCalled();

    const lastNodes: WorkflowNode[] = onNodesChange.mock.calls.at(-1)?.[0];

    expect(lastNodes.find((node) => node.id === 'start')).toMatchObject({ x: 40, y: 0 });
    expect(lastNodes.find((node) => node.id === 'review')).toMatchObject({ x: 160, y: 0 });
    expect(start).toHaveStyle({ left: '40px', top: '0px' });
  });

  it('WorkflowDesigner_NotEditable_ShouldIgnoreNodeDragging', () => {
    const onNodesChange = jest.fn();

    render(<WorkflowDesigner nodes={nodes} onNodesChange={onNodesChange} />);

    const start = screen.getByRole('button', { name: 'Start' });

    fireEvent.pointerDown(start, { clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerMove(start, { clientX: 60, clientY: 40 });
    fireEvent.pointerUp(start, { clientX: 60, clientY: 40 });

    expect(onNodesChange).not.toHaveBeenCalled();
    expect(start).toHaveStyle({ left: '0px', top: '0px' });
  });

  it('WorkflowDesigner_Zoom_ShouldUpdateUncontrolledZoomAndNotify', async () => {
    const user = userEvent.setup();
    const onZoomChange = jest.fn();
    const { container } = render(
      <WorkflowDesigner nodes={nodes} defaultZoom={1} onZoomChange={onZoomChange} />
    );

    const canvas = container.querySelector('[data-workflow-canvas]');

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(canvas).toHaveStyle({ transform: 'scale(1)' });

    await user.click(screen.getByRole('button', { name: 'Zoom in' }));

    expect(onZoomChange).toHaveBeenLastCalledWith(1.1);
    expect(screen.getByText('110%')).toBeInTheDocument();
    expect(canvas).toHaveStyle({ transform: 'scale(1.1)' });

    await user.click(screen.getByRole('button', { name: 'Reset zoom' }));

    expect(onZoomChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('WorkflowDesigner_ControlledZoom_ShouldOnlyNotify', async () => {
    const user = userEvent.setup();
    const onZoomChange = jest.fn();

    render(<WorkflowDesigner nodes={nodes} zoom={1.5} onZoomChange={onZoomChange} />);

    expect(screen.getByText('150%')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Zoom out' }));

    expect(onZoomChange).toHaveBeenLastCalledWith(1.4);
    // The parent owns the zoom, so the displayed value stays untouched.
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('WorkflowDesigner_Connect_ShouldLinkSelectedNodeToTarget', async () => {
    const user = userEvent.setup();
    const onConnect = jest.fn();

    render(
      <WorkflowDesigner
        nodes={nodes}
        edges={edges}
        defaultSelectedNodeId="start"
        onConnect={onConnect}
      />
    );

    await user.click(screen.getByRole('button', { name: /Connect to/ }));

    expect(screen.getByText(/Connecting from Start/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Review' }));

    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(onConnect).toHaveBeenCalledWith('start', 'review');
    expect(screen.queryByText(/Connecting from Start/)).not.toBeInTheDocument();
  });

  it('WorkflowDesigner_Grid_ShouldToggleBackgroundUsingGridSize', () => {
    const { container, rerender } = render(<WorkflowDesigner nodes={nodes} gridSize={24} />);

    const canvas = container.querySelector<HTMLElement>('[data-workflow-canvas]');

    expect(canvas).toHaveAttribute('data-grid-size', '24');
    expect(canvas?.style.backgroundImage).toContain('linear-gradient');
    expect(canvas?.style.backgroundSize).toContain('24px');

    rerender(<WorkflowDesigner nodes={nodes} showGrid={false} />);

    expect(canvas?.style.backgroundImage).toBe('none');
  });

  it('WorkflowDesigner_Empty_ShouldShowEmptyState', () => {
    render(<WorkflowDesigner nodes={[]} />);

    expect(screen.getByText('No workflow nodes')).toBeInTheDocument();
    expect(screen.queryByText('Start')).not.toBeInTheDocument();
  });

  it('WorkflowDesigner_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <WorkflowDesigner
        nodes={nodes}
        edges={edges}
        editable
        defaultSelectedNodeId="review"
        onConnect={() => undefined}
        ariaLabel="Workflow"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
