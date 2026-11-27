import React from 'react';
import { MediaPlayer } from './MediaPlayer';

export default { title: 'MediaPlayer', component: MediaPlayer };

function sampleTone() {
  const sampleRate = 8000;
  const count = 2 * sampleRate;
  const bytes = new Uint8Array(44 + count);
  const header = new DataView(bytes.buffer);
  const text = new TextEncoder();
  bytes.set(text.encode('RIFF'), 0);
  header.setUint32(4, 36 + count, true);
  bytes.set(text.encode('WAVEfmt '), 8);
  header.setUint32(16, 16, true);
  header.setUint16(20, 1, true);
  header.setUint16(22, 1, true);
  header.setUint32(24, sampleRate, true);
  header.setUint32(28, sampleRate, true);
  header.setUint16(32, 1, true);
  header.setUint16(34, 8, true);
  bytes.set(text.encode('data'), 36);
  header.setUint32(40, count, true);
  for (let index = 0; index < count; index += 1) {
    const angle = (2 * Math.PI * 440 * index) / sampleRate;
    const fade = Math.min(1, index / 100, (count - index - 1) / 100);
    bytes[44 + index] = Math.round(128 + fade * 24 * Math.sin(angle));
  }
  return `data:audio/wav;base64,${btoa(String.fromCharCode(...bytes))}`;
}

export function AudioControls() {
  return (
    <MediaPlayer
      aria-label="Reference tone player"
      kind="audio"
      src={sampleTone()}
      defaultVolume={0.35}
      style={{ maxWidth: '38rem' }}
    />
  );
}

const captions = 'WEBVTT\n\n00:00:00.000 --> 00:00:04.000\nA bee visits a purple flower.\n';

export function VideoWithCaptions() {
  return (
    <MediaPlayer
      aria-label="Flower video"
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      tracks={[
        { src: `data:text/vtt,${encodeURIComponent(captions)}`, srcLang: 'en', label: 'English' }
      ]}
      defaultMuted
      style={{ maxWidth: '38rem' }}
    />
  );
}
