import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Desktop, type DesktopApp, type DesktopAppGroup } from '@nebular-react/core';

const groups: DesktopAppGroup[] = [
  {
    id: 'features',
    title: 'Features',
    groups: [
      { id: 'forms', title: 'Forms' },
      { id: 'charts', title: 'Charts' }
    ]
  },
  { id: 'new-components', title: 'New Components' }
];

const apps: DesktopApp[] = [
  {
    id: 'form-inputs',
    title: 'Form Inputs',
    groupId: 'forms',
    content: <p>Form Inputs content</p>
  },
  {
    id: 'charts-js',
    title: 'Charts.js',
    groupId: 'charts',
    content: <p>Charts.js content</p>
  },
  {
    id: 'data-grid',
    title: 'DataGrid',
    groupId: 'new-components',
    content: <p>DataGrid content</p>
  },
  {
    id: 'notes',
    title: 'Notes',
    content: <p>Notes content</p>
  }
];

describe('Desktop start menu groups', () => {
  it('opens group apps through hover flyouts', async () => {
    const user = userEvent.setup();

    render(<Desktop apps={apps} groups={groups} />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    const menu = screen.getByRole('menu', { name: 'Apps' });
    expect(within(menu).getByRole('menuitem', { name: 'Open Notes' })).toBeInTheDocument();

    await user.hover(within(menu).getByRole('menuitem', { name: 'Features' }));

    const features = screen.getByRole('group', { name: 'Features' });
    await user.hover(within(features).getByRole('menuitem', { name: 'Forms' }));

    const forms = screen.getByRole('group', { name: 'Forms' });
    await user.click(within(forms).getByRole('menuitem', { name: 'Open Form Inputs' }));

    expect(screen.getByRole('dialog', { name: 'Form Inputs' })).toBeInTheDocument();
  });

  it('supports keyboard navigation between columns', async () => {
    const user = userEvent.setup();

    render(<Desktop apps={apps} groups={groups} />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    const menu = screen.getByRole('menu', { name: 'Apps' });
    const featuresItem = within(menu).getByRole('menuitem', { name: 'Features' });

    featuresItem.focus();
    await user.keyboard('{ArrowRight}');

    await waitFor(() => {
      expect(
        within(screen.getByRole('group', { name: 'Features' })).getByRole('menuitem', {
          name: 'Forms'
        })
      ).toHaveFocus();
    });

    await user.keyboard('{ArrowLeft}');
    expect(featuresItem).toHaveFocus();
    expect(screen.queryByRole('group', { name: 'Features' })).not.toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(screen.getByRole('group', { name: 'Features' })).toBeInTheDocument()
    );

    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu', { name: 'Apps' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toHaveFocus();
  });

  it('shows flat search results instead of groups', async () => {
    const user = userEvent.setup();

    render(<Desktop apps={apps} groups={groups} />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    const search = screen.getByRole('searchbox', { name: 'Search apps' });
    await user.type(search, 'form');

    expect(screen.queryByRole('menuitem', { name: 'Features' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Open Form Inputs' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Open Notes' })).not.toBeInTheDocument();
  });
});
