import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { NebularProvider } from '@nebular-react/styles';
import { Chat, ChatForm } from '@nebular-react/core';
import type { ChatMessageType } from '@nebular-react/core';

const buildMessage = (overrides: Partial<ChatMessageType> = {}): ChatMessageType => ({
  id: 'message-1',
  message: 'Hello there',
  sender: 'John Doe',
  date: new Date('2026-11-18T12:30:00.000Z'),
  ...overrides
});

const scrollIntoView = jest.fn();

beforeAll(() => {
  Element.prototype.scrollIntoView = scrollIntoView;
});

describe('Chat i18n', () => {
  it('ChatI18n_Default_ShouldRenderEnglishLabels', async () => {
    const user = userEvent.setup();

    render(
      <Chat
        messages={[
          buildMessage({
            reply: true,
            status: 'read',
            readBy: ['Jane Roe'],
            threadId: 'thread-1'
          })
        ]}
        threads={{ 'thread-1': [] }}
        defaultOpenThreadId="thread-1"
        searchable
        editable
        deletable
        onEditMessage={jest.fn()}
        onDeleteMessage={jest.fn()}
        onReactionToggle={jest.fn()}
        typingUsers={['Ana']}
        chatFrom={<ChatForm onSend={jest.fn()} />}
      />
    );

    expect(screen.getByPlaceholderText('Search messages')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit message' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete message' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add reaction' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Read by Jane Roe' })).toBeInTheDocument();
    expect(screen.getByText('Ana is typing…')).toBeInTheDocument();
    expect(screen.getByText('No replies yet')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Reply to thread')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send reply' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Search messages'), 'hello');

    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
    expect(screen.getByText('1 de 1')).toBeInTheDocument();
  });

  it('ChatI18n_Default_ShouldRenderEnglishEmptyStates', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Chat />);

    expect(screen.getByText('No messages yet')).toBeInTheDocument();

    rerender(<Chat messages={[buildMessage()]} searchable />);

    await user.type(screen.getByPlaceholderText('Search messages'), 'zzz');

    expect(screen.getByText('No messages found')).toBeInTheDocument();
    expect(screen.getByText('0 de 1')).toBeInTheDocument();
  });

  it('ChatI18n_ProviderPtBr_ShouldTranslateActionsAndAria', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <Chat
          title="Suporte"
          messages={[
            buildMessage({
              reply: true,
              status: 'read',
              readBy: ['Ana'],
              threadId: 'thread-1',
              reactions: [{ emoji: '👍', users: ['Ana'] }]
            })
          ]}
          threads={{ 'thread-1': [] }}
          defaultOpenThreadId="thread-1"
          searchable
          editable
          deletable
          onEditMessage={jest.fn()}
          onDeleteMessage={jest.fn()}
          onReactionToggle={jest.fn()}
          typingUsers={['Ana']}
          chatFrom={<ChatForm onSend={jest.fn()} />}
        />
      </NebularProvider>
    );

    expect(screen.getByPlaceholderText('Pesquisar mensagens')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Ver conversa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar conversa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar mensagem' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir mensagem' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar reação' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Lida por Ana' })).toBeInTheDocument();
    expect(screen.getByText('Ana está digitando…')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Responder na conversa')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar resposta' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Excluir mensagem' }));

    expect(screen.getByRole('button', { name: 'Cancelar exclusão' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Confirmar exclusão' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar exclusão' }));
    await user.type(screen.getByPlaceholderText('Pesquisar mensagens'), 'zzz');
    await user.click(screen.getByRole('button', { name: 'Limpar pesquisa' }));

    expect(screen.getByPlaceholderText('Pesquisar mensagens')).toHaveValue('');
  });

  it('ChatI18n_LabelsOverride_ShouldWinOverProvider', () => {
    render(
      <NebularProvider locale="pt-BR">
        <Chat
          labels={{ editMessage: 'Custom edit' }}
          messages={[
            buildMessage({ reply: true, status: 'read', readBy: ['Ana'], message: 'Editable' })
          ]}
          editable
          deletable
          onEditMessage={jest.fn()}
          onDeleteMessage={jest.fn()}
        />
      </NebularProvider>
    );

    expect(screen.getByRole('button', { name: 'Custom edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir mensagem' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Lida por Ana' })).toBeInTheDocument();
  });

  it('ChatI18n_LabelsOverride_ShouldDriveMessagesFormAndTemplates', async () => {
    const user = userEvent.setup();

    render(
      <Chat
        messages={[
          buildMessage({
            message: 'Attachment message',
            reply: true,
            status: 'read',
            readBy: ['Ana'],
            edited: true,
            threadId: 'thread-1',
            type: 'file',
            files: [{ url: '', type: 'image/png' }],
            reactions: [{ emoji: '👍', users: ['Ana'] }]
          })
        ]}
        threads={{ 'thread-1': [] }}
        defaultOpenThreadId="thread-1"
        searchable
        editable
        deletable
        onEditMessage={jest.fn()}
        onDeleteMessage={jest.fn()}
        onReactionToggle={jest.fn()}
        chatFrom={<ChatForm onSend={jest.fn()} />}
        labels={{
          noMessages: 'Vazio',
          noSearchResults: 'Sem resultados',
          viewThread: 'Abrir thread',
          closeThread: 'Fechar thread',
          noReplies: 'Sem respostas',
          reply: 'Responder',
          sendReply: 'Enviar resposta custom',
          replyToThread: 'Escreva na thread',
          searchMessages: 'Buscar no chat',
          clearSearch: 'Limpar busca',
          searchResults: '{count} de {total}',
          editMessage: 'Alterar',
          editMessageText: 'Texto da mensagem',
          saveMessage: 'Gravar',
          cancelEditing: 'Descartar edição',
          edited: 'alterada',
          deleteMessage: 'Remover',
          deleteConfirmation: 'Remover esta mensagem?',
          cancelDeletion: 'Manter',
          confirmDeletion: 'Remover agora',
          addReaction: 'Reagir',
          reactions: 'Reações',
          reactWith: 'Reagir com {emoji}',
          toggleReaction: 'Alternar {emoji} ({count})',
          sent: 'Enviado',
          delivered: 'Entregue',
          read: 'Lido',
          readBy: 'Lido por {users}',
          typing: '{users} escreve…',
          typingPlural: '{users} escrevem…',
          sendMessage: 'Enviar mensagem custom',
          messagePlaceholder: 'Digite algo',
          dropFilePlaceholder: 'Solte aqui',
          attachment: 'Anexo {index}'
        }}
      />
    );

    expect(screen.getByText('alterada')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Lido por Ana' })).toBeInTheDocument();
    expect(screen.getByLabelText('Anexo 1')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Abrir thread' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar thread' })).toBeInTheDocument();
    expect(screen.getByText('Sem respostas')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escreva na thread')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar resposta custom' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar no chat')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite algo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar mensagem custom' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alternar 👍 (1)' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Alterar' }));

    expect(screen.getByLabelText('Texto da mensagem')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gravar' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Descartar edição' }));
    await user.click(screen.getByRole('button', { name: 'Remover' }));

    expect(screen.getByText('Remover esta mensagem?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manter' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Manter' }));
    await user.click(screen.getByRole('button', { name: 'Reagir' }));

    expect(screen.getByRole('menu', { name: 'Reações' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Reagir com 👍' })).toBeInTheDocument();
  });

  it('ChatI18n_LabelsOverride_ShouldDriveEmptyStates', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Chat labels={{ noMessages: 'Vazio' }} />);

    expect(screen.getByText('Vazio')).toBeInTheDocument();

    rerender(
      <Chat
        messages={[buildMessage({ message: 'Some text' })]}
        searchable
        labels={{ noSearchResults: 'Sem resultados' }}
      />
    );

    await user.type(screen.getByPlaceholderText('Search messages'), 'zzz');

    expect(screen.getByText('Sem resultados')).toBeInTheDocument();
    expect(screen.getByText('0 de 1')).toBeInTheDocument();
  });

  it('ChatI18n_LegacyProps_ShouldWinOverLabels', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <Chat
          messages={[
            buildMessage({
              reply: true,
              status: 'read',
              readBy: ['Ana'],
              threadId: 'thread-1'
            })
          ]}
          threads={{ 'thread-1': [{ message: 'Thread reply' }] }}
          defaultOpenThreadId="thread-1"
          searchable
          threadLabel="Legacy thread"
          searchPlaceholder="Legacy search"
          typingUsers={['Ana']}
          typingLabel={(users) => `${users.join('+')} legacy typing`}
          readLabel={(users) => `Legacy read ${users.join(',')}`}
          labels={{
            noMessages: 'Labels empty',
            viewThread: 'Labels thread',
            searchMessages: 'Labels search',
            typing: '{users} labels typing',
            typingPlural: '{users} labels typing',
            readBy: 'Labels read {users}',
            read: 'Labels read'
          }}
        />
      </NebularProvider>
    );

    expect(screen.getByRole('region', { name: 'Legacy thread' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Legacy thread/ })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Legacy search')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Legacy search' })).toBeInTheDocument();
    expect(screen.getByText('Ana legacy typing')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Legacy read Ana' })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Legacy search'), 'zzz');

    expect(screen.getByRole('button', { name: 'Limpar pesquisa' })).toBeInTheDocument();
  });

  it('ChatI18n_LegacyNoMessagePlaceholder_ShouldWinOverLabels', () => {
    const { rerender } = render(<Chat noMessagePlaceholder="Legacy empty" />);

    expect(screen.getByText('Legacy empty')).toBeInTheDocument();

    rerender(<Chat labels={{ noMessages: 'Labels empty' }} />);

    expect(screen.getByText('Labels empty')).toBeInTheDocument();
  });

  it('ChatI18n_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <NebularProvider locale="pt-BR">
        <Chat
          title="Suporte"
          messages={[
            buildMessage({
              reply: true,
              status: 'read',
              readBy: ['Ana'],
              threadId: 'thread-1',
              reactions: [{ emoji: '👍', users: ['Ana'] }]
            })
          ]}
          threads={{ 'thread-1': [{ message: 'Resposta' }] }}
          defaultOpenThreadId="thread-1"
          searchable
          editable
          deletable
          onEditMessage={jest.fn()}
          onDeleteMessage={jest.fn()}
          onReactionToggle={jest.fn()}
          typingUsers={['Ana']}
          chatFrom={<ChatForm onSend={jest.fn()} />}
        />
      </NebularProvider>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
