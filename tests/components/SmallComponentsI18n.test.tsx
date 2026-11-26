import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { NebularProvider } from '@nebular-react/styles';
import {
  Alert,
  Carousel,
  CommandPalette,
  EmojiPicker,
  NotificationCenter,
  Pagination,
  SignaturePad,
  Transfer
} from '@nebular-react/core';
import type { NotificationItem } from '@nebular-react/core';

const slides = [
  <div key="one">Slide one</div>,
  <div key="two">Slide two</div>,
  <div key="three">Slide three</div>
];

const notifications: NotificationItem[] = [
  { id: 'first', title: 'First notification', message: 'First message' },
  { id: 'second', title: 'Second notification', message: 'Second message' }
];

const transferData = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' }
];

describe('Small components i18n', () => {
  it('SmallComponentsI18n_Default_ShouldRenderEnglishLabels', () => {
    render(
      <>
        <Pagination total={3} defaultPage={1} />
        <Carousel slides={slides} />
        <Alert closable>Heads up</Alert>
        <SignaturePad defaultValue="M1 1 L2 2" />
        <Transfer data={transferData} />
      </>
    );

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to slide 2' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Slide 1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Close alert' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Signature pad' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('Search')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Move selected to the right' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move selected to the left' })).toBeInTheDocument();
  });

  it('SmallComponentsI18n_Default_ShouldRenderEnglishEmojiPickerLabels', async () => {
    const user = userEvent.setup();

    render(<EmojiPicker ariaLabel="Emoji" />);

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');

    const search = screen.getByLabelText('Search emojis');
    expect(search).toHaveAttribute('placeholder', 'Search emojis');

    await user.type(search, 'zzzz');

    expect(screen.getByText('No emojis found')).toBeInTheDocument();
  });

  it('SmallComponentsI18n_Default_ShouldRenderEnglishCommandAndNotificationLabels', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CommandPalette opened onClose={jest.fn()} actions={[]} />);

    expect(screen.getByRole('button', { name: 'Close command palette' })).toBeInTheDocument();
    unmount();

    render(<NotificationCenter notifications={notifications} />);

    await user.click(screen.getByRole('button', { name: 'Notifications' }));

    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark all as read' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('SmallComponentsI18n_ProviderPtBr_ShouldTranslateLabels', () => {
    render(
      <NebularProvider locale="pt-BR">
        <>
          <Pagination total={3} defaultPage={1} />
          <Carousel slides={slides} />
          <Alert closable>Heads up</Alert>
          <SignaturePad defaultValue="M1 1 L2 2" />
          <Transfer data={transferData} />
        </>
      </NebularProvider>
    );

    expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Slide anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próximo slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir para o slide 2' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Slide 1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Fechar alerta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('Pesquisar')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Mover selecionados para a direita' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mover selecionados para a esquerda' })).toBeInTheDocument();
  });

  it('SmallComponentsI18n_ProviderPtBr_ShouldTranslateEmojiPickerLabels', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <EmojiPicker ariaLabel="Emoji" />
      </NebularProvider>
    );

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');

    const search = screen.getByLabelText('Pesquisar emojis');
    expect(search).toHaveAttribute('placeholder', 'Pesquisar emojis');

    await user.type(search, 'zzzz');

    expect(screen.getByText('Nenhum emoji encontrado')).toBeInTheDocument();
  });

  it('SmallComponentsI18n_ProviderPtBr_ShouldTranslateCommandPaletteAndNotificationCenter', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <NebularProvider locale="pt-BR">
        <CommandPalette opened onClose={jest.fn()} actions={[]} />
      </NebularProvider>
    );

    expect(screen.getByRole('button', { name: 'Fechar paleta de comandos' })).toBeInTheDocument();
    unmount();

    render(
      <NebularProvider locale="pt-BR">
        <NotificationCenter notifications={notifications} defaultOpened />
      </NebularProvider>
    );

    expect(screen.getByRole('button', { name: 'Notificações' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Notificações' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Notificações' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Marcar todas como lidas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Notificações' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('SmallComponentsI18n_ProviderPtBr_ShouldTranslateNotificationCenterEmptyState', () => {
    render(
      <NebularProvider locale="pt-BR">
        <NotificationCenter notifications={[]} defaultOpened />
      </NebularProvider>
    );

    expect(screen.getByText('Nenhuma notificação')).toBeInTheDocument();
  });

  it('SmallComponentsI18n_LabelsProps_ShouldOverrideLocaleDefaults', () => {
    render(
      <NebularProvider locale="pt-BR">
        <>
          <Pagination
            total={3}
            ariaLabel="Pager"
            getItemA11yLabel={(page) => `Page number ${page}`}
          />
          <Carousel
            slides={slides}
            labels={{
              previous: 'Back',
              next: 'Forward',
              slide: (index) => `Panel ${index}`,
              goTo: (index) => `Show panel ${index}`
            }}
          />
          <Alert closable closeLabel="Dismiss">
            Notice
          </Alert>
          <Transfer
            data={transferData}
            labels={{ search: 'Find', moveToSelected: 'Add', moveToAvailable: 'Remove' }}
          />
          <NotificationCenter
            notifications={notifications}
            defaultOpened
            title="Inbox"
            labels={{ markAllRead: 'Read everything', clear: 'Dismiss everything' }}
          />
        </>
      </NebularProvider>
    );

    expect(screen.getByRole('navigation', { name: 'Pager' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page number 1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show panel 2' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Panel 1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('Find')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read everything' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss everything' })).toBeInTheDocument();
  });

  it('SmallComponentsI18n_NotificationCenter_ShouldPreferTitleAndEmptyStateProps', () => {
    const { rerender } = render(
      <NotificationCenter
        notifications={[]}
        defaultOpened
        title="Custom title"
        labels={{ title: 'Label title', empty: 'Label empty state' }}
      />
    );

    expect(screen.getByRole('heading', { name: 'Custom title' })).toBeInTheDocument();
    expect(screen.getByText('Label empty state')).toBeInTheDocument();

    rerender(
      <NotificationCenter
        notifications={[]}
        defaultOpened
        title="Custom title"
        emptyState="Custom empty state"
        labels={{ title: 'Label title', empty: 'Label empty state' }}
      />
    );

    expect(screen.getByText('Custom empty state')).toBeInTheDocument();
    expect(screen.queryByText('Label empty state')).not.toBeInTheDocument();
  });

  it('SmallComponentsI18n_EmojiPicker_ShouldKeepNothingFoundMessageProp', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <EmojiPicker ariaLabel="Emoji" nothingFoundMessage="Nada por aqui" />
      </NebularProvider>
    );

    await user.click(screen.getByLabelText('Emoji'));
    await screen.findByRole('dialog');
    await user.type(screen.getByLabelText('Pesquisar emojis'), 'zzzz');

    expect(screen.getByText('Nada por aqui')).toBeInTheDocument();
  });

  it('SmallComponentsI18n_CommandPalette_ShouldKeepPlaceholderAndNothingFoundProps', () => {
    render(
      <NebularProvider locale="pt-BR">
        <CommandPalette
          opened
          onClose={jest.fn()}
          actions={[]}
          placeholder="Filtrar comandos"
          nothingFoundMessage="Nada corresponde"
        />
      </NebularProvider>
    );

    expect(screen.getByPlaceholderText('Filtrar comandos')).toBeInTheDocument();
    expect(screen.getByText('Nada corresponde')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar paleta de comandos' })).toBeInTheDocument();
  });

  it('SmallComponentsI18n_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <NebularProvider locale="pt-BR">
        <>
          <Alert closable>Alerta</Alert>
          <Pagination total={5} defaultPage={3} />
          <Carousel slides={slides} />
          <SignaturePad defaultValue="M1 1 L2 2" />
        </>
      </NebularProvider>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
