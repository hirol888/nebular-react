/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbAction } from '.';
import { BrowserRouter } from 'react-router-dom';

describe('NbAction', () => {
  const ICON_NAME = 'chevron-left-outline';

  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should render router link if link is set', () => {
    ({ unmount } = render(
      <BrowserRouter>
        <NbAction data-testid="action" icon={ICON_NAME} link="." />
      </BrowserRouter>
    ));
    const action = screen.getByTestId('action');

    expect(action.querySelector('a')).not.toBeNull();
    expect(action.querySelector('.nb-icon')).not.toBeNull();
  });

  it('should render anchor with href if href is set', () => {
    ({ unmount } = render(
      <NbAction data-testid="action" icon={ICON_NAME} href="/" />
    ));
    const action = screen.getByTestId('action');

    expect(action.querySelector('a')).not.toBeNull();
    expect(action.querySelector('a')).toHaveAttribute('href', '/');
    expect(action.querySelector('.nb-icon')).not.toBeNull();
  });

  it('should contain empty link if neither link nor href is set', () => {
    ({ unmount } = render(<NbAction data-testid="action" icon={ICON_NAME} />));
    const action = screen.getByTestId('action');

    expect(action.querySelector('a')).not.toBeNull();
    expect(action.querySelector('a')).toHaveAttribute('href', '#');
    expect(action.querySelector('.nb-icon')).not.toBeNull();
  });

  it('should set title', () => {
    ({ unmount } = render(
      <NbAction data-testid="action" icon={ICON_NAME} title="title" />
    ));
    const action = screen.getByTestId('action');

    expect(action.querySelector('a')).toHaveAttribute('title', 'title');
  });

  it('should set class if disabled', () => {
    ({ unmount } = render(
      <NbAction data-testid="action" icon={ICON_NAME} disabled />
    ));
    const action = screen.getByTestId('action');

    expect(action).toHaveClass('disabled');
  });

  it('should contain badge if badgeText set', () => {
    ({ unmount } = render(
      <NbAction data-testid="action" icon={ICON_NAME} badgeText="1" />
    ));
    const action = screen.getByTestId('action');

    expect(action.querySelector('.nb-badge')).not.toBeNull();
    expect(action.querySelector('.nb-badge')).toHaveTextContent('1');
  });

  it('should pass set badge position and status to badge', () => {
    ({ unmount } = render(
      <NbAction
        data-testid="action"
        icon={ICON_NAME}
        badgeText="1"
        badgePosition="bottom right"
        badgeStatus="info"
      />
    ));
    const action = screen.getByTestId('action');

    expect(action.querySelector('.nb-badge')).toHaveClass('position-bottom');
    expect(action.querySelector('.nb-badge')).toHaveClass('position-right');
    expect(action.querySelector('.nb-badge')).toHaveClass('status-info');
  });

  it('should not contain anything if neither icon nor content passed', () => {
    ({ unmount } = render(<NbAction data-testid="action" />));
    const action = screen.getByTestId('action');

    expect(action).toHaveTextContent('');
  });

  it('should contain projected content if passed', () => {
    ({ unmount } = render(
      <NbAction data-testid="action">custom action</NbAction>
    ));
    const action = screen.getByTestId('action');

    expect(action).toHaveTextContent('custom action');
  });

  it('should not render projected content if icon is set', () => {
    ({ unmount } = render(
      <NbAction data-testid="action" icon={ICON_NAME}>
        custom action
      </NbAction>
    ));
    const action = screen.getByTestId('action');

    expect(action.querySelector('a')).not.toBeNull();
    expect(action).toHaveTextContent('');
  });
});
