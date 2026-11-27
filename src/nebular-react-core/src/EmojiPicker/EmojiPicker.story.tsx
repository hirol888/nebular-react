import React, { useState } from 'react';
import { Card } from '../Card';
import { EmojiPicker } from './EmojiPicker';

export default { title: 'EmojiPicker', component: EmojiPicker };

export function Showcase() {
  const [emoji, setEmoji] = useState<string | null>('😀');

  return (
    <Card size="large">
      <Card.Body>
        <EmojiPicker
          label="Emoji"
          description="Pick an emoji to use as a reaction"
          value={emoji}
          onChange={(nextEmoji) => setEmoji(nextEmoji)}
        />
        <div style={{ marginTop: 16 }}>
          {emoji ? `Selected emoji: ${emoji}` : 'No emoji selected'}
        </div>
      </Card.Body>
    </Card>
  );
}

export function SearchAndCategories() {
  const [emoji, setEmoji] = useState<string | null>(null);

  return (
    <Card size="large">
      <Card.Body>
        <EmojiPicker
          label="Reaction"
          description="Search by name or keyword, or browse the categories"
          searchable
          nothingFoundMessage="No emoji matches your search"
          value={emoji}
          onChange={(nextEmoji) => setEmoji(nextEmoji)}
        />
      </Card.Body>
    </Card>
  );
}

export function Clearable() {
  const [emoji, setEmoji] = useState<string | null>('🚀');

  return (
    <Card size="large">
      <Card.Body>
        <EmojiPicker
          label="Launch emoji"
          description="Use the clear button to reset the selection"
          clearable
          value={emoji}
          onChange={(nextEmoji) => setEmoji(nextEmoji)}
        />
        <div style={{ marginTop: 16 }}>{emoji ?? 'Nothing selected'}</div>
      </Card.Body>
    </Card>
  );
}
