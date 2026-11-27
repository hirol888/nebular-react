import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MediaPlayer } from '@nebular-react/core';

describe('MediaPlayer', () => {
  afterEach(() => jest.restoreAllMocks());

  it('plays and pauses, seeks within known duration and changes audio settings', async () => {
    const user = userEvent.setup();
    const play = jest.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(async function (
      this: HTMLMediaElement
    ) {
      fireEvent.play(this);
    });
    const pause = jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
      this: HTMLMediaElement
    ) {
      fireEvent.pause(this);
    });
    const { container } = render(<MediaPlayer kind="audio" src="/audio.mp3" />);
    const audio = container.querySelector('audio')!;
    const position = screen.getByRole('slider', { name: 'Playback position' });
    expect(position).toBeDisabled();
    Object.defineProperty(audio, 'duration', { value: 120, configurable: true });
    fireEvent.loadedMetadata(audio);
    expect(position).not.toBeDisabled();
    fireEvent.change(position, { target: { value: '35' } });
    expect(audio.currentTime).toBe(35);
    expect(screen.getByText('0:35 / 2:00')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(play).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(pause).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByRole('slider', { name: 'Volume' }), { target: { value: '0.4' } });
    expect(audio.volume).toBe(0.4);
    await user.click(screen.getByRole('button', { name: 'Mute' }));
    expect(audio.muted).toBe(true);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Playback speed' }), '1.5');
    expect(audio.playbackRate).toBe(1.5);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('adds caption tracks, selects or turns them off, and reports failed play attempts', async () => {
    const user = userEvent.setup();
    jest.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(new Error('Blocked'));
    const onError = jest.fn();
    const { container } = render(
      <MediaPlayer
        src="/video.mp4"
        tracks={[
          { src: '/en.vtt', srcLang: 'en', label: 'English', default: true },
          { src: '/pt.vtt', srcLang: 'pt-BR', label: 'Português' }
        ]}
        onError={onError}
      />
    );
    const video = container.querySelector('video')!;
    const textTracks = [{ mode: 'showing' }, { mode: 'disabled' }];
    Object.defineProperty(video, 'textTracks', { value: textTracks });
    const captions = screen.getByRole('combobox', { name: 'Captions' });
    await user.selectOptions(captions, '1');
    expect(textTracks.map(({ mode }) => mode)).toEqual(['disabled', 'showing']);
    await user.selectOptions(captions, 'off');
    expect(textTracks.map(({ mode }) => mode)).toEqual(['disabled', 'disabled']);
    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Playback could not start.');
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
