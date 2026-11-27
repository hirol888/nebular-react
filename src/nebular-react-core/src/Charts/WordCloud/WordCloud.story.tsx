import React from 'react';
import { WordCloud } from './WordCloud';

export default { title: 'Charts/WordCloud', component: WordCloud };

const words = [
  { text: 'React', value: 100 },
  { text: 'TypeScript', value: 80 },
  { text: 'Emotion', value: 60 },
  { text: 'Nebular', value: 40 },
  { text: 'Charts', value: 20 },
  { text: 'Testing', value: 10 }
];

export function Showcase() {
  return <WordCloud words={words} ariaLabel="Technology usage" />;
}

export function CustomPalette() {
  return (
    <WordCloud
      words={words}
      colors={['#3366ff', '#00d68f', '#ffaa00', '#ff3d71']}
      fontFamily="Georgia, serif"
      width={560}
      height={320}
      ariaLabel="Technology usage with a custom palette"
    />
  );
}

export function Compact() {
  return (
    <WordCloud
      words={words.slice(0, 4)}
      minFontSize={14}
      maxFontSize={28}
      height={200}
      ariaLabel="Compact technology usage"
    />
  );
}
