import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  ColorPicker,
  Dropzone,
  NumberInput,
  PasswordInput,
  RangeSlider,
  Rating,
  SegmentedControl,
  Slider,
  Textarea
} from '@nebular-react/core';

describe('new form components', () => {
  it('SegmentedControl selects an item and updates aria-checked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <SegmentedControl
        ariaLabel="View"
        data={['List', 'Grid']}
        defaultValue="List"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('radio', { name: 'Grid' }));

    expect(onChange).toHaveBeenCalledWith('Grid');
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('Textarea accepts text', async () => {
    const user = userEvent.setup();

    render(<Textarea aria-label="Notes" />);

    await user.type(screen.getByLabelText('Notes'), 'Hello');

    expect(screen.getByLabelText('Notes')).toHaveValue('Hello');
  });

  it('NumberInput clamps and reports numeric values', () => {
    const onChange = jest.fn();

    render(
      <NumberInput aria-label="Quantity" defaultValue={10} min={0} max={100} onChange={onChange} />
    );

    const input = screen.getByRole('spinbutton', { name: 'Quantity' });
    fireEvent.change(input, { target: { value: '200' } });

    expect(onChange).toHaveBeenLastCalledWith(100);
    expect(input).toHaveValue(100);
  });

  it('PasswordInput toggles visibility', async () => {
    const user = userEvent.setup();

    render(<PasswordInput aria-label="Password" defaultValue="secret" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));

    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  });

  it('Rating selects a value and supports clearing', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Rating defaultValue={2} onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: '4 stars' }));
    expect(onChange).toHaveBeenLastCalledWith(4);

    await user.click(screen.getByRole('radio', { name: '4 stars' }));
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('Slider reports value changes', () => {
    const onChange = jest.fn();

    render(<Slider label="Opacity" defaultValue={20} onChange={onChange} />);

    fireEvent.change(screen.getByRole('slider', { name: 'Opacity' }), {
      target: { value: '70' }
    });

    expect(onChange).toHaveBeenLastCalledWith(70);
    expect(screen.getByText('70')).toBeInTheDocument();
  });

  it('RangeSlider keeps start and end ordered', () => {
    const onChange = jest.fn();

    render(
      <RangeSlider label="Price" defaultValue={[20, 80]} onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('slider', { name: 'Price start' }), {
      target: { value: '30' }
    });
    fireEvent.change(screen.getByRole('slider', { name: 'Price end' }), {
      target: { value: '60' }
    });

    expect(onChange).toHaveBeenLastCalledWith([30, 60]);
  });

  it('ColorPicker changes color from the native input and swatches', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ColorPicker ariaLabel="Accent" defaultValue="#3366ff" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Accent'), {
      target: { value: '#ff0000' }
    });
    expect(onChange).toHaveBeenLastCalledWith('#ff0000');

    await user.click(screen.getByRole('button', { name: 'Select color #00d68f' }));
    expect(onChange).toHaveBeenLastCalledWith('#00d68f');
  });

  it('Dropzone accepts dropped files', () => {
    const onDrop = jest.fn();
    const file = new File(['content'], 'avatar.png', { type: 'image/png' });

    render(<Dropzone accept="image/*" onDrop={onDrop} />);

    fireEvent.drop(screen.getByRole('button', { name: 'Drop files here or click to select' }), {
      dataTransfer: { files: [file] }
    });

    expect(onDrop).toHaveBeenCalledWith([file]);
  });

  it('has no accessibility violations in representative form controls', async () => {
    const { container } = render(
      <div>
        <SegmentedControl ariaLabel="View" data={['List', 'Grid']} />
        <Rating defaultValue={3} />
        <Slider label="Opacity" defaultValue={40} />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
