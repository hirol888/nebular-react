import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  DataMappingEditor,
  DateAdapterProvider,
  FormDesigner,
  ImageAnnotator,
  MediaPlayer,
  PropertyGrid,
  TemplateEditor,
  TimeSlotPicker,
  TranscriptViewer,
  applyDataMapping,
  nativeDateAdapter
} from '@nebular-react/core';

describe('Composable editors', () => {
  it('filters properties, edits typed values and restores an explicit default', async () => {
    const user = userEvent.setup();
    const changed = jest.fn();
    const { container } = render(
      <PropertyGrid
        fields={[
          {
            name: 'title',
            label: 'Title',
            category: 'Identity',
            type: 'text',
            defaultValue: 'New node'
          },
          { name: 'count', label: 'Retries', category: 'Execution', type: 'number' }
        ]}
        defaultValue={{ title: 'Published', count: 1 }}
        onChange={changed}
      />
    );
    await user.type(screen.getByRole('searchbox'), 'ret');
    expect(screen.queryByRole('textbox', { name: 'Title' })).not.toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Retries' })).toHaveValue(1);
    await user.clear(screen.getByRole('searchbox'));
    await user.click(screen.getByRole('button', { name: 'Reset Title' }));
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('New node');
    expect(changed).toHaveBeenLastCalledWith({ title: 'New node', count: 1 });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('inserts a variable at the caret, preserves unknown tokens and previews literal text', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TemplateEditor
        defaultValue="Hello ! {{unknown}}"
        variables={[{ path: 'person.name', label: 'Name', sample: '<Ada>' }]}
      />
    );
    const input = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Template' });
    input.focus();
    input.setSelectionRange(6, 6);
    fireEvent.select(input);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Variable' }), 'person.name');
    await user.click(screen.getByRole('button', { name: 'Insert variable' }));
    expect(input).toHaveValue('Hello {{person.name}}! {{unknown}}');
    expect(input).toHaveFocus();
    expect(screen.getByLabelText('Preview')).toHaveTextContent('Hello <Ada>! {{unknown}}');
    expect(screen.getByRole('status')).toHaveTextContent('unknown');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('groups absolute slots in the selected timezone and emits the original slot', async () => {
    const user = userEvent.setup();
    const change = jest.fn();
    const first = { id: 'first', start: '2025-03-10T01:00:00Z', end: '2025-03-10T01:30:00Z' };
    const second = { id: 'second', start: '2025-03-10T16:00:00Z', end: '2025-03-10T16:30:00Z' };
    render(
      <DateAdapterProvider adapter={nativeDateAdapter}>
        <TimeSlotPicker slots={[first, second]} timeZone="America/Sao_Paulo" onChange={change} />
      </DateAdapterProvider>
    );
    const slots = screen.getByRole('group', { name: 'Available times' });
    expect(within(slots).getAllByRole('button')).toHaveLength(1);
    const button = within(slots).getByRole('button', { name: /22:00.*22:30/ });
    await user.click(button);
    expect(change).toHaveBeenCalledWith(first);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('distinguishes overlapping local times and prevents disabled booking', async () => {
    const user = userEvent.setup();
    const earlier = {
      id: 'a',
      start: '2025-11-02T05:30:00Z',
      end: '2025-11-02T05:45:00Z',
      disabled: true
    };
    const later = { id: 'b', start: '2025-11-02T06:30:00Z', end: '2025-11-02T06:45:00Z' };
    const change = jest.fn();
    render(
      <TimeSlotPicker slots={[later, earlier]} timeZone="America/New_York" onChange={change} />
    );
    const [first, second] = within(
      screen.getByRole('group', { name: 'Available times' })
    ).getAllByRole('button');
    expect(first.textContent).toContain('01:30');
    expect(second.textContent).toContain('01:30');
    expect(first.textContent).not.toEqual(second.textContent);
    expect(first).toBeDisabled();
    fireEvent.click(first);
    await user.click(second);
    expect(change).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledWith(later);
  });

  it('publishes a serializable form and renders the selected field using SchemaForm', async () => {
    const user = userEvent.setup();
    const change = jest.fn();
    render(<FormDesigner onChange={change} />);
    await user.click(screen.getByRole('button', { name: 'Add field' }));
    const properties = screen.getByRole('region', { name: 'Field properties' });
    const label = within(properties).getByRole('textbox', { name: 'Label' });
    await user.clear(label);
    await user.type(label, 'Contact');
    await user.selectOptions(within(properties).getByRole('combobox', { name: 'Type' }), 'select');
    await user.type(
      within(properties).getByRole('textbox', { name: 'Options' }),
      'Email{Enter}Phone'
    );
    const preview = screen.getByRole('region', { name: 'Form preview' });
    expect(within(preview).getByRole('combobox', { name: 'Contact' })).toBeVisible();
    expect(within(preview).getByRole('option', { name: 'Phone' })).toBeVisible();
    const result = change.mock.calls.at(-1)?.[0];
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
    expect(result[0]).toMatchObject({ label: 'Contact', type: 'select' });
  });

  it('maps nested samples, rejects prototype paths and preserves falsy values', async () => {
    const user = userEvent.setup();
    const change = jest.fn();
    const { container } = render(
      <DataMappingEditor
        sources={[{ path: 'record.active', label: 'Active' }]}
        destinations={[{ path: 'result.active', label: 'Enabled', required: true }]}
        sample={{ record: { active: false } }}
        onChange={change}
      />
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Source for Enabled' }),
      'field:record.active'
    );
    expect(change).toHaveBeenLastCalledWith({
      'result.active': { kind: 'field', path: 'record.active' }
    });
    expect(screen.getByLabelText('Mapped sample')).toHaveTextContent('"active": false');
    expect(
      applyDataMapping({}, { '__proto__.injected': { kind: 'constant', value: 'no' } })
    ).toEqual({});
    const original = { first: { value: 7 } };
    expect(
      applyDataMapping(original, {
        result: { kind: 'field', path: 'first' },
        'result.b': { kind: 'constant', value: 'sibling' }
      })
    ).toEqual({ result: { value: 7 } });
    expect(original).toEqual({ first: { value: 7 } });
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Source for Enabled' }),
      'constant'
    );
    await user.type(screen.getByRole('textbox', { name: 'Constant for Enabled' }), 'offline');
    expect(screen.getByLabelText('Mapped sample')).toHaveTextContent('"active": "offline"');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('filters a transcript, seeks by segment and exposes native playback events', async () => {
    const user = userEvent.setup();
    const seek = jest.fn();
    const time = jest.fn();
    const ref = React.createRef<HTMLMediaElement>();
    const { container } = render(
      <>
        <MediaPlayer src="/sample.wav" kind="audio" mediaRef={ref} onPlaybackTimeChange={time} />
        <TranscriptViewer
          segments={[
            { id: 'a', start: 0, end: 4, text: 'Introduction' },
            { id: 'b', start: 4, end: 8, text: 'Review' }
          ]}
          currentTime={5}
          onSeek={seek}
        />
      </>
    );
    expect(ref.current?.tagName).toBe('AUDIO');
    if (ref.current) {
      ref.current.currentTime = 4;
      fireEvent.timeUpdate(ref.current);
    }
    expect(time).toHaveBeenLastCalledWith(4);
    expect(screen.getByRole('button', { name: /Review/ })).toHaveAttribute('aria-current', 'true');
    await user.type(screen.getByRole('searchbox'), 'rev');
    expect(screen.queryByRole('button', { name: /Introduction/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Review/ }));
    expect(seek).toHaveBeenCalledWith(4);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('supports image annotations by keyboard with normalized geometry and editable comments', async () => {
    const user = userEvent.setup();
    const change = jest.fn();
    const { container } = render(
      <ImageAnnotator src="/example.png" alt="Example" onChange={change} />
    );
    await user.click(screen.getByRole('button', { name: 'Add at center' }));
    const comment = screen.getByRole('textbox', { name: 'Comment' });
    expect(comment).toHaveFocus();
    await user.type(comment, 'Review this');
    expect(change.mock.calls.at(-1)?.[0][0]).toMatchObject({
      kind: 'point',
      x: 0.5,
      y: 0.5,
      comment: 'Review this'
    });
    const position = screen.getByRole('spinbutton', { name: 'Horizontal position (%)' });
    await user.clear(position);
    await user.type(position, '25{Enter}');
    expect(change.mock.calls.at(-1)?.[0][0]).toMatchObject({ x: 0.25 });
    await user.click(screen.getByRole('button', { name: 'Remove annotation' }));
    expect(change).toHaveBeenLastCalledWith([]);
    expect(await axe(container)).toHaveNoViolations();
  });
});
