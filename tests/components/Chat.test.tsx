import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Chat, ChatForm } from '@nebular-react/core';
import type { ChatMessageType } from '@nebular-react/core';

const messages: ChatMessageType[] = [
  {
    message: 'Hello there',
    sender: 'John Doe',
    date: new Date('2026-11-18T12:30:00.000Z')
  },
  {
    message: 'Hi, John!',
    sender: 'Jane Roe',
    reply: true,
    date: new Date('2026-11-18T12:31:00.000Z')
  }
];

const scrollIntoView = jest.fn();

class MockFileReader {
  onload: ((event: { target: { result: string } }) => void) | null = null;

  result: string | null = null;

  readAsDataURL(file: File) {
    this.result = `data:${file.type};base64,bW9jaw==`;
    this.onload?.({ target: { result: this.result } });
  }
}

const originalFileReader = window.FileReader;

beforeAll(() => {
  Element.prototype.scrollIntoView = scrollIntoView;
  (window as unknown as { FileReader: typeof FileReader }).FileReader =
    MockFileReader as unknown as typeof FileReader;
});

afterAll(() => {
  (window as unknown as { FileReader: typeof FileReader }).FileReader = originalFileReader;
});

beforeEach(() => {
  scrollIntoView.mockClear();
});

const imageFile = () => new File(['image'], 'photo.png', { type: 'image/png' });

const textFile = () => new File(['notes'], 'notes.txt', { type: 'text/plain' });

const messageText = (
  text: string,
  container: HTMLElement = document.body
): HTMLElement | undefined =>
  Array.from(container.querySelectorAll('.nebular-chat-message-text-text')).find(
    (element) => element.textContent === text
  ) as HTMLElement | undefined;

const messageRoot = (text: string) =>
  ((messageText(text) as HTMLElement | undefined) ?? screen.getByText(text)).closest(
    '.nebular-chat-message-root'
  ) as HTMLElement;

const formRoot = (container: HTMLElement) =>
  container.querySelector('.nebular-chat-form-root') as HTMLElement;

describe('Chat', () => {
  it('Chat_Render_ShouldRenderTitleMessagesAndForm', () => {
    render(<Chat title="Support" messages={messages} chatFrom={<ChatForm onSend={jest.fn()} />} />);

    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByText('Hi, John!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message')).toBeInTheDocument();
    expect(document.querySelectorAll('.nebular-chat-message-root')).toHaveLength(2);
    expect(messageRoot('Hello there')).toHaveClass('not-reply');
  });

  it('Chat_Render_ShouldShowPlaceholderWhenThereAreNoMessages', () => {
    const { rerender } = render(<Chat />);

    expect(screen.getByText('No messages yet')).toBeInTheDocument();

    rerender(<Chat noMessagePlaceholder="Sem mensagens" />);

    expect(screen.getByText('Sem mensagens')).toBeInTheDocument();
  });

  it('Chat_ScrollBottom_ShouldScrollWhenMessagesChange', () => {
    const { rerender } = render(<Chat messages={messages} />);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);

    scrollIntoView.mockClear();
    rerender(<Chat messages={[...messages, { message: 'Third message' }]} />);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('Chat_ScrollBottom_ShouldNotScrollWhenDisabled', () => {
    render(<Chat messages={messages} scrollBottom={false} />);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('Chat_Render_ShouldForwardRefAndExtraProps', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Chat ref={ref} data-testid="chat-root" />);

    expect(ref.current).toBe(screen.getByTestId('chat-root'));
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('ChatMessage', () => {
  it('ChatMessage_Render_ShouldShowSenderInitialsWhenAvatarIsMissing', () => {
    render(<Chat messages={[{ message: 'Hello', sender: 'john doe' }]} />);

    expect(document.querySelector('.nebular-chat-message-avatar')).toHaveTextContent('JD');
  });

  it('ChatMessage_Render_ShouldUseAvatarImageWhenProvided', () => {
    render(
      <Chat
        messages={[{ message: 'Hello', sender: 'John Doe', avatar: 'https://cdn.test/john.png' }]}
      />
    );

    const avatar = document.querySelector('.nebular-chat-message-avatar') as HTMLElement;

    expect(avatar.style.backgroundImage).toContain('https://cdn.test/john.png');
    expect(avatar).toHaveTextContent('');
  });

  it('ChatMessage_Render_ShouldRenderReplyWithoutAvatar', () => {
    render(<Chat messages={[{ message: 'Hi, John!', sender: 'Jane Roe', reply: true }]} />);

    const root = messageRoot('Hi, John!');

    expect(root).toHaveClass('reply');
    expect(root.querySelector('.nebular-chat-message-avatar')).toBeNull();
  });

  it('ChatMessage_Render_ShouldRenderSenderAndFormattedTime', () => {
    render(<Chat messages={[messages[0]]} />);

    const root = messageRoot('Hello there');
    const sender = root.querySelector('.nebular-chat-message-text-sender') as HTMLElement;
    const time = root.querySelector('time') as HTMLElement;

    expect(sender).toHaveTextContent('John Doe');
    expect(time.textContent).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
  });

  it('ChatMessage_Render_ShouldRenderSingleFileAttachment', () => {
    render(
      <Chat
        messages={[
          {
            type: 'file',
            message: 'Archive attached',
            sender: 'Jane Roe',
            files: [{ url: 'https://files.test/a.zip', icon: 'file-text-outline' }]
          }
        ]}
      />
    );

    const link = screen.getByRole('link', { name: 'a.zip' });

    expect(link).toHaveAttribute('href', 'https://files.test/a.zip');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.querySelector('.nebular-icon-root')).not.toBeNull();
    expect(screen.getByText('Archive attached')).toBeInTheDocument();
  });

  it('ChatMessage_Render_ShouldRenderFileGroupWithImagesAndIcons', () => {
    render(
      <Chat
        messages={[
          {
            type: 'file',
            files: [
              { url: 'https://img.test/one%20image.png', type: 'image/png' },
              { url: 'https://files.test/b.zip', icon: 'file-text-outline', name: 'Build archive' }
            ]
          }
        ]}
      />
    );

    const links = screen.getAllByRole('link');
    const image = links[0].querySelector('.nebular-chat-message-file-image') as HTMLElement;

    expect(links).toHaveLength(2);
    expect(
      document.querySelector('.nebular-chat-message-file-messageeContentGroup')
    ).not.toBeNull();
    expect(image.style.backgroundImage).toContain('https://img.test/one%20image.png');
    expect(screen.getByRole('link', { name: 'one image.png' })).toBe(links[0]);
    expect(screen.getByRole('link', { name: 'Build archive' })).toBe(links[1]);
    expect(links[1].querySelector('.nebular-icon-root')).not.toBeNull();
  });

  it('ChatMessage_Render_ShouldRenderQuotedMessage', () => {
    render(
      <Chat
        messages={[
          {
            type: 'quote',
            quote: 'Original text',
            message: 'My reply',
            sender: 'John Doe',
            date: new Date('2026-11-18T12:30:00.000Z')
          }
        ]}
      />
    );

    expect(document.querySelector('.nebular-chat-message-quote-quote')).toHaveTextContent(
      'Original text'
    );
    expect(screen.getByText('My reply')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('ChatMessage_Render_ShouldRenderQuoteWithoutSenderRow', () => {
    render(<Chat messages={[{ type: 'quote', quote: 'Only the quote', message: 'Answer' }]} />);

    expect(document.querySelector('.nebular-chat-message-quote-sender')).toBeNull();
    expect(screen.getByText('Only the quote')).toBeInTheDocument();
    expect(screen.getByText('Answer')).toBeInTheDocument();
  });

  it('ChatMessage_Render_ShouldRenderMapWithContextKey', () => {
    render(
      <Chat
        mapKey="API_KEY"
        messages={[{ type: 'map', latitude: 40.7, longitude: -73.9, message: 'Meet me there' }]}
      />
    );

    const href = screen.getByRole('link').getAttribute('href') as string;

    expect(href).toContain('center=40.7,-73.9');
    expect(href).toContain('key=API_KEY');
    expect(screen.getByText('Meet me there')).toBeInTheDocument();
  });

  it('ChatMessage_Render_ShouldRenderCustomMessageInsteadOfUnknownType', () => {
    render(
      <Chat
        messages={[
          {
            type: 'audio',
            message: 'Raw message',
            sender: 'Bot',
            customMessage: <button type="button">Play</button>
          }
        ]}
      />
    );

    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(screen.queryByText('Raw message')).not.toBeInTheDocument();
  });

  it('ChatMessage_Render_ShouldApplyCustomMessageModifiers', () => {
    render(
      <Chat
        messages={[
          {
            sender: 'Bot',
            reply: true,
            customMessage: <span>Card content</span>,
            customMessageFullWidth: true
          }
        ]}
      />
    );

    const custom = screen
      .getByText('Card content')
      .closest('.nebular-chat-message-customMessage') as HTMLElement;

    expect(custom).toHaveClass('nebular-chat-message-customMessageFullWidth');
    expect(custom).toHaveClass('nebular-chat-message-customMessageReply');
    expect(custom).toHaveClass('nebular-chat-message-customMessageNoSpace');
    expect(custom).not.toHaveClass('nebular-chat-message-customMessageNotReply');
  });
});

describe('ChatForm', () => {
  it('ChatForm_Send_ShouldCallOnSendAndClearInput', async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();

    render(<ChatForm onSend={onSend} />);

    const input = screen.getByPlaceholderText('Type a message');
    await user.type(input, 'Hello team');
    await user.click(screen.getByRole('button'));

    expect(onSend).toHaveBeenCalledWith({ message: 'Hello team', files: [] });
    expect(input).toHaveValue('');
  });

  it('ChatForm_Enter_ShouldSendMessage', async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();

    render(<ChatForm onSend={onSend} />);

    await user.type(screen.getByPlaceholderText('Type a message'), 'Hello{Enter}');

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith({ message: 'Hello', files: [] });
  });

  it('ChatForm_ShiftEnter_ShouldStillSendMessage', async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();

    render(<ChatForm onSend={onSend} />);

    await user.type(screen.getByPlaceholderText('Type a message'), 'Hello{Shift>}{Enter}{/Shift}');

    expect(onSend).toHaveBeenCalledWith({ message: 'Hello', files: [] });
  });

  it('ChatForm_Send_ShouldIgnoreEmptyAndWhitespaceMessages', async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();

    render(<ChatForm onSend={onSend} />);

    const input = screen.getByPlaceholderText('Type a message');

    await user.click(screen.getByRole('button'));
    expect(onSend).not.toHaveBeenCalled();

    await user.type(input, '   ');
    await user.click(screen.getByRole('button'));
    expect(onSend).not.toHaveBeenCalled();

    await user.type(input, '{Enter}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('ChatForm_Send_ShouldNotThrowWhenOnSendIsMissing', async () => {
    const user = userEvent.setup();

    render(<ChatForm />);

    const input = screen.getByPlaceholderText('Type a message');
    await user.type(input, 'Hello');
    await user.click(screen.getByRole('button'));

    expect(input).toHaveValue('');
  });

  it('ChatForm_Drop_ShouldPreviewAndRemoveImageFile', () => {
    const { container } = render(<ChatForm onSend={jest.fn()} dropFiles />);

    fireEvent.drop(formRoot(container), { dataTransfer: { files: [imageFile()] } });

    const dropFile = container.querySelector('.nebular-chat-form-dropFile') as HTMLElement;
    const iconWrapper = dropFile.querySelector('.nebular-chat-form-iconWrapper') as HTMLElement;

    expect(dropFile).not.toBeNull();
    expect(iconWrapper.style.backgroundImage).toContain('data:image/png');

    fireEvent.click(dropFile.querySelector('.nebular-chat-form-remove') as HTMLElement);

    expect(container.querySelector('.nebular-chat-form-dropFile')).toBeNull();
  });

  it('ChatForm_Drop_ShouldRemoveNonImageFile', () => {
    const { container } = render(<ChatForm onSend={jest.fn()} dropFiles />);

    fireEvent.drop(formRoot(container), { dataTransfer: { files: [textFile()] } });

    const dropFile = container.querySelector('.nebular-chat-form-dropFile') as HTMLElement;

    expect(dropFile.querySelector('.nebular-icon-root')).not.toBeNull();

    fireEvent.click(dropFile.querySelector('.nebular-chat-form-remove') as HTMLElement);

    expect(container.querySelector('.nebular-chat-form-dropFile')).toBeNull();
  });

  it('ChatForm_Send_ShouldIncludeDroppedFilesAndResetThem', async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    const { container } = render(<ChatForm onSend={onSend} dropFiles />);

    fireEvent.drop(formRoot(container), { dataTransfer: { files: [textFile()] } });

    await user.type(screen.getByPlaceholderText('Type a message'), 'Notes attached');
    await user.click(screen.getByRole('button'));

    const payload = onSend.mock.calls[0][0];

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(payload.message).toBe('Notes attached');
    expect(payload.files).toHaveLength(1);
    expect(payload.files[0].name).toBe('notes.txt');
    expect(container.querySelector('.nebular-chat-form-dropFile')).toBeNull();
    expect(screen.getByPlaceholderText('Type a message')).toHaveValue('');
  });

  it('ChatForm_Drop_ShouldBeIgnoredWhenDropFilesIsDisabled', () => {
    const { container } = render(<ChatForm onSend={jest.fn()} />);

    fireEvent.drop(formRoot(container), { dataTransfer: { files: [textFile()] } });

    expect(container.querySelector('.nebular-chat-form-dropFile')).toBeNull();
  });

  it('ChatForm_Drop_ShouldHandleMissingDataTransfer', () => {
    const { container } = render(<ChatForm onSend={jest.fn()} dropFiles />);

    fireEvent.drop(formRoot(container));

    expect(container.querySelector('.nebular-chat-form-dropFile')).toBeNull();
  });

  it('ChatForm_DragLeave_ShouldBeNoopWhenDropFilesIsDisabled', () => {
    const { container } = render(<ChatForm onSend={jest.fn()} />);

    fireEvent.dragLeave(formRoot(container));

    expect(screen.getByPlaceholderText('Type a message')).toBeInTheDocument();
  });

  it('ChatForm_DragOver_ShouldShowDropPlaceholderOnlyWhenEnabled', () => {
    const { container } = render(
      <ChatForm onSend={jest.fn()} dropFiles dropFilesPlaceholder="Solte o arquivo" />
    );

    fireEvent.dragOver(formRoot(container));

    expect(screen.getByPlaceholderText('Solte o arquivo')).toBeInTheDocument();

    fireEvent.dragLeave(formRoot(container));

    expect(screen.getByPlaceholderText('Type a message')).toBeInTheDocument();
  });

  it('ChatForm_DragOver_ShouldKeepPlaceholderWhenDropFilesIsDisabled', () => {
    const { container } = render(<ChatForm onSend={jest.fn()} />);

    fireEvent.dragOver(formRoot(container));

    expect(screen.getByPlaceholderText('Type a message')).toBeInTheDocument();
  });

  it('ChatForm_Button_ShouldRespectShowButtonAndTitle', () => {
    const { rerender } = render(<ChatForm onSend={jest.fn()} showButton={false} />);

    expect(screen.queryByRole('button')).toBeNull();

    rerender(<ChatForm onSend={jest.fn()} buttonTitle="Enviar" />);

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('ChatForm_FocusAndHover_ShouldHighlightInputWithChatStatus', () => {
    render(<Chat status="danger" chatFrom={<ChatForm onSend={jest.fn()} />} />);

    const input = screen.getByPlaceholderText('Type a message');
    const field = input.closest('.nebular-form-field-root') as HTMLElement;

    expect(field).toHaveClass('basic');

    fireEvent.focus(input);
    expect(field).toHaveClass('danger');

    fireEvent.blur(input);
    expect(field).toHaveClass('basic');

    fireEvent.mouseEnter(input);
    expect(field).toHaveClass('danger');

    fireEvent.mouseLeave(input);
    expect(field).toHaveClass('basic');
  });

  it('ChatForm_DragOver_ShouldHighlightInputWithPrimaryStatusForBasicChat', () => {
    const { container } = render(<Chat chatFrom={<ChatForm onSend={jest.fn()} dropFiles />} />);

    const field = screen
      .getByPlaceholderText('Type a message')
      .closest('.nebular-form-field-root') as HTMLElement;

    fireEvent.dragOver(formRoot(container));

    expect(field).toHaveClass('primary');
  });
});

describe('Chat threads', () => {
  const threadReplies: ChatMessageType[] = [
    { message: 'Thread reply one', sender: 'Jane Roe' },
    { message: 'Thread reply two', sender: 'John Doe', reply: true }
  ];

  const threadedMessages: ChatMessageType[] = [
    { id: 'm1', message: 'Kickoff', sender: 'John Doe', threadId: 'thread-1' },
    { id: 'm2', message: 'Second message', sender: 'Jane Roe' }
  ];

  it('Chat_Threads_ShouldShowReplyCountAndOpenPanel', async () => {
    const user = userEvent.setup();
    const onThreadOpen = jest.fn();

    render(
      <Chat
        title="Support"
        messages={threadedMessages}
        threads={{ 'thread-1': threadReplies }}
        threadLabel="Ver thread"
        onThreadOpen={onThreadOpen}
      />
    );

    const trigger = screen.getByRole('button', { name: /Ver thread/ });

    expect(trigger).toHaveTextContent('2');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region')).toBeNull();

    await user.click(trigger);

    const panel = screen.getByRole('region', { name: 'Ver thread' });

    expect(onThreadOpen).toHaveBeenCalledWith(threadedMessages[0]);
    expect(panel).toHaveAttribute('id', trigger.getAttribute('aria-controls') as string);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Thread reply one')).toBeInTheDocument();
    expect(screen.getByText('Thread reply two')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Reply to thread')).toHaveFocus();
  });

  it('Chat_Threads_ShouldClosePanelAndRestoreFocus', async () => {
    const user = userEvent.setup();

    render(
      <Chat
        messages={threadedMessages}
        threads={{ 'thread-1': threadReplies }}
        threadLabel="Ver thread"
      />
    );

    const trigger = screen.getByRole('button', { name: /Ver thread/ });

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Close thread' }));

    expect(screen.queryByRole('region')).toBeNull();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('Chat_Threads_ShouldCloseOnEscape', async () => {
    const user = userEvent.setup();

    render(
      <Chat
        messages={threadedMessages}
        threads={{ 'thread-1': threadReplies }}
        threadLabel="Ver thread"
      />
    );

    await user.click(screen.getByRole('button', { name: /Ver thread/ }));

    fireEvent.keyDown(screen.getByRole('region', { name: 'Ver thread' }), { key: 'Escape' });

    expect(screen.queryByRole('region')).toBeNull();
  });

  it('Chat_Threads_ShouldSendReplyAndClearInput', async () => {
    const user = userEvent.setup();
    const onThreadReply = jest.fn();

    render(
      <Chat
        messages={threadedMessages}
        threads={{ 'thread-1': threadReplies }}
        threadLabel="Ver thread"
        onThreadReply={onThreadReply}
      />
    );

    await user.click(screen.getByRole('button', { name: /Ver thread/ }));

    const input = screen.getByPlaceholderText('Reply to thread');

    await user.type(input, 'Looks good');
    await user.click(screen.getByRole('button', { name: 'Send reply' }));

    expect(onThreadReply).toHaveBeenCalledWith(threadedMessages[0], 'Looks good');
    expect(input).toHaveValue('');
  });

  it('Chat_Threads_ShouldIgnoreEmptyReply', async () => {
    const user = userEvent.setup();
    const onThreadReply = jest.fn();

    render(
      <Chat
        messages={threadedMessages}
        threads={{ 'thread-1': threadReplies }}
        threadLabel="Ver thread"
        onThreadReply={onThreadReply}
      />
    );

    await user.click(screen.getByRole('button', { name: /Ver thread/ }));
    await user.click(screen.getByRole('button', { name: 'Send reply' }));

    expect(onThreadReply).not.toHaveBeenCalled();
  });

  it('Chat_Threads_ShouldHideThreadUiWhenDisabled', () => {
    render(
      <Chat
        messages={threadedMessages}
        threads={{ 'thread-1': threadReplies }}
        showThreads={false}
      />
    );

    expect(screen.queryByRole('button', { name: /View thread/ })).toBeNull();
  });

  it('Chat_Threads_ShouldCountInlineRepliesThroughReplyTo', async () => {
    const user = userEvent.setup();
    const inlineMessages: ChatMessageType[] = [
      { id: 'parent', message: 'Parent message', sender: 'John Doe' },
      { message: 'Inline reply one', replyTo: 'parent', sender: 'Jane Roe' },
      { message: 'Inline reply two', replyTo: 'parent', sender: 'Jane Roe' }
    ];

    render(<Chat messages={inlineMessages} />);

    const trigger = screen.getByRole('button', { name: /View thread/ });

    expect(trigger).toHaveTextContent('2');

    await user.click(trigger);

    expect(screen.getByRole('region', { name: 'View thread' })).toBeInTheDocument();
    expect(screen.getAllByText('Inline reply one')).toHaveLength(2);
    expect(screen.getAllByText('Inline reply two')).toHaveLength(2);
  });

  it('Chat_Threads_ShouldRenderEmptyThreadPlaceholder', async () => {
    const user = userEvent.setup();

    render(<Chat messages={[{ id: 'm1', message: 'Empty thread', threadId: 'thread-1' }]} />);

    await user.click(screen.getByRole('button', { name: /View thread/ }));

    expect(screen.getByRole('region', { name: 'View thread' })).toHaveTextContent('No replies yet');
  });

  it('Chat_Threads_ShouldOpenThreadFromDefaultOpenThreadId', () => {
    render(
      <Chat
        messages={threadedMessages}
        threads={{ 'thread-1': threadReplies }}
        defaultOpenThreadId="thread-1"
      />
    );

    expect(screen.getByRole('region', { name: 'View thread' })).toBeInTheDocument();
    expect(screen.getByText('Thread reply one')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View thread/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('Chat_Threads_ShouldNotOpenDefaultThreadWhenThreadsAreDisabled', () => {
    render(
      <Chat
        messages={threadedMessages}
        threads={{ 'thread-1': threadReplies }}
        defaultOpenThreadId="thread-1"
        showThreads={false}
      />
    );

    expect(screen.queryByRole('region')).toBeNull();
  });
});

describe('Chat typing indicator', () => {
  it('Chat_Typing_ShouldRenderPoliteLiveRegionWithDotsAndLabel', () => {
    const { container } = render(<Chat typingUsers={['Ana']} />);

    const indicator = container.querySelector('.nebular-chat-typing') as HTMLElement;

    expect(indicator).toHaveAttribute('aria-live', 'polite');
    expect(indicator).toHaveAttribute('aria-atomic', 'true');
    expect(indicator).toHaveTextContent('Ana is typing');
    expect(indicator.querySelectorAll('.nebular-chat-typingDot')).toHaveLength(3);
  });

  it('Chat_Typing_ShouldPluralizeNames', () => {
    const { container, rerender } = render(<Chat typingUsers={['Ana']} />);

    rerender(<Chat typingUsers={['Ana', 'Bia']} />);
    expect(container.querySelector('.nebular-chat-typing')).toHaveTextContent(
      'Ana and Bia are typing'
    );

    rerender(<Chat typingUsers={['Ana', 'Bia', 'Caio']} />);
    expect(container.querySelector('.nebular-chat-typing')).toHaveTextContent(
      'Ana, Bia and Caio are typing'
    );
  });

  it('Chat_Typing_ShouldUseCustomLabel', () => {
    const { container } = render(
      <Chat
        typingUsers={['Ana', 'Bia']}
        typingLabel={(users) => `${users.join(', ')} estão digitando`}
      />
    );

    expect(container.querySelector('.nebular-chat-typing')).toHaveTextContent(
      'Ana, Bia estão digitando'
    );
  });

  it('Chat_Typing_ShouldReserveSpaceWhenUserListIsEmpty', () => {
    const { container } = render(<Chat typingUsers={[]} />);

    const indicator = container.querySelector('.nebular-chat-typing') as HTMLElement;

    expect(indicator).toBeInTheDocument();
    expect(indicator.querySelectorAll('.nebular-chat-typingDot')).toHaveLength(0);
    expect(indicator).toHaveTextContent('');
  });

  it('Chat_Typing_ShouldNotRenderWhenPropIsUndefined', () => {
    const { container } = render(<Chat />);

    expect(container.querySelector('.nebular-chat-typing')).toBeNull();
  });
});

describe('Chat read receipts', () => {
  it('Chat_ReadReceipts_ShouldShowSingleCheckForSentMessages', () => {
    render(<Chat messages={[{ message: 'Hi', reply: true, sender: 'John Doe' }]} />);

    const receipt = screen.getByRole('img', { name: 'Sent' });

    expect(receipt).toHaveClass('nebular-chat-message-receipt');
    expect(receipt).toHaveTextContent('✓');
  });

  it('Chat_ReadReceipts_ShouldShowDoubleCheckForDeliveredMessages', () => {
    render(
      <Chat messages={[{ message: 'Hi', reply: true, sender: 'John Doe', status: 'delivered' }]} />
    );

    expect(screen.getByRole('img', { name: 'Delivered' })).toHaveTextContent('✓✓');
  });

  it('Chat_ReadReceipts_ShouldDeriveReadStatusFromReadBy', () => {
    render(
      <Chat
        messages={[{ message: 'Hi', reply: true, sender: 'John Doe', readBy: ['Jane', 'Bia'] }]}
      />
    );

    expect(screen.getByRole('img', { name: 'Read by Jane and Bia' })).toHaveTextContent('✓✓');
  });

  it('Chat_ReadReceipts_ShouldSupportCustomReadLabel', () => {
    render(
      <Chat
        messages={[{ message: 'Hi', reply: true, status: 'read', readBy: ['Jane'] }]}
        readLabel={(users) => `Lida por ${users.join(', ')}`}
      />
    );

    expect(screen.getByRole('img', { name: 'Lida por Jane' })).toBeInTheDocument();
  });

  it('Chat_ReadReceipts_ShouldBeHiddenWhenDisabled', () => {
    render(
      <Chat
        messages={[{ message: 'Hi', reply: true, readBy: ['Jane'] }]}
        showReadReceipts={false}
      />
    );

    expect(screen.queryByRole('img')).toBeNull();
  });

  it('Chat_ReadReceipts_ShouldNotRenderOnReceivedMessages', () => {
    render(<Chat messages={[{ message: 'Hi', sender: 'Jane Roe' }]} />);

    expect(screen.queryByRole('img')).toBeNull();
  });

  it('Chat_ReadReceipts_ShouldUseChatLevelStatusAndReaders', () => {
    const { rerender } = render(
      <Chat
        messages={[{ message: 'Hi', reply: true, sender: 'John Doe' }]}
        readStatus="read"
        readBy={['Jane']}
      />
    );

    expect(screen.getByRole('img', { name: 'Read by Jane' })).toHaveTextContent('✓✓');

    rerender(
      <Chat
        messages={[{ message: 'Hi', reply: true, sender: 'John Doe', status: 'sent' }]}
        readStatus="read"
        readBy={['Jane']}
      />
    );

    expect(screen.getByRole('img', { name: 'Sent' })).toHaveTextContent('✓');
  });
});

describe('Chat search', () => {
  const searchMessages: ChatMessageType[] = [
    { id: 'search-1', message: 'Hello there', sender: 'John Doe' },
    { id: 'search-2', message: 'Hi, John!', sender: 'Jane Roe' }
  ];

  it('Chat_Search_ShouldRenderSearchFieldOnlyWhenSearchable', () => {
    const { rerender } = render(<Chat messages={searchMessages} />);

    expect(screen.queryByRole('search')).toBeNull();
    expect(screen.queryByPlaceholderText('Search messages')).toBeNull();

    rerender(<Chat messages={searchMessages} searchable searchPlaceholder="Buscar mensagens" />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar mensagens')).toBeInTheDocument();
  });

  it('Chat_Search_ShouldFilterCaseInsensitivelyAndShowCounter', async () => {
    const user = userEvent.setup();
    render(<Chat messages={searchMessages} searchable />);

    await user.type(screen.getByPlaceholderText('Search messages'), 'HELLO');

    expect(messageText('Hello there')).not.toBeUndefined();
    expect(messageText('Hi, John!')).toBeUndefined();
    expect(screen.getByText('1 de 2')).toHaveAttribute('aria-live', 'polite');
    expect(document.querySelectorAll('.nebular-chat-message-root')).toHaveLength(1);
  });

  it('Chat_Search_ShouldMatchSenderAndQuoteText', async () => {
    const user = userEvent.setup();
    render(
      <Chat
        messages={[
          { message: 'Plain answer', sender: 'John Doe' },
          { message: 'Quoted answer', sender: 'Jane Roe', type: 'quote', quote: 'Budget report' }
        ]}
        searchable
      />
    );

    const input = screen.getByPlaceholderText('Search messages');

    await user.type(input, 'jane');
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
    expect(messageText('Quoted answer')).not.toBeUndefined();
    expect(messageText('Plain answer')).toBeUndefined();

    await user.clear(input);
    await user.type(input, 'budget');
    expect(messageText('Quoted answer')).not.toBeUndefined();
    expect(messageText('Plain answer')).toBeUndefined();
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
  });

  it('Chat_Search_ShouldHighlightMatchesWithMark', async () => {
    const user = userEvent.setup();
    const { container } = render(<Chat messages={[{ message: 'Hello there' }]} searchable />);

    await user.type(screen.getByPlaceholderText('Search messages'), 'hello');

    const marks = container.querySelectorAll('mark');

    expect(marks).toHaveLength(1);
    expect(marks[0]).toHaveTextContent('Hello');
  });

  it('Chat_Search_ShouldNotHighlightWhenDisabled', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Chat messages={[{ message: 'Hello there' }]} searchable highlightMatches={false} />
    );

    await user.type(screen.getByPlaceholderText('Search messages'), 'hello');

    expect(container.querySelector('mark')).toBeNull();
    expect(messageText('Hello there')).not.toBeUndefined();
  });

  it('Chat_Search_ShouldRenderMarkupAsPlainText', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Chat messages={[{ message: 'Type <script>alert(1)</script> now' }]} searchable />
    );

    await user.type(screen.getByPlaceholderText('Search messages'), 'script');

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelectorAll('mark')).toHaveLength(2);
    expect(container.querySelector('.nebular-chat-message-text-text')).toHaveTextContent(
      'Type <script>alert(1)</script> now'
    );
  });

  it('Chat_Search_ShouldClearQueryAndRestoreFocus', async () => {
    const user = userEvent.setup();
    render(<Chat messages={searchMessages} searchable />);

    const input = screen.getByPlaceholderText('Search messages');

    await user.type(input, 'hello');

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(messageText('Hello there')).not.toBeUndefined();
    expect(messageText('Hi, John!')).not.toBeUndefined();
    expect(screen.queryByText('1 de 2')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
  });

  it('Chat_Search_ShouldSupportControlledValue', async () => {
    const user = userEvent.setup();
    const onSearchChange = jest.fn();

    render(
      <Chat
        messages={searchMessages}
        searchable
        searchValue="jane"
        onSearchChange={onSearchChange}
      />
    );

    const input = screen.getByPlaceholderText('Search messages');

    expect(input).toHaveValue('jane');
    expect(screen.getByText('Hi, John!')).toBeInTheDocument();
    expect(screen.queryByText('Hello there')).toBeNull();

    await user.type(input, 'x');

    expect(onSearchChange).toHaveBeenCalledWith('janex');
    expect(input).toHaveValue('jane');
  });

  it('Chat_Search_ShouldShowNoResultsState', async () => {
    const user = userEvent.setup();
    render(<Chat messages={searchMessages} searchable />);

    await user.type(screen.getByPlaceholderText('Search messages'), 'zzz');

    expect(screen.getByText('No messages found')).toBeInTheDocument();
    expect(screen.getByText('0 de 2')).toBeInTheDocument();
    expect(document.querySelectorAll('.nebular-chat-message-root')).toHaveLength(0);
  });
});

describe('Chat message editing', () => {
  const editableMessage: ChatMessageType = {
    id: 'editable-1',
    message: 'Editable text',
    sender: 'John Doe'
  };

  it('Chat_Edit_ShouldRenderActionOnlyWhenEnabled', () => {
    const { rerender } = render(<Chat messages={[editableMessage]} />);

    expect(screen.queryByRole('button', { name: 'Edit message' })).toBeNull();

    rerender(<Chat messages={[editableMessage]} editable />);

    expect(screen.queryByRole('button', { name: 'Edit message' })).toBeNull();

    rerender(<Chat messages={[editableMessage]} editable onEditMessage={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Edit message' })).toBeInTheDocument();
  });

  it('Chat_Edit_ShouldOpenFocusedEditorAndSave', async () => {
    const user = userEvent.setup();
    const onEditMessage = jest.fn();

    render(<Chat messages={[editableMessage]} editable onEditMessage={onEditMessage} />);

    await user.click(screen.getByRole('button', { name: 'Edit message' }));

    const editor = screen.getByLabelText('Edit message text');

    expect(editor).toHaveFocus();
    expect(editor).toHaveValue('Editable text');

    await user.clear(editor);
    await user.type(editor, 'Edited text');
    await user.click(screen.getByRole('button', { name: 'Save message' }));

    expect(onEditMessage).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Editable text' }),
      'Edited text'
    );
    expect(screen.queryByLabelText('Edit message text')).toBeNull();
    expect(screen.getByRole('button', { name: 'Edit message' })).toHaveFocus();
  });

  it('Chat_Edit_ShouldSaveWithEnter', async () => {
    const user = userEvent.setup();
    const onEditMessage = jest.fn();

    render(<Chat messages={[editableMessage]} editable onEditMessage={onEditMessage} />);

    await user.click(screen.getByRole('button', { name: 'Edit message' }));

    const editor = screen.getByLabelText('Edit message text');

    await user.clear(editor);
    await user.type(editor, 'Enter text{Enter}');

    expect(onEditMessage).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Editable text' }),
      'Enter text'
    );
  });

  it('Chat_Edit_ShouldCancelWithEscapeAndRestoreFocus', async () => {
    const user = userEvent.setup();
    const onEditMessage = jest.fn();

    render(<Chat messages={[editableMessage]} editable onEditMessage={onEditMessage} />);

    const trigger = screen.getByRole('button', { name: 'Edit message' });

    await user.click(trigger);

    const editor = screen.getByLabelText('Edit message text');

    await user.clear(editor);
    await user.type(editor, 'Discarded');
    await user.keyboard('{Escape}');

    expect(onEditMessage).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Edit message text')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('Chat_Edit_ShouldCancelWithButton', async () => {
    const user = userEvent.setup();
    const onEditMessage = jest.fn();

    render(<Chat messages={[editableMessage]} editable onEditMessage={onEditMessage} />);

    await user.click(screen.getByRole('button', { name: 'Edit message' }));
    await user.click(screen.getByRole('button', { name: 'Cancel editing' }));

    expect(onEditMessage).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Edit message text')).toBeNull();
    expect(screen.getByRole('button', { name: 'Edit message' })).toHaveFocus();
  });

  it('Chat_Edit_ShouldIgnoreEmptyText', async () => {
    const user = userEvent.setup();
    const onEditMessage = jest.fn();

    render(<Chat messages={[editableMessage]} editable onEditMessage={onEditMessage} />);

    await user.click(screen.getByRole('button', { name: 'Edit message' }));
    await user.clear(screen.getByLabelText('Edit message text'));
    await user.click(screen.getByRole('button', { name: 'Save message' }));

    expect(onEditMessage).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Edit message text')).toBeInTheDocument();
  });

  it('Chat_Edit_ShouldRespectCanEdit', () => {
    render(
      <Chat
        messages={[editableMessage, { id: 'editable-2', message: 'Locked', sender: 'Jane Roe' }]}
        editable
        onEditMessage={jest.fn()}
        canEdit={(message) => message.id === 'editable-1'}
      />
    );

    expect(screen.getAllByRole('button', { name: 'Edit message' })).toHaveLength(1);
  });

  it('Chat_Edit_ShouldShowEditedIndicator', () => {
    render(<Chat messages={[{ ...editableMessage, edited: true }]} />);

    expect(screen.getByText('edited')).toHaveClass('nebular-chat-message-edited');
  });
});

describe('Chat message deletion', () => {
  const deletableMessage: ChatMessageType = {
    id: 'deletable-1',
    message: 'Delete me',
    sender: 'John Doe'
  };

  it('Chat_Delete_ShouldRenderActionOnlyWhenEnabled', () => {
    const { rerender } = render(<Chat messages={[deletableMessage]} />);

    expect(screen.queryByRole('button', { name: 'Delete message' })).toBeNull();

    rerender(<Chat messages={[deletableMessage]} deletable />);

    expect(screen.queryByRole('button', { name: 'Delete message' })).toBeNull();

    rerender(<Chat messages={[deletableMessage]} deletable onDeleteMessage={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Delete message' })).toBeInTheDocument();
  });

  it('Chat_Delete_ShouldConfirmAndCallHandler', async () => {
    const user = userEvent.setup();
    const onDeleteMessage = jest.fn();

    render(<Chat messages={[deletableMessage]} deletable onDeleteMessage={onDeleteMessage} />);

    await user.click(screen.getByRole('button', { name: 'Delete message' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Delete message' });

    expect(dialog).toHaveTextContent('Delete this message?');
    expect(screen.getByRole('button', { name: 'Cancel deletion' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Confirm deletion' }));

    expect(onDeleteMessage).toHaveBeenCalledWith(expect.objectContaining({ message: 'Delete me' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Delete message' })).toHaveFocus();
  });

  it('Chat_Delete_ShouldCancelWithEscapeAndRestoreFocus', async () => {
    const user = userEvent.setup();
    const onDeleteMessage = jest.fn();

    render(<Chat messages={[deletableMessage]} deletable onDeleteMessage={onDeleteMessage} />);

    const trigger = screen.getByRole('button', { name: 'Delete message' });

    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(onDeleteMessage).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });
});

describe('Chat reactions', () => {
  const reactionMessage: ChatMessageType = {
    id: 'reaction-1',
    message: 'React to me',
    sender: 'John Doe',
    reactions: [
      { emoji: '👍', users: ['Jane Roe', 'John Doe'] },
      { emoji: '❤️', users: ['Jane Roe'] },
      { emoji: '🎉', users: ['John Doe'] }
    ]
  };

  it('Chat_Reactions_ShouldRenderChipsWithCountAndPressedState', () => {
    render(
      <Chat messages={[reactionMessage]} currentUser="Jane Roe" onReactionToggle={jest.fn()} />
    );

    const thumbs = screen.getByRole('button', { name: 'Toggle 👍 reaction (2)' });

    expect(thumbs).toHaveAttribute('aria-pressed', 'true');
    expect(thumbs.textContent).toBe('👍2');
    expect(screen.getByRole('button', { name: 'Toggle ❤️ reaction (1)' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Toggle 🎉 reaction (1)' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('Chat_Reactions_ShouldToggleFromChip', async () => {
    const user = userEvent.setup();
    const onReactionToggle = jest.fn();

    render(
      <Chat
        messages={[reactionMessage]}
        currentUser="John Doe"
        onReactionToggle={onReactionToggle}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Toggle ❤️ reaction (1)' }));

    expect(onReactionToggle).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'React to me' }),
      '❤️'
    );
  });

  it('Chat_Reactions_ShouldRenderReadOnlyChipsWithoutHandler', () => {
    render(<Chat messages={[reactionMessage]} />);

    expect(screen.queryByRole('button', { name: /Toggle .* reaction/ })).toBeNull();
    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('Chat_Reactions_ShouldOpenPickerAndToggleQuickReaction', async () => {
    const user = userEvent.setup();
    const onReactionToggle = jest.fn();

    render(
      <Chat
        messages={[{ id: 'r1', message: 'Pick a reaction' }]}
        onReactionToggle={onReactionToggle}
      />
    );

    const trigger = screen.getByRole('button', { name: 'Add reaction' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: 'Reactions' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'React with 👍' })).toHaveFocus();
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);

    await user.click(screen.getByRole('menuitem', { name: 'React with 😂' }));

    expect(onReactionToggle).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Pick a reaction' }),
      '😂'
    );
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('Chat_Reactions_ShouldSupportKeyboardNavigationAndEscape', async () => {
    const user = userEvent.setup();

    render(<Chat messages={[{ message: 'Keyboard' }]} onReactionToggle={jest.fn()} />);

    const trigger = screen.getByRole('button', { name: 'Add reaction' });

    await user.click(trigger);
    expect(screen.getByRole('menuitem', { name: 'React with 👍' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('menuitem', { name: 'React with ❤️' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('menuitem', { name: 'React with 👍' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('Chat_Reactions_ShouldUseCustomQuickReactions', async () => {
    const user = userEvent.setup();

    render(
      <Chat
        messages={[{ message: 'Custom quick' }]}
        onReactionToggle={jest.fn()}
        quickReactions={['🔥']}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add reaction' }));

    expect(screen.getByRole('menuitem', { name: 'React with 🔥' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'React with 👍' })).toBeNull();
  });

  it('Chat_Reactions_ShouldRenderCustomPicker', async () => {
    const user = userEvent.setup();
    const onReactionToggle = jest.fn();

    render(
      <Chat
        messages={[{ message: 'Custom picker' }]}
        onReactionToggle={onReactionToggle}
        renderReactionPicker={({ onToggleReaction }) => (
          <button type="button" onClick={() => onToggleReaction('🎉')}>
            Party
          </button>
        )}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add reaction' }));
    await user.click(screen.getByRole('button', { name: 'Party' }));

    expect(onReactionToggle).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Custom picker' }),
      '🎉'
    );
    expect(screen.queryByRole('button', { name: 'Party' })).toBeNull();
  });
});

describe('Chat virtualization', () => {
  const manyMessages = (count: number): ChatMessageType[] =>
    Array.from({ length: count }, (_, index) => ({
      id: `message-${index + 1}`,
      message: `Message ${index + 1}`,
      sender: index % 2 ? 'Jane Roe' : 'John Doe',
      date: new Date('2026-11-18T12:30:00.000Z')
    }));

  const virtualMessages = manyMessages(20);

  const virtualProps = { virtualize: true, height: 200, itemHeight: 50, overscan: 1 };

  const getScrollable = (container: HTMLElement) =>
    container.querySelector('.nebular-chat-scrollable') as HTMLElement;

  it('Chat_Virtualize_ShouldRenderWindowAtBottomOnFirstRender', () => {
    const { container } = render(<Chat messages={virtualMessages} {...virtualProps} />);

    const scrollable = getScrollable(container);
    const spacers = container.querySelectorAll('.nebular-chat-spacer');

    expect(scrollable.style.height).toBe('200px');
    expect(scrollable.scrollTop).toBe(800);
    expect(screen.queryByText('Message 1')).toBeNull();
    expect(screen.getByText('Message 16')).toBeInTheDocument();
    expect(screen.getByText('Message 20')).toBeInTheDocument();
    expect(document.querySelectorAll('.nebular-chat-message-root')).toHaveLength(5);
    expect(spacers).toHaveLength(2);
    expect((spacers[0] as HTMLElement).style.height).toBe('750px');
    expect((spacers[1] as HTMLElement).style.height).toBe('0px');
  });

  it('Chat_Virtualize_ShouldUpdateWindowOnScroll', () => {
    const { container } = render(<Chat messages={virtualMessages} {...virtualProps} />);

    const scrollable = getScrollable(container);

    scrollable.scrollTop = 0;
    fireEvent.scroll(scrollable);

    expect(screen.getByText('Message 1')).toBeInTheDocument();
    expect(screen.queryByText('Message 20')).toBeNull();
    expect(document.querySelectorAll('.nebular-chat-message-root')).toHaveLength(5);

    let spacers = container.querySelectorAll('.nebular-chat-spacer');

    expect((spacers[0] as HTMLElement).style.height).toBe('0px');
    expect((spacers[1] as HTMLElement).style.height).toBe('750px');

    scrollable.scrollTop = 100;
    fireEvent.scroll(scrollable);

    expect(screen.getByText('Message 2')).toBeInTheDocument();
    expect(screen.queryByText('Message 1')).toBeNull();
    expect(document.querySelectorAll('.nebular-chat-message-root')).toHaveLength(6);

    spacers = container.querySelectorAll('.nebular-chat-spacer');
    expect((spacers[0] as HTMLElement).style.height).toBe('50px');
    expect((spacers[1] as HTMLElement).style.height).toBe('650px');
  });

  it('Chat_Virtualize_ShouldExposeSetSizeAndPosition', () => {
    render(<Chat messages={virtualMessages} {...virtualProps} />);

    const last = messageRoot('Message 20');
    const firstWindowed = messageRoot('Message 16');

    expect(last).toHaveAttribute('role', 'article');
    expect(last).toHaveAttribute('aria-setsize', '20');
    expect(last).toHaveAttribute('aria-posinset', '20');
    expect(firstWindowed).toHaveAttribute('aria-posinset', '16');
  });

  it('Chat_Virtualize_ShouldKeepThreadsTypingAndReceipts', async () => {
    const user = userEvent.setup();
    const threaded: ChatMessageType[] = [
      ...manyMessages(8),
      {
        id: 'threaded',
        message: 'With thread',
        sender: 'John Doe',
        threadId: 'thread-1',
        reply: true,
        readBy: ['Jane Roe']
      }
    ];

    render(
      <Chat
        messages={threaded}
        threads={{ 'thread-1': [{ message: 'Thread reply' }] }}
        typingUsers={['Ana']}
        virtualize
        height={300}
        itemHeight={50}
        overscan={0}
      />
    );

    expect(screen.getByRole('img', { name: 'Read by Jane Roe' })).toBeInTheDocument();
    expect(screen.getByText('Ana is typing…')).toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: /View thread/ });

    await user.click(trigger);

    expect(screen.getByRole('region', { name: 'View thread' })).toHaveTextContent('Thread reply');
  });

  it('Chat_Virtualize_ShouldNotJumpWhenScrollBottomIsDisabled', () => {
    const { container } = render(
      <Chat messages={virtualMessages} {...virtualProps} scrollBottom={false} />
    );

    expect(getScrollable(container).scrollTop).toBe(0);
    expect(screen.getByText('Message 1')).toBeInTheDocument();
    expect(screen.queryByText('Message 20')).toBeNull();
  });

  it('Chat_Virtualize_ShouldScrollToEndWhenMessagesChange', () => {
    const { container, rerender } = render(<Chat messages={virtualMessages} {...virtualProps} />);

    const scrollable = getScrollable(container);

    expect(scrollable.scrollTop).toBe(800);

    rerender(
      <Chat
        messages={[...virtualMessages, { id: 'extra', message: 'Message 21' }]}
        {...virtualProps}
      />
    );

    expect(scrollable.scrollTop).toBe(850);
    expect(screen.getByText('Message 21')).toBeInTheDocument();
  });

  it('Chat_Virtualize_ShouldWindowFilteredResults', async () => {
    const user = userEvent.setup();

    render(<Chat messages={virtualMessages} {...virtualProps} searchable />);

    await user.type(screen.getByPlaceholderText('Search messages'), 'Message 2');

    expect(screen.getByText('2 de 20')).toBeInTheDocument();
    expect(messageText('Message 2')).not.toBeUndefined();
    expect(messageText('Message 20')).not.toBeUndefined();
    expect(messageRoot('Message 2')).toHaveAttribute('aria-setsize', '2');
  });

  it('Chat_Virtualize_ShouldRenderAllMessagesWhenDisabled', () => {
    const { container } = render(<Chat messages={virtualMessages} />);

    expect(document.querySelectorAll('.nebular-chat-message-root')).toHaveLength(20);
    expect(container.querySelector('.nebular-chat-spacer')).toBeNull();
  });
});

describe('Chat accessibility', () => {
  it('ChatForm_Button_ShouldHaveAccessibleName', () => {
    render(<ChatForm onSend={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('Chat_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Chat title="Support" messages={messages} chatFrom={<ChatForm onSend={jest.fn()} />} />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('Chat_A11y_ShouldHaveNoViolationsWithThreadsTypingAndReceipts', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Chat
        title="Support"
        messages={[
          {
            id: 'm1',
            message: 'Kickoff',
            sender: 'John Doe',
            threadId: 'thread-1',
            reply: true,
            readBy: ['Jane Roe']
          }
        ]}
        threads={{ 'thread-1': [{ message: 'Thread reply', sender: 'Jane Roe' }] }}
        threadLabel="Ver thread"
        typingUsers={['Ana', 'Bia']}
        readStatus="read"
        readLabel={(users) => `Lida por ${users.join(', ')}`}
      />
    );

    await user.click(screen.getByRole('button', { name: /Ver thread/ }));

    expect(await axe(container)).toHaveNoViolations();
  });

  it('Chat_A11y_ShouldHaveNoViolationsWithSearchEditingAndReactions', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Chat
        messages={[
          {
            id: 'a11y-1',
            message: 'Hello team',
            sender: 'John Doe',
            reactions: [{ emoji: '👍', users: ['Jane Roe'] }]
          }
        ]}
        searchable
        editable
        deletable
        currentUser="Jane Roe"
        onEditMessage={jest.fn()}
        onDeleteMessage={jest.fn()}
        onReactionToggle={jest.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText('Search messages'), 'hello');
    await user.click(screen.getByRole('button', { name: 'Add reaction' }));

    expect(await axe(container)).toHaveNoViolations();
  });

  it('Chat_A11y_ShouldHaveNoViolationsWithDeleteDialog', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Chat
        messages={[{ id: 'a11y-2', message: 'Delete me', sender: 'John Doe' }]}
        deletable
        onDeleteMessage={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Delete message' }));

    expect(await axe(container)).toHaveNoViolations();
  });

  it('Chat_A11y_ShouldHaveNoViolationsWhenVirtualized', async () => {
    const { container } = render(
      <Chat
        messages={Array.from({ length: 20 }, (_, index) => ({
          message: `Message ${index + 1}`,
          sender: index % 2 ? 'Jane Roe' : 'John Doe'
        }))}
        virtualize
        height={200}
        itemHeight={50}
        overscan={1}
        searchable
        typingUsers={['Ana']}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
