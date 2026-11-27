import React, { useRef, useState } from 'react';
import { MediaPlayer } from '../MediaPlayer';
import { TranscriptViewer } from './TranscriptViewer';
import type { TranscriptSegment } from './TranscriptViewer';

export default { title: 'TranscriptViewer', component: TranscriptViewer };

const segments: readonly TranscriptSegment[] = [
  { id: 'opening', start: 0, end: 2, text: 'A bee flies past the purple flower.' },
  { id: 'petals', start: 2, end: 4, text: 'The purple petals move gently.' },
  { id: 'ending', start: 4, end: 5, text: 'The scene stays focused on the flower.' }
];

export function FlowerVideo() {
  const media = useRef<HTMLMediaElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: '42rem' }}>
      <MediaPlayer
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        defaultMuted
        mediaRef={media}
        onPlaybackTimeChange={setCurrentTime}
      />
      <TranscriptViewer
        segments={segments}
        currentTime={currentTime}
        followPlayback
        onSeek={(seconds) => {
          if (media.current) {
            media.current.currentTime = seconds;
            setCurrentTime(seconds);
          }
        }}
      />
    </div>
  );
}

export function ReadableTranscript() {
  return <TranscriptViewer segments={segments} />;
}
