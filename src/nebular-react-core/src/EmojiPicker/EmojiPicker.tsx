import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularDir,
  useNebularLocale
} from '@nebular-react/styles';
import {
  useFlexibleConnectedPositionStrategy,
  useId,
  useOverlay,
  useOverlayClickOutside,
  useOverlayTrigger
} from '@nebular-react/hooks';
import { FormControl } from '../FormControl';
import { Input } from '../Input';
import { OptionalPortal } from '../OptionalPortal';

export type EmojiCategoryName = 'smileys' | 'people' | 'nature' | 'food' | 'objects' | 'symbols';

export interface EmojiItem {
  emoji: string;
  name: string;
  keywords?: string[];
  category: string;
}

export interface EmojiCategory {
  id: string;
  label: string;
  emojis: EmojiItem[];
}

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    width: '100%'
  },

  input: {
    cursor: 'pointer',

    '&[disabled]': {
      cursor: 'not-allowed'
    }
  },

  clearButton: {
    position: 'absolute',
    top: '50%',
    right: '0.5rem',
    transform: 'translateY(-50%)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.15rem',
    border: 0,
    background: 'transparent',
    color: 'var(--emoji-picker-clear-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',
    zIndex: 1,

    '&:focus-visible': {
      outline: '2px solid var(--emoji-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--emoji-picker-min-width, 20rem)',
    backgroundColor: 'var(--emoji-picker-background-color, var(--background-basic-color-1, #fff))',
    border: '1px solid var(--emoji-picker-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--emoji-picker-border-radius, 0.25rem)',
    boxShadow: 'var(--emoji-picker-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))',
    overflow: 'hidden',

    '&:focus': {
      outline: 'none'
    },

    '&:focus-visible': {
      outline: '2px solid var(--emoji-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  searchContainer: {
    padding: '0.5rem',
    borderBottom: '1px solid var(--emoji-picker-border-color, var(--border-basic-color-3, #e4e9f2))'
  },

  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.35rem 0.5rem',
    border:
      '1px solid var(--emoji-picker-search-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--emoji-picker-search-border-radius, 0.25rem)',
    backgroundColor:
      'var(--emoji-picker-search-background-color, var(--background-basic-color-1, #fff))',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',

    '&:focus-visible': {
      outline: '2px solid var(--emoji-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  categories: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    padding: '0.35rem 0.5rem',
    borderBottom: '1px solid var(--emoji-picker-border-color, var(--border-basic-color-3, #e4e9f2))'
  },

  category: {
    padding: '0.15rem 0.5rem',
    border:
      '1px solid var(--emoji-picker-category-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--emoji-picker-category-border-radius, 999px)',
    backgroundColor: 'transparent',
    color: 'var(--emoji-picker-category-color, var(--text-hint-color, #8f9bb3))',
    font: 'inherit',
    fontSize: '0.75rem',
    cursor: 'pointer',

    '&[aria-pressed="true"]': {
      backgroundColor:
        'var(--emoji-picker-category-active-background-color, var(--color-primary-500, #3366ff))',
      borderColor:
        'var(--emoji-picker-category-active-border-color, var(--color-primary-500, #3366ff))',
      color: 'var(--emoji-picker-category-active-color, #fff)'
    },

    '&:focus-visible': {
      outline: '2px solid var(--emoji-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  listbox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(2.25rem, 1fr))',
    alignContent: 'start',
    gap: '0.125rem',
    maxHeight: 'var(--emoji-picker-list-max-height, 16rem)',
    overflowY: 'auto',
    padding: '0.35rem',

    '&:focus': {
      outline: 'none'
    },

    '&:focus-visible': {
      outline: '2px solid var(--emoji-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  option: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: 'var(--emoji-picker-option-border-radius, 0.25rem)',
    fontSize: '1.25rem',
    lineHeight: 1,
    cursor: 'pointer',

    '&[data-active="true"]': {
      backgroundColor:
        'var(--emoji-picker-option-active-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&[aria-selected="true"]': {
      backgroundColor:
        'var(--emoji-picker-option-selected-background-color, var(--background-basic-color-2, #f7f9fc))',
      boxShadow: 'inset 0 0 0 2px var(--color-primary-500, #3366ff)'
    },

    '&:focus-visible': {
      outline: '2px solid var(--emoji-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  empty: {
    padding: '0.75rem 0.5rem',
    color: 'var(--emoji-picker-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.8125rem',
    textAlign: 'center'
  },

  announcement: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  }
}));

export type EmojiPickerStylesNames = Selectors<typeof useStyles>;

type EmojiSeed = [emoji: string, name: string, keywords: string];

const createEmojiItems = (category: EmojiCategoryName, seeds: EmojiSeed[]): EmojiItem[] =>
  seeds.map(([emoji, name, keywords]) => ({
    emoji,
    name,
    keywords: keywords.split(' '),
    category
  }));

const SMILEYS: EmojiSeed[] = [
  ['😀', 'Grinning face', 'grin happy smile'],
  ['😃', 'Grinning face with big eyes', 'grin happy smile'],
  ['😄', 'Grinning face with smiling eyes', 'grin happy smile'],
  ['😁', 'Beaming face with smiling eyes', 'grin happy smile'],
  ['😆', 'Grinning squinting face', 'laugh happy grin'],
  ['😅', 'Grinning face with sweat', 'sweat relief smile'],
  ['🤣', 'Rolling on the floor laughing', 'laugh funny rofl'],
  ['😂', 'Face with tears of joy', 'laugh joy tears'],
  ['🙂', 'Slightly smiling face', 'smile content'],
  ['🙃', 'Upside-down face', 'silly sarcasm'],
  ['😉', 'Winking face', 'wink flirt'],
  ['😊', 'Smiling face with smiling eyes', 'blush smile happy'],
  ['😇', 'Smiling face with halo', 'angel innocent'],
  ['🥰', 'Smiling face with hearts', 'love adore'],
  ['😍', 'Smiling face with heart-eyes', 'love crush'],
  ['🤩', 'Star-struck', 'excited star wow'],
  ['😘', 'Face blowing a kiss', 'kiss love'],
  ['😗', 'Kissing face', 'kiss'],
  ['😋', 'Face savoring food', 'yummy delicious'],
  ['😛', 'Face with tongue', 'tongue playful'],
  ['😜', 'Winking face with tongue', 'tongue wink playful'],
  ['🤪', 'Zany face', 'crazy silly'],
  ['😝', 'Squinting face with tongue', 'tongue squint'],
  ['🤑', 'Money-mouth face', 'money rich'],
  ['🤗', 'Hugging face', 'hug support'],
  ['🤭', 'Face with hand over mouth', 'giggle oops'],
  ['🤫', 'Shushing face', 'quiet secret'],
  ['🤔', 'Thinking face', 'think hmm'],
  ['🤐', 'Zipper-mouth face', 'silence secret'],
  ['🤨', 'Face with raised eyebrow', 'suspicious doubt'],
  ['😐', 'Neutral face', 'neutral blank'],
  ['😑', 'Expressionless face', 'blank annoyed'],
  ['😶', 'Face without mouth', 'silent speechless'],
  ['😏', 'Smirking face', 'smirk smug'],
  ['😒', 'Unamused face', 'annoyed bored'],
  ['🙄', 'Face with rolling eyes', 'annoyed eyes'],
  ['😬', 'Grimacing face', 'awkward nervous'],
  ['🤥', 'Lying face', 'lie pinocchio'],
  ['😌', 'Relieved face', 'calm relief'],
  ['😔', 'Pensive face', 'sad thoughtful']
];

const PEOPLE: EmojiSeed[] = [
  ['👋', 'Waving hand', 'wave hello goodbye'],
  ['🤚', 'Raised back of hand', 'hand stop'],
  ['✋', 'Raised hand', 'hand stop high five'],
  ['🖖', 'Vulcan salute', 'spock star trek'],
  ['👌', 'OK hand', 'ok perfect'],
  ['🤌', 'Pinched fingers', 'italian gesture'],
  ['✌️', 'Victory hand', 'peace victory'],
  ['🤞', 'Crossed fingers', 'luck hope'],
  ['🤟', 'Love-you gesture', 'love sign'],
  ['🤘', 'Sign of the horns', 'rock metal'],
  ['👈', 'Backhand index pointing left', 'point left'],
  ['👉', 'Backhand index pointing right', 'point right'],
  ['👆', 'Backhand index pointing up', 'point up'],
  ['👇', 'Backhand index pointing down', 'point down'],
  ['☝️', 'Index pointing up', 'point up one'],
  ['👍', 'Thumbs up', 'like approve yes'],
  ['👎', 'Thumbs down', 'dislike no'],
  ['✊', 'Raised fist', 'fist power'],
  ['👊', 'Oncoming fist', 'punch fist'],
  ['👏', 'Clapping hands', 'clap applause'],
  ['🙌', 'Raising hands', 'celebrate hooray'],
  ['👐', 'Open hands', 'hug open'],
  ['🤲', 'Palms up together', 'pray receive'],
  ['🤝', 'Handshake', 'deal agreement'],
  ['🙏', 'Folded hands', 'pray thanks please'],
  ['💪', 'Flexed biceps', 'strong muscle'],
  ['👂', 'Ear', 'listen hear'],
  ['👃', 'Nose', 'smell'],
  ['👀', 'Eyes', 'look see'],
  ['👅', 'Tongue', 'taste'],
  ['👄', 'Mouth', 'lips kiss'],
  ['🧠', 'Brain', 'mind smart'],
  ['👶', 'Baby', 'child newborn'],
  ['🧒', 'Child', 'kid'],
  ['👦', 'Boy', 'kid'],
  ['👧', 'Girl', 'kid'],
  ['🧑', 'Person', 'adult human'],
  ['👨', 'Man', 'adult male'],
  ['👩', 'Woman', 'adult female'],
  ['🧓', 'Older person', 'elderly']
];

const NATURE: EmojiSeed[] = [
  ['🐶', 'Dog face', 'pet puppy'],
  ['🐱', 'Cat face', 'pet kitten'],
  ['🐭', 'Mouse face', 'rodent'],
  ['🐹', 'Hamster', 'pet rodent'],
  ['🐰', 'Rabbit face', 'bunny'],
  ['🦊', 'Fox', 'clever'],
  ['🐻', 'Bear', 'animal'],
  ['🐼', 'Panda', 'animal bamboo'],
  ['🐨', 'Koala', 'animal'],
  ['🐯', 'Tiger face', 'animal'],
  ['🦁', 'Lion', 'animal'],
  ['🐮', 'Cow face', 'farm'],
  ['🐷', 'Pig face', 'farm'],
  ['🐸', 'Frog', 'animal'],
  ['🐵', 'Monkey face', 'animal'],
  ['🐔', 'Chicken', 'bird farm'],
  ['🐧', 'Penguin', 'bird'],
  ['🐦', 'Bird', 'animal'],
  ['🦆', 'Duck', 'bird'],
  ['🦉', 'Owl', 'bird night'],
  ['🦄', 'Unicorn', 'magic horse'],
  ['🐝', 'Honeybee', 'bee insect'],
  ['🦋', 'Butterfly', 'insect'],
  ['🐌', 'Snail', 'slow insect'],
  ['🐞', 'Lady beetle', 'bug insect'],
  ['🐢', 'Turtle', 'slow reptile'],
  ['🐍', 'Snake', 'reptile'],
  ['🐙', 'Octopus', 'sea'],
  ['🦀', 'Crab', 'sea'],
  ['🐬', 'Dolphin', 'sea'],
  ['🐳', 'Whale', 'sea'],
  ['🦈', 'Shark', 'sea'],
  ['🌵', 'Cactus', 'plant desert'],
  ['🌲', 'Evergreen tree', 'tree pine'],
  ['🌳', 'Deciduous tree', 'tree'],
  ['🌴', 'Palm tree', 'tree beach']
];

const FOOD: EmojiSeed[] = [
  ['🍏', 'Green apple', 'fruit'],
  ['🍎', 'Red apple', 'fruit'],
  ['🍐', 'Pear', 'fruit'],
  ['🍊', 'Tangerine', 'fruit orange'],
  ['🍋', 'Lemon', 'fruit sour'],
  ['🍌', 'Banana', 'fruit'],
  ['🍉', 'Watermelon', 'fruit'],
  ['🍇', 'Grapes', 'fruit wine'],
  ['🍓', 'Strawberry', 'fruit'],
  ['🍒', 'Cherries', 'fruit'],
  ['🍑', 'Peach', 'fruit'],
  ['🍍', 'Pineapple', 'fruit'],
  ['🥝', 'Kiwi fruit', 'fruit'],
  ['🍅', 'Tomato', 'vegetable'],
  ['🥑', 'Avocado', 'fruit'],
  ['🥦', 'Broccoli', 'vegetable'],
  ['🥕', 'Carrot', 'vegetable'],
  ['🌽', 'Ear of corn', 'vegetable'],
  ['🌶️', 'Hot pepper', 'spicy'],
  ['🥔', 'Potato', 'vegetable'],
  ['🍞', 'Bread', 'bakery'],
  ['🥐', 'Croissant', 'bakery'],
  ['🥞', 'Pancakes', 'breakfast'],
  ['🧀', 'Cheese wedge', 'dairy'],
  ['🍖', 'Meat on bone', 'dinner'],
  ['🍗', 'Poultry leg', 'chicken'],
  ['🍔', 'Hamburger', 'fast food'],
  ['🍟', 'French fries', 'fast food'],
  ['🍕', 'Pizza', 'fast food italian'],
  ['🌭', 'Hot dog', 'fast food'],
  ['🌮', 'Taco', 'mexican'],
  ['🌯', 'Burrito', 'mexican'],
  ['🍜', 'Steaming bowl', 'noodles ramen'],
  ['🍝', 'Spaghetti', 'pasta'],
  ['🍣', 'Sushi', 'japanese'],
  ['🍦', 'Soft ice cream', 'dessert'],
  ['🍩', 'Doughnut', 'dessert'],
  ['🍪', 'Cookie', 'dessert'],
  ['🎂', 'Birthday cake', 'dessert party'],
  ['🍫', 'Chocolate bar', 'sweet']
];

const OBJECTS: EmojiSeed[] = [
  ['⌚', 'Watch', 'time clock'],
  ['📱', 'Mobile phone', 'smartphone'],
  ['💻', 'Laptop', 'computer'],
  ['⌨️', 'Keyboard', 'typing'],
  ['🖥️', 'Desktop computer', 'monitor'],
  ['🖨️', 'Printer', 'print'],
  ['🖱️', 'Computer mouse', 'click'],
  ['💾', 'Floppy disk', 'save'],
  ['💿', 'Optical disk', 'cd'],
  ['📷', 'Camera', 'photo'],
  ['🎥', 'Movie camera', 'film'],
  ['📺', 'Television', 'tv'],
  ['📻', 'Radio', 'music'],
  ['🕯️', 'Candle', 'light'],
  ['💡', 'Light bulb', 'idea'],
  ['🔦', 'Flashlight', 'light'],
  ['🔑', 'Key', 'unlock'],
  ['🔒', 'Locked', 'secure'],
  ['🔓', 'Unlocked', 'open'],
  ['🔨', 'Hammer', 'tool'],
  ['🪛', 'Screwdriver', 'tool'],
  ['🔧', 'Wrench', 'tool'],
  ['⚙️', 'Gear', 'settings'],
  ['🧰', 'Toolbox', 'tools'],
  ['🧲', 'Magnet', 'attract'],
  ['🧪', 'Test tube', 'science'],
  ['🧬', 'DNA', 'biology'],
  ['🔬', 'Microscope', 'science'],
  ['🔭', 'Telescope', 'space'],
  ['📚', 'Books', 'read'],
  ['📖', 'Open book', 'read'],
  ['📝', 'Memo', 'note write'],
  ['✏️', 'Pencil', 'write'],
  ['🖊️', 'Pen', 'write'],
  ['📌', 'Pushpin', 'pin'],
  ['📎', 'Paperclip', 'attach'],
  ['📁', 'Folder', 'files'],
  ['📦', 'Package', 'box'],
  ['🎁', 'Wrapped gift', 'present']
];

const SYMBOLS: EmojiSeed[] = [
  ['❤️', 'Red heart', 'love'],
  ['🧡', 'Orange heart', 'love'],
  ['💛', 'Yellow heart', 'love'],
  ['💚', 'Green heart', 'love'],
  ['💙', 'Blue heart', 'love'],
  ['💜', 'Purple heart', 'love'],
  ['🖤', 'Black heart', 'love'],
  ['🤍', 'White heart', 'love'],
  ['💔', 'Broken heart', 'sad'],
  ['💯', 'Hundred points', 'score perfect'],
  ['✅', 'Check mark button', 'done'],
  ['❌', 'Cross mark', 'no wrong'],
  ['⚠️', 'Warning', 'alert caution'],
  ['❗', 'Exclamation mark', 'attention'],
  ['❓', 'Question mark', 'help'],
  ['♻️', 'Recycling symbol', 'reuse'],
  ['⚡', 'High voltage', 'power lightning'],
  ['✨', 'Sparkles', 'magic shiny'],
  ['🔆', 'Bright button', 'light'],
  ['🔔', 'Bell', 'notification'],
  ['🔕', 'Bell with slash', 'mute'],
  ['🔇', 'Muted speaker', 'quiet'],
  ['🔊', 'Speaker high volume', 'sound'],
  ['🎵', 'Musical note', 'music'],
  ['🎶', 'Musical notes', 'music'],
  ['➕', 'Plus', 'add'],
  ['➖', 'Minus', 'subtract'],
  ['➗', 'Divide', 'math'],
  ['✖️', 'Multiply', 'math'],
  ['♾️', 'Infinity', 'forever'],
  ['🆗', 'OK button', 'okay'],
  ['🆕', 'New button', 'fresh'],
  ['🔴', 'Red circle', 'dot'],
  ['🟢', 'Green circle', 'dot'],
  ['🔵', 'Blue circle', 'dot']
];

const DEFAULT_CATEGORIES: EmojiCategory[] = [
  { id: 'smileys', label: 'Smileys', emojis: createEmojiItems('smileys', SMILEYS) },
  { id: 'people', label: 'People', emojis: createEmojiItems('people', PEOPLE) },
  { id: 'nature', label: 'Nature', emojis: createEmojiItems('nature', NATURE) },
  { id: 'food', label: 'Food', emojis: createEmojiItems('food', FOOD) },
  { id: 'objects', label: 'Objects', emojis: createEmojiItems('objects', OBJECTS) },
  { id: 'symbols', label: 'Symbols', emojis: createEmojiItems('symbols', SYMBOLS) }
];

const RECENT_CATEGORY_ID = '__recent__';
const DROPDOWN_OFFSET = 8;

export interface EmojiPickerProps extends DefaultProps<EmojiPickerStylesNames> {
  value?: string | null;
  defaultValue?: string | null;
  onChange?(emoji: string | null): void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  nothingFoundMessage?: string;
  categories?: EmojiCategory[];
  recentLimit?: number;
}

const defaultProps: Partial<EmojiPickerProps> = {
  disabled: false,
  clearable: false,
  searchable: true,
  placeholder: 'Select an emoji',
  recentLimit: 0
};

const _EmojiPicker = forwardRef<HTMLDivElement, EmojiPickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    label,
    description,
    error,
    disabled,
    clearable,
    searchable,
    ariaLabel,
    placeholder,
    nothingFoundMessage,
    categories,
    recentLimit,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);

  const { classes, cx } = useStyles(null, {
    name: 'emoji-picker',
    classNames,
    styles,
    unstyled
  });
  const { t } = useNebularLocale();
  const resolvedNothingFoundMessage =
    nothingFoundMessage ?? t('emojiPicker.noResults', 'No emojis found');
  const searchLabel = t('emojiPicker.search', 'Search emojis');

  const dir = useNebularDir();
  const uuid = useId();
  const triggerRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [internalValue, setInternalValue] = useState<string | null>(defaultValue ?? null);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? (value ?? null) : internalValue;

  const [opened, setOpened] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<EmojiItem[]>([]);
  const [announcement, setAnnouncement] = useState('');

  const recentLimitValue = Math.max(0, recentLimit ?? 0);
  const allCategories = useMemo(() => categories ?? DEFAULT_CATEGORIES, [categories]);

  const categoriesWithRecent = useMemo(() => {
    if (recentLimitValue > 0 && recentEmojis.length > 0) {
      return [{ id: RECENT_CATEGORY_ID, label: 'Recent', emojis: recentEmojis }, ...allCategories];
    }

    return allCategories;
  }, [allCategories, recentEmojis, recentLimitValue]);

  const activeCategory =
    categoriesWithRecent.find((category) => category.id === activeCategoryId) ??
    categoriesWithRecent[0];

  const allEmojis = useMemo(() => {
    const seen = new Set<string>();
    const items: EmojiItem[] = [];

    categoriesWithRecent.forEach((category) => {
      category.emojis.forEach((item) => {
        if (!seen.has(item.emoji)) {
          seen.add(item.emoji);
          items.push(item);
        }
      });
    });

    return items;
  }, [categoriesWithRecent]);

  const hasQuery = searchValue.trim().length > 0;

  const visibleEmojis = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return activeCategory?.emojis ?? [];
    }

    return allEmojis.filter((item) => {
      if (item.name.toLowerCase().includes(query)) {
        return true;
      }

      return (item.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(query));
    });
  }, [activeCategory, allEmojis, searchValue]);

  const selectedItem = useMemo(() => {
    if (!currentValue) {
      return undefined;
    }

    return allEmojis.find((item) => item.emoji === currentValue);
  }, [allEmojis, currentValue]);

  const displayValue = currentValue
    ? selectedItem
      ? `${currentValue} ${selectedItem.name}`
      : currentValue
    : '';

  const commit = (next: string | null) => {
    if (!isControlled) {
      setInternalValue(next);
    }

    if (typeof onChange === 'function') {
      onChange(next);
    }
  };

  const show = () => {
    if (disabled) {
      return;
    }

    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';

    if (!visible) {
      setSearchValue('');
      setActiveIndex(-1);
      setOpened(true);
    }
  };

  const hide = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';

    if (visible) {
      setOpened(false);
    }
  };

  const { apply, paneRef, boundingBoxRef } = useFlexibleConnectedPositionStrategy(
    'bottom',
    'vertical',
    triggerRef.current,
    dir,
    DROPDOWN_OFFSET
  );
  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: boundingBoxRef,
    opened,
    scrollStrategy: 'reposition'
  });
  useOverlayTrigger(triggerRef, paneRef, boundingBoxRef, 'click', show, hide);
  useOverlayClickOutside([paneRef, triggerRef], hide);

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (searchable) {
      searchInputRef.current?.focus();
    } else {
      listboxRef.current?.focus();
    }
  }, [opened, searchable]);

  const selectEmoji = (item: EmojiItem) => {
    commit(item.emoji);

    if (recentLimitValue > 0) {
      setRecentEmojis((current) =>
        [item, ...current.filter((recent) => recent.emoji !== item.emoji)].slice(
          0,
          recentLimitValue
        )
      );
    }

    setAnnouncement(`${item.name} selected`);
    hide();
    triggerRef.current?.focus();
  };

  const clearValue = () => {
    commit(null);
    setAnnouncement('Selection cleared');
    hide();
    triggerRef.current?.focus();
  };

  const moveActive = (nextIndex: number) => {
    if (visibleEmojis.length === 0) {
      setActiveIndex(-1);
      return;
    }

    let index = nextIndex;

    if (index < 0) {
      index = visibleEmojis.length - 1;
    } else if (index >= visibleEmojis.length) {
      index = 0;
    }

    setActiveIndex(index);

    if (!searchable) {
      optionRefs.current[index]?.focus();
    }
  };

  const activateIndex = (index: number) => {
    if (index < 0 || index >= visibleEmojis.length) {
      return;
    }

    setActiveIndex(index);

    if (!searchable) {
      optionRefs.current[index]?.focus();
    }
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'Escape') {
      if (opened) {
        event.preventDefault();
        hide();
      }

      return;
    }

    if (['Enter', ' ', 'Spacebar', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      show();
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setActiveIndex(-1);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setSearchValue('');
    setActiveIndex(-1);

    if (searchable) {
      searchInputRef.current?.focus();
    } else {
      listboxRef.current?.focus();
    }
  };

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      hide();
      triggerRef.current?.focus();
      return;
    }

    const target = event.target as HTMLElement | null;
    const targetRole = target?.getAttribute('role');
    const isListbox = target === listboxRef.current;
    const isOption = targetRole === 'option';
    const isSearch = target === searchInputRef.current;

    if (!isListbox && !isOption && !isSearch) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        moveActive(activeIndex + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        moveActive(activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        activateIndex(0);
        break;
      case 'End':
        event.preventDefault();
        activateIndex(visibleEmojis.length - 1);
        break;
      case 'Enter':
        if (activeIndex >= 0 && visibleEmojis[activeIndex]) {
          event.preventDefault();
          selectEmoji(visibleEmojis[activeIndex]);
        }
        break;
      default:
        break;
    }
  };

  const inputAriaLabel = ariaLabel ?? (label ? undefined : 'Emoji');
  const dialogLabel = ariaLabel
    ? `${ariaLabel} picker`
    : typeof label === 'string'
      ? `${label} picker`
      : 'Emoji picker';

  const listboxId = `${uuid}-listbox`;
  const getOptionId = (index: number): string => `${uuid}-emoji-${index}`;

  return (
    <FormControl
      label={label}
      description={description}
      error={error}
      htmlFor={uuid}
      className={className}
      ref={ref}
    >
      <div className={cx(classes.root)}>
        <Input
          id={uuid}
          ref={triggerRef}
          className={cx(classes.input)}
          value={displayValue}
          placeholder={placeholder}
          readOnly
          fullWidth
          disabled={disabled}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={opened}
          aria-controls={opened ? listboxId : undefined}
          aria-label={inputAriaLabel}
          onKeyDown={handleTriggerKeyDown}
        />
        {clearable && !!currentValue && !disabled && (
          <button
            type="button"
            className={cx(classes.clearButton)}
            aria-label="Clear selection"
            onClick={clearValue}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
        <span className={cx(classes.announcement)} role="status" aria-live="polite">
          {announcement}
        </span>
      </div>
      <OptionalPortal>
        <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
          <div ref={paneRef} className="overlay-pane">
            {opened && (
              <div
                role="dialog"
                aria-label={dialogLabel}
                className={cx(classes.panel)}
                onKeyDown={handlePanelKeyDown}
              >
                {searchable && (
                  <div className={cx(classes.searchContainer)}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className={cx(classes.searchInput)}
                      value={searchValue}
                      placeholder={searchLabel}
                      aria-label={searchLabel}
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={opened}
                      aria-controls={listboxId}
                      aria-activedescendant={
                        activeIndex >= 0 ? getOptionId(activeIndex) : undefined
                      }
                      onChange={handleSearchChange}
                    />
                  </div>
                )}
                <div className={cx(classes.categories)} role="group" aria-label="Emoji categories">
                  {categoriesWithRecent.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={cx(classes.category)}
                      aria-pressed={!hasQuery && activeCategory?.id === category.id}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
                <div
                  ref={listboxRef}
                  id={listboxId}
                  role="listbox"
                  aria-label={dialogLabel}
                  className={cx(classes.listbox)}
                  tabIndex={searchable ? -1 : 0}
                  aria-activedescendant={activeIndex >= 0 ? getOptionId(activeIndex) : undefined}
                >
                  {visibleEmojis.map((item, index) => {
                    const isActive = activeIndex === index;

                    return (
                      <div
                        key={`${item.emoji}-${index}`}
                        ref={(node) => {
                          optionRefs.current[index] = node;
                        }}
                        id={getOptionId(index)}
                        role="option"
                        aria-label={item.name}
                        aria-selected={currentValue === item.emoji}
                        title={item.name}
                        className={cx(classes.option)}
                        data-active={isActive ? 'true' : undefined}
                        data-emoji={item.emoji}
                        tabIndex={isActive ? 0 : -1}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectEmoji(item)}
                      >
                        <span aria-hidden="true">{item.emoji}</span>
                      </div>
                    );
                  })}
                </div>
                {visibleEmojis.length === 0 && (
                  <div className={cx(classes.empty)} role="status" aria-live="polite">
                    {resolvedNothingFoundMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </OptionalPortal>
    </FormControl>
  );
});

_EmojiPicker.displayName = 'EmojiPicker';

export { _EmojiPicker as EmojiPicker };
