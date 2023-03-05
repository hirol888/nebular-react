/* eslint-disable react/jsx-no-target-blank */
import React, { useRef, useState } from 'react';
import { Chat } from './Chat';
import { ChatForm, FileExt } from './ChatForm';
import { ChatMessageType } from './types';
import { Button } from '../Button';

export default { title: 'Chat' };

const messages: ChatMessageType[] = [
  {
    message:
      'Hello, how are you? This should be a very long message so that we can test how it fit into the screen.',
    reply: false,
    date: new Date(),
    sender: 'John Doe',
    avatar: 'https://i.gifer.com/no.gif'
  },
  {
    message:
      'Hello, how are you? This should be a very long message so that we can test how it fit into the screen.',
    reply: true,
    date: new Date(),
    sender: 'John Doe',
    avatar: 'https://i.gifer.com/no.gif'
  },
  {
    message: 'Hello, how are you?',
    reply: false,
    date: new Date(),
    sender: 'John Doe',
    avatar: ''
  },
  {
    message: 'Hey looks at that pic I just found!',
    reply: false,
    date: new Date(),
    type: 'file',
    files: [
      {
        url: 'https://i.gifer.com/no.gif',
        type: 'image/jpeg',
        icon: false
      }
    ],
    sender: 'John Doe',
    avatar: ''
  },
  {
    message: 'What do you mean by that?',
    reply: false,
    date: new Date(),
    type: 'quote',
    quote:
      'Hello, how are you? This should be a very long message so that we can test how it fit into the screen.',
    sender: 'John Doe',
    avatar: ''
  },
  {
    message: 'Attached is an archive I mentioned',
    reply: true,
    date: new Date(),
    type: 'file',
    files: [
      {
        url: 'https://i.gifer.com/no.gif',
        icon: 'file-text-outline'
      }
    ],
    sender: 'John Doe',
    avatar: ''
  },
  {
    message: 'Meet me there',
    reply: false,
    date: new Date(),
    type: 'map',
    latitude: 40.714728,
    longitude: -73.998672,
    sender: 'John Doe'
  }
];

const botAvatar: string =
  'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png';

const gifsLinks: string[] = [
  'https://media.tenor.com/images/ac287fd06319e47b1533737662d5bfe8/tenor.gif',
  'https://i.gifer.com/no.gif',
  'https://techcrunch.com/wp-content/uploads/2015/08/safe_image.gif',
  'http://www.reactiongifs.com/r/wnd1.gif'
];
const imageLinks: string[] = [
  'https://picsum.photos/320/240/?image=357',
  'https://picsum.photos/320/240/?image=556',
  'https://picsum.photos/320/240/?image=339',
  'https://picsum.photos/320/240/?image=387',
  'https://picsum.photos/320/240/?image=30',
  'https://picsum.photos/320/240/?image=271'
];
const fileLink: string = 'http://google.com';

const botReplies = [
  {
    regExp: /([H,h]ey)|([H,h]i)/g,
    answerArray: ['Hello!', 'Yes?', 'Yes, milord?', 'What can I do for you?'],
    type: 'text',
    reply: {
      message: '',
      type: 'text',
      reply: false,
      date: new Date(),
      sender: 'Bot',
      avatar: botAvatar
    }
  },
  {
    regExp: /([H,h]elp)/g,
    answerArray: [
      `No problem! Try sending a message containing word "hey", "image",
    "gif", "file", "map", "quote", "file group" to see different message components`
    ],
    type: 'text',
    reply: {
      message: '',
      type: 'text',
      reply: false,
      date: new Date(),
      sender: 'Bot',
      avatar: botAvatar
    }
  },
  {
    regExp: /([I,i]mage)|(IMAGE)|([P,p]ic)|(Picture)/g,
    answerArray: ['Hey look at this!', 'Ready to work', 'Yes, master.'],
    type: 'pic',
    reply: {
      message: '',
      reply: false,
      date: new Date(),
      type: 'file',
      files: [
        {
          url: '',
          type: 'image/jpeg'
        }
      ],
      sender: 'Bot',
      avatar: botAvatar
    }
  },
  {
    regExp: /([G,g]if)|(GIF)/g,
    type: 'gif',
    answerArray: ['No problem', 'Well done', 'You got it man'],
    reply: {
      message: '',
      reply: false,
      date: new Date(),
      type: 'file',
      files: [
        {
          url: '',
          type: 'image/gif'
        }
      ],
      sender: 'Bot',
      avatar: botAvatar
    }
  },
  {
    regExp: /([F,f]ile group)|(FILE)/g,
    type: 'group',
    answerArray: ['Take it!', 'Job Done.', 'As you wish'],
    reply: {
      message: '',
      reply: false,
      date: new Date(),
      type: 'file',
      files: [
        {
          url: fileLink,
          icon: 'file-text-outline'
        },
        {
          url: '',
          type: 'image/gif'
        },
        {
          url: '',
          type: 'image/jpeg'
        }
      ],
      icon: 'file-text-outline',
      sender: 'Bot',
      avatar: botAvatar
    }
  },
  {
    regExp: /([F,f]ile)|(FILE)/g,
    type: 'file',
    answerArray: ['Take it!', 'Job Done.', 'As you wish'],
    reply: {
      message: '',
      reply: false,
      date: new Date(),
      type: 'file',
      files: [
        {
          url: fileLink,
          icon: 'file-text-outline'
        }
      ],
      icon: 'file-text-outline',
      sender: 'Bot',
      avatar: botAvatar
    }
  },
  {
    regExp: /([M,m]ap)|(MAP)/g,
    type: 'map',
    answerArray: ['Done.', 'My sight is yours.', 'I shall be your eyes.'],
    reply: {
      message: '',
      reply: false,
      date: new Date(),
      type: 'map',
      latitude: 53.914321,
      longitude: 27.5998355,
      sender: 'Bot',
      avatar: botAvatar
    }
  },
  {
    regExp: /([Q,q]uote)|(QUOTE)/g,
    type: 'quote',
    answerArray: ['Quoted!', 'Say no more.', 'I gladly obey.'],
    reply: {
      message: '',
      reply: false,
      date: new Date(),
      type: 'quote',
      quote: '',
      sender: 'Bot',
      avatar: botAvatar
    }
  },
  {
    regExp: /(.*)/g,
    answerArray: ['Hello there! Try typing "help"'],
    type: 'text',
    reply: {
      message: '',
      type: 'text',
      reply: false,
      date: new Date(),
      sender: 'Bot',
      avatar: botAvatar
    }
  }
];

const reply = (message: string) => {
  const botReply = botReplies.find((r) => message.search(r.regExp) !== -1);

  if (botReply.reply.type === 'quote') {
    botReply.reply.quote = message;
  }

  if (botReply.type === 'gif') {
    botReply.reply.files[0].url = gifsLinks[Math.floor(Math.random() * gifsLinks.length)];
  }

  if (botReply.type === 'pic') {
    botReply.reply.files[0].url = imageLinks[Math.floor(Math.random() * imageLinks.length)];
  }

  if (botReply.type === 'group') {
    botReply.reply.files[1].url = gifsLinks[Math.floor(Math.random() * gifsLinks.length)];
    botReply.reply.files[2].url = imageLinks[Math.floor(Math.random() * imageLinks.length)];
  }

  botReply.reply.message =
    botReply.answerArray[Math.floor(Math.random() * botReply.answerArray.length)];
  return { ...botReply.reply };
};

export function Showcase() {
  const [_messages, setMessages] = useState<ChatMessageType[]>(messages);

  const sendMessage = ({ message, files }: { message: string; files: FileExt[] }) => {
    const _files = !files
      ? []
      : files.map((file) => ({
          url: file.src,
          type: file.type,
          icon: 'file-text-outline'
        }));

    setMessages((current) => [
      ...current,
      {
        message,
        date: new Date(),
        reply: true,
        type: files.length ? 'file' : 'text',
        files: _files,
        sender: 'John Doe',
        avatar: 'https://i.gifer.com/no.gif'
      }
    ]);
    const botReply = reply(message);
    if (botReply) {
      setTimeout(() => setMessages((current) => [...current, botReply]), 500);
    }
  };

  return (
    <Chat
      title="Nebular Conversational UI"
      size="large"
      messages={_messages}
      style={{ width: '500px' }}
      chatFrom={<ChatForm onSend={(body) => sendMessage(body)} dropFiles />}
    />
  );
}

export function Colors() {
  const chats = [
    {
      status: 'success',
      title: 'Nebular Conversational UI Success',
      messages: [
        {
          message: 'Success!',
          date: new Date(),
          reply: false,
          sender: 'Bot',
          avatar:
            'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png'
        }
      ]
    },
    {
      status: 'danger',
      title: 'Nebular Conversational UI Danger',
      messages: [
        {
          message: 'Danger!',
          date: new Date(),
          reply: false,
          sender: 'Bot',
          avatar:
            'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png'
        }
      ]
    },
    {
      status: 'primary',
      title: 'Nebular Conversational UI Primary',
      messages: [
        {
          message: 'Primary!',
          date: new Date(),
          reply: false,
          sender: 'Bot',
          avatar:
            'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png'
        }
      ]
    },
    {
      status: 'info',
      title: 'Nebular Conversational UI Info',
      messages: [
        {
          message: 'Info!',
          date: new Date(),
          reply: false,
          sender: 'Bot',
          avatar:
            'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png'
        }
      ]
    },
    {
      status: 'warning',
      title: 'Nebular Conversational UI Warning',
      messages: [
        {
          message: 'Warning!',
          date: new Date(),
          reply: false,
          sender: 'Bot',
          avatar:
            'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png'
        }
      ]
    }
  ];

  return (
    <>
      {chats.map((chat, index) => (
        <Chat
          key={`color-${index}`}
          title={chat.title}
          status={chat.status}
          size="small"
          messages={chat.messages}
          style={{ width: '500px' }}
          chatFrom={<ChatForm />}
        />
      ))}
    </>
  );
}

export function ChatConversationShowcase() {
  const [_messages, setMessages] = useState<ChatMessageType[]>([]);

  const sendMessage = (
    { message, files }: { message: string; files: FileExt[] },
    userName: string,
    avatar: string,
    _reply: boolean
  ) => {
    const _files = files
      ? []
      : files.map((f) => ({
          url: f.src,
          type: f.type,
          icon: 'file-text-outline'
        }));

    setMessages((current) => [
      ...current,
      {
        message,
        date: new Date(),
        reply: _reply,
        type: _files.length ? 'file' : 'text',
        files: _files,
        sender: userName,
        avatar
      }
    ]);
  };

  const _messagesJohn = _messages.map((m) => ({ ...m, reply: !m.reply }));

  return (
    <div style={{ display: 'flex' }}>
      <Chat
        title="Jake"
        size="medium"
        status="warning"
        messages={_messages}
        style={{ width: '300px', margin: '1rem' }}
        chatFrom={
          <ChatForm
            onSend={(body) =>
              sendMessage(body, 'Jake', 'http://www.reactiongifs.com/r/wnd1.gif', true)
            }
            showButton={false}
            dropFiles
          />
        }
      />
      <Chat
        title="John"
        size="medium"
        status="success"
        messages={_messagesJohn}
        style={{ width: '300px', margin: '1rem' }}
        chatFrom={
          <ChatForm
            onSend={(body) => sendMessage(body, 'John', 'https://i.gifer.com/no.gif', false)}
            showButton={false}
            dropFiles
          />
        }
      />
    </div>
  );
}

export function CustomMessage() {
  const CustomTable = ({
    columns,
    rows
  }: {
    columns: string[];
    rows: { firstName: string; lastName: string; age: number }[];
  }) => (
    <table style={{ width: '100%', textAlign: 'left' }}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th>{column}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr>
            <td>{row.firstName}</td>
            <td>{row.lastName}</td>
            <td>{row.age}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const tableData = {
    columns: ['First Name', 'Last Name', 'Age'],
    rows: [
      { firstName: 'Robert', lastName: 'Baratheon', age: 46 },
      { firstName: 'Jaime', lastName: 'Lannister', age: 31 }
    ]
  };

  const customMessages: ChatMessageType[] = [
    {
      type: 'text',
      message: 'Now you able to use links!',
      customMessage: (
        <a href="https://github.com/hirol888/nebular-react" target="_blank">
          Go to Nebular
        </a>
      ),
      reply: false,
      date: new Date(),
      sender: 'Frodo Baggins',
      avatar: 'https://i.gifer.com/no.gif'
    },
    {
      customMessage: (
        <a href="https://github.com/hirol888/nebular-react" target="_blank">
          Go to Nebular Demo
        </a>
      ),
      reply: true,
      date: new Date(),
      sender: 'Meriadoc Brandybuck',
      avatar: 'https://i.gifer.com/no.gif'
    },
    {
      customMessage: (
        <>
          <p className="text-control" style={{ marginTop: 0 }}>
            Wow! Button in a message!
          </p>
          <Button status="control" onClick={() => scrollToBottom()}>
            Click to scroll down
          </Button>
        </>
      ),
      reply: false,
      date: new Date(),
      sender: 'Gimli Gloin',
      avatar: ''
    },
    {
      type: 'text',
      message: "Now let's try to add a table",
      customMessage: <CustomTable columns={tableData.columns} rows={tableData.rows} />,
      customMessageFullWidth: true,
      reply: false,
      date: new Date(),
      sender: 'Fredegar Bolger',
      avatar: 'https://i.gifer.com/no.gif'
    },
    {
      type: 'text',
      message: 'And one more table but now in the reply',
      customMessage: <CustomTable columns={tableData.columns} rows={tableData.rows} />,
      customMessageFullWidth: true,
      reply: true,
      date: new Date(),
      sender: 'Fredegar Bolger',
      avatar: 'https://i.gifer.com/no.gif'
    }
  ];

  const [_customMessages, setCustomMessages] = useState<ChatMessageType[]>(customMessages);
  const chatRef = useRef<HTMLDivElement>(null);

  const sendMessage = ({ message }: { message: string; files: FileExt[] }) => {
    setCustomMessages((current) => [
      ...current,
      {
        message,
        date: new Date(),
        reply: true,
        type: 'text',
        sender: 'Gandalf the Gray',
        avatar: 'https://i.gifer.com/no.gif'
      }
    ]);
  };

  const scrollToBottom = () => {
    const messagesEnd = chatRef.current?.querySelector('#messagesEnd');
    if (messagesEnd) {
      messagesEnd.scrollIntoView();
    }
  };

  return (
    <Chat
      title="Nebular Conversational UI"
      size="large"
      scrollBottom={false}
      messages={_customMessages}
      ref={chatRef}
      style={{ width: '500px' }}
      chatFrom={<ChatForm onSend={(body) => sendMessage(body)} dropFiles={false} />}
    />
  );
}

export function ChatDrop() {
  const dropMessages: ChatMessageType[] = [
    {
      type: 'text',
      message: 'Drag & drop a file or a group of files.',
      date: new Date(),
      reply: true,
      sender: 'Bot',
      avatar: 'https://i.gifer.com/no.gif'
    }
  ];

  const [_dropMessages, setDropMessages] = useState<ChatMessageType[]>(dropMessages);

  const sendMessage = ({ message, files }: { message: string; files: FileExt[] }) => {
    const _files = !files
      ? []
      : files.map((f) => ({
          url: f.src,
          type: f.type,
          icon: 'file-text-outline'
        }));

    setDropMessages((current) => [
      ...current,
      {
        message,
        date: new Date(),
        files: _files,
        type: _files.length ? 'file' : 'text',
        reply: true,
        sender: 'John Doe',
        avatar: 'https://i.gifer.com/no.gif'
      }
    ]);
  };

  return (
    <Chat
      title="Drag & Drop chat"
      size="medium"
      messages={_dropMessages}
      style={{ width: '500px' }}
      chatFrom={<ChatForm onSend={(body) => sendMessage(body)} dropFiles />}
    />
  );
}

export function MessageTypes() {
  const msgs = [
    {
      message: 'Gif message',
      type: 'file',
      sender: 'John Doe',
      reply: true,
      date: new Date(),
      files: [{ url: 'http://www.reactiongifs.com/r/wnd1.gif', type: 'image/gif' }],
      avatar: 'https://i.gifer.com/no.gif'
    },
    {
      message: 'Image message',
      type: 'file',
      sender: 'John Doe',
      reply: true,
      date: new Date(),
      files: [{ url: 'https://picsum.photos/320/240/?image=387', type: 'image/jpeg' }],
      avatar: 'https://i.gifer.com/no.gif'
    },
    {
      message: 'Map message',
      type: 'map',
      sender: 'John Doe',
      reply: true,
      date: new Date(),
      latitude: 53.914322,
      longitude: 277.5998355,
      avatar: 'https://i.gifer.com/no.gif'
    },
    {
      message: 'File message',
      type: 'file',
      sender: 'John Doe',
      reply: true,
      date: new Date(),
      files: [{ url: 'http://google.com', icon: 'file-text-outline' }],
      avatar: 'https://i.gifer.com/no.gif'
    },
    {
      message: 'Quote message',
      type: 'quote',
      sender: 'John Doe',
      reply: true,
      date: new Date(),
      quote: 'Quotted message here',
      avatar: 'https://i.gifer.com/no.gif'
    },
    {
      message: 'Group of files message',
      type: 'file',
      sender: 'John Doe',
      reply: true,
      date: new Date(),
      files: [
        { url: 'http://google.com', icon: 'file-text-outline' },
        { url: 'https://picsum.photos/320/240/?image=387', type: 'image/jpeg' },
        { url: 'http://www.reactiongifs.com/r/wnd1.gif', type: 'image/gif' }
      ],
      avatar: 'https://i.gifer.com/no.gif'
    }
  ];
  return <Chat title="Message Types" size="large" messages={msgs} style={{ width: '500px' }} />;
}

export function Sizes() {
  return (
    <div style={{ display: 'flex' }}>
      <Chat title="Tiny" size="tiny" style={{ width: '300px', margin: '1rem' }} />
      <Chat title="Small" size="small" style={{ width: '300px', margin: '1rem' }} />
      <Chat title="medium" size="medium" style={{ width: '300px', margin: '1rem' }} />
      <Chat title="Large" size="large" style={{ width: '300px', margin: '1rem' }} />
      <Chat title="Giant" size="giant" style={{ width: '300px', margin: '1rem' }} />
    </div>
  );
}
