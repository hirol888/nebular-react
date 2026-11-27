import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ImageComparison } from '@nebular-react/core';

const before = { src: '/before.jpg', alt: 'The room before renovation' };
const after = { src: '/after.jpg', alt: 'The room after renovation' };

describe('ImageComparison', () => {
  it('uses a focusable native range input and changes the revealed image', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <ImageComparison before={before} after={after} defaultValue={25} onChange={onChange} />
    );
    const slider = screen.getByRole('slider', { name: 'Compare images' });
    await user.tab();
    expect(slider).toHaveFocus();
    expect(slider).toHaveValue('25');
    fireEvent.change(slider, { target: { value: '75' } });
    expect(slider).toHaveValue('75');
    expect(onChange).toHaveBeenCalledWith(75);
    expect(screen.getByRole('img', { name: before.alt })).toHaveStyle({
      clipPath: 'inset(0 25% 0 0)'
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('clamps controlled values and supports a disabled comparison', () => {
    render(<ImageComparison before={before} after={after} value={123} disabled />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
    expect(slider).toHaveValue('100');
    expect(screen.getByRole('img', { name: before.alt })).toBeInTheDocument();
  });
});
