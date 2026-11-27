import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useMergedRef } from '@nebular-react/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Button } from '../Button';
import { NativeSelect } from '../NativeSelect';
import { Slider } from '../Slider';

export interface MediaPlayerSource {
  src: string;
  type?: string;
}

export interface MediaPlayerTrack {
  src: string;
  srcLang: string;
  label: string;
  kind?: 'captions' | 'subtitles' | 'descriptions' | 'chapters' | 'metadata';
  default?: boolean;
}

export interface MediaPlayerLabels {
  player: string;
  play: string;
  pause: string;
  seek: string;
  volume: string;
  mute: string;
  unmute: string;
  speed: string;
  captions: string;
  captionsOff: string;
  playError: string;
  mediaError: string;
  speedOption(rate: number): string;
  timePosition(time: string, duration: string): string;
}

const useStyles = createStyles(() => ({
  root: {
    display: 'grid',
    minWidth: 0,
    overflow: 'hidden',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--media-player-border-radius, 0.5rem)',
    backgroundColor: 'var(--background-basic-color-1, #fff)',
    color: 'var(--text-basic-color, #222b45)'
  },
  video: {
    width: '100%',
    display: 'block',
    backgroundColor: 'var(--media-player-video-background, #141820)'
  },
  controls: {
    display: 'grid',
    gap: '0.75rem',
    padding: '0.75rem'
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.75rem'
  },
  volume: {
    width: '6rem',
    minWidth: '3rem'
  },
  time: {
    fontSize: '0.875rem',
    fontVariantNumeric: 'tabular-nums'
  },
  error: {
    margin: 0
  }
}));

export type MediaPlayerStylesNames = Selectors<typeof useStyles>;

export interface MediaPlayerProps
  extends
    DefaultProps<MediaPlayerStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children' | 'onError'> {
  kind?: 'audio' | 'video';
  src?: string;
  sources?: readonly MediaPlayerSource[];
  tracks?: readonly MediaPlayerTrack[];
  poster?: string;
  preload?: 'none' | 'metadata' | 'auto';
  crossOrigin?: 'anonymous' | 'use-credentials';
  defaultVolume?: number;
  defaultMuted?: boolean;
  playbackRates?: readonly number[];
  labels?: Partial<MediaPlayerLabels>;
  /** Access the active native media element for integration with external controls. */
  mediaRef?: React.Ref<HTMLMediaElement>;
  /** Reports playback position, in seconds. */
  onPlaybackTimeChange?(seconds: number): void;
  onError?(error: unknown): void;
}

const defaultLabels: MediaPlayerLabels = {
  player: 'Media player',
  play: 'Play',
  pause: 'Pause',
  seek: 'Playback position',
  volume: 'Volume',
  mute: 'Mute',
  unmute: 'Unmute',
  speed: 'Playback speed',
  captions: 'Captions',
  captionsOff: 'Off',
  playError: 'Playback could not start.',
  mediaError: 'The media could not be loaded.',
  speedOption: (rate) => `${rate}×`,
  timePosition: (time, duration) => `${time} / ${duration}`
};

const defaultRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
const emptySources: readonly MediaPlayerSource[] = [];
const emptyTracks: readonly MediaPlayerTrack[] = [];

const defaultProps: Partial<MediaPlayerProps> = {
  kind: 'video',
  preload: 'metadata',
  defaultVolume: 1,
  defaultMuted: false,
  playbackRates: defaultRates,
  sources: emptySources,
  tracks: emptyTracks
};

function playbackTime(seconds: number): string {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const time = `${minutes}:${String(total % 60).padStart(2, '0')}`;
  return hours > 0 ? `${hours}:${time.padStart(5, '0')}` : time;
}

function allowsCaptions(track: MediaPlayerTrack): boolean {
  return !track.kind || track.kind === 'captions' || track.kind === 'subtitles';
}

function applyCaption(
  media: HTMLMediaElement,
  tracks: readonly MediaPlayerTrack[],
  selectedTrack: string
) {
  tracks.forEach((track, index) => {
    const textTrack = media.textTracks?.[index];
    if (textTrack && allowsCaptions(track)) {
      textTrack.mode = selectedTrack === String(index) ? 'showing' : 'disabled';
    }
  });
}

type NativeMediaProps = Pick<
  MediaPlayerProps,
  'src' | 'poster' | 'preload' | 'crossOrigin' | 'mediaRef' | 'onPlaybackTimeChange' | 'onError'
> & {
  kind: 'audio' | 'video';
  sources: readonly MediaPlayerSource[];
  tracks: readonly MediaPlayerTrack[];
  defaultVolume: number;
  defaultMuted: boolean;
  playbackRates: readonly number[];
  labels: MediaPlayerLabels;
  classes: Record<MediaPlayerStylesNames, string>;
};

function NativeMedia({
  kind,
  src,
  sources,
  tracks,
  poster,
  preload,
  crossOrigin,
  defaultVolume,
  defaultMuted,
  playbackRates,
  labels,
  classes,
  mediaRef,
  onPlaybackTimeChange,
  onError
}: NativeMediaProps) {
  const currentMedia = useRef<HTMLMediaElement | null>(null);
  const playPending = useRef(false);
  const mergedMediaRef = useMergedRef(currentMedia, mediaRef);
  const [playing, setPlaying] = useState(false);
  const [timeline, setTimeline] = useState({ time: 0, duration: 0 });
  const initialVolume = Number.isFinite(defaultVolume)
    ? Math.max(0, Math.min(1, defaultVolume))
    : 1;
  const [sound, setSound] = useState({ volume: initialVolume, muted: defaultMuted });
  const [rate, setRate] = useState(1);
  const defaultTrackIndex = tracks.findIndex((track) => track.default && allowsCaptions(track));
  const [caption, setCaption] = useState(defaultTrackIndex < 0 ? 'off' : String(defaultTrackIndex));
  const [error, setError] = useState<string>();
  const speedOptions = [...new Set([...playbackRates, 1, rate])]
    .filter((speed) => Number.isFinite(speed) && speed > 0)
    .sort((left, right) => left - right)
    .map((speed) => ({ value: String(speed), label: labels.speedOption(speed) }));
  const captionOptions = tracks.flatMap((track, index) =>
    allowsCaptions(track) ? [{ value: String(index), label: track.label }] : []
  );

  useEffect(() => {
    const element = currentMedia.current;
    if (element) {
      element.volume = initialVolume;
    }
  }, [initialVolume]);

  const updateTime = (media: HTMLMediaElement) => {
    const { currentTime, duration } = media;
    const time = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
    setTimeline({
      time,
      duration: Number.isFinite(duration) ? Math.max(0, duration) : 0
    });
    onPlaybackTimeChange?.(time);
  };

  const togglePlayback = async () => {
    const media = currentMedia.current;
    if (!media || playPending.current) {
      return;
    }
    if (playing) {
      media.pause();
      return;
    }
    playPending.current = true;
    setError(undefined);
    try {
      await media.play();
    } catch (reason) {
      if (currentMedia.current === media) {
        setError(labels.playError);
        onError?.(reason);
      }
    } finally {
      playPending.current = false;
    }
  };

  const seek = (time: number) => {
    const media = currentMedia.current;
    if (media && timeline.duration > 0) {
      media.currentTime = time;
      updateTime(media);
    }
  };

  const setVolume = (volume: number) => {
    const media = currentMedia.current;
    if (media) {
      media.volume = volume;
      if (volume > 0) {
        media.muted = false;
      }
      setSound({ volume: media.volume, muted: media.muted });
    }
  };

  const toggleMute = () => {
    const media = currentMedia.current;
    if (media) {
      media.muted = !media.muted;
      setSound({ volume: media.volume, muted: media.muted });
    }
  };

  const changeRate = (nextRate: string) => {
    const media = currentMedia.current;
    if (media) {
      try {
        media.playbackRate = Number(nextRate);
        setRate(media.playbackRate);
      } catch (reason) {
        onError?.(reason);
      }
    }
  };

  const selectCaption = (track: string) => {
    setCaption(track);
    const media = currentMedia.current;
    if (media) {
      applyCaption(media, tracks, track);
    }
  };

  const mediaProps = {
    ref: mergedMediaRef,
    ...(sources.length ? {} : { src }),
    crossOrigin,
    preload,
    muted: defaultMuted,
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => setPlaying(false),
    onLoadedMetadata: ({ currentTarget }: React.SyntheticEvent<HTMLMediaElement>) => {
      updateTime(currentTarget);
      applyCaption(currentTarget, tracks, caption);
    },
    onDurationChange: ({ currentTarget }: React.SyntheticEvent<HTMLMediaElement>) =>
      updateTime(currentTarget),
    onTimeUpdate: ({ currentTarget }: React.SyntheticEvent<HTMLMediaElement>) =>
      updateTime(currentTarget),
    onVolumeChange: ({ currentTarget }: React.SyntheticEvent<HTMLMediaElement>) =>
      setSound({ volume: currentTarget.volume, muted: currentTarget.muted }),
    onRateChange: ({ currentTarget }: React.SyntheticEvent<HTMLMediaElement>) =>
      setRate(currentTarget.playbackRate),
    onError: ({ currentTarget }: React.SyntheticEvent<HTMLMediaElement>) => {
      if (currentTarget.error) {
        setPlaying(false);
        setError(labels.mediaError);
        onError?.(currentTarget.error);
      }
    }
  };
  const mediaChildren = (
    <>
      {sources.map((source) => (
        <source key={JSON.stringify([source.src, source.type])} {...source} />
      ))}
      {tracks.map((track, index) => (
        <track
          key={JSON.stringify([track.src, track.srcLang, track.kind])}
          {...track}
          kind={track.kind ?? 'captions'}
          default={index === defaultTrackIndex || (!allowsCaptions(track) && track.default)}
        />
      ))}
    </>
  );

  return (
    <>
      {kind === 'audio' ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- Tracks are rendered from the caller's media metadata.
        <audio {...mediaProps}>{mediaChildren}</audio>
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- Tracks are rendered from the caller's media metadata.
        <video {...mediaProps} className={classes.video} poster={poster} playsInline>
          {mediaChildren}
        </video>
      )}
      <div className={classes.controls}>
        <Slider
          ariaLabel={labels.seek}
          value={Math.min(timeline.time, timeline.duration)}
          max={timeline.duration || 1}
          step={0.01}
          disabled={timeline.duration <= 0}
          showValue={false}
          onChange={seek}
        />
        <div className={classes.toolbar}>
          <Button type="button" size="small" onClick={togglePlayback}>
            {playing ? labels.pause : labels.play}
          </Button>
          <span className={classes.time}>
            {labels.timePosition(playbackTime(timeline.time), playbackTime(timeline.duration))}
          </span>
          <Button type="button" size="small" appearance="outline" onClick={toggleMute}>
            {sound.muted ? labels.unmute : labels.mute}
          </Button>
          <Slider
            className={classes.volume}
            ariaLabel={labels.volume}
            value={sound.muted ? 0 : sound.volume}
            max={1}
            step={0.01}
            showValue={false}
            onChange={setVolume}
          />
          <NativeSelect
            size="sm"
            label={labels.speed}
            value={String(rate)}
            data={speedOptions}
            onChange={changeRate}
          />
          {captionOptions.length > 0 && (
            <NativeSelect
              size="sm"
              label={labels.captions}
              value={caption}
              data={[{ value: 'off', label: labels.captionsOff }, ...captionOptions]}
              onChange={selectCaption}
            />
          )}
        </div>
        {error && (
          <p role="alert" className={classes.error}>
            {error}
          </p>
        )}
      </div>
    </>
  );
}

export const MediaPlayer = forwardRef<HTMLDivElement, MediaPlayerProps>((props, ref) => {
  const {
    kind,
    src,
    sources,
    tracks,
    poster,
    preload,
    crossOrigin,
    defaultVolume,
    defaultMuted,
    playbackRates,
    labels,
    mediaRef,
    onPlaybackTimeChange,
    onError,
    className,
    classNames,
    styles,
    unstyled,
    'aria-label': ariaLabel,
    ...otherProps
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'media-player', classNames, styles, unstyled });
  const text = { ...defaultLabels, ...labels };
  const mediaKey = JSON.stringify([
    kind,
    src,
    sources.map((source) => [source.src, source.type]),
    tracks.map((track) => [track.src, track.srcLang, track.kind, track.default])
  ]);

  return (
    <div
      {...otherProps}
      ref={ref}
      className={cx(classes.root, className)}
      role="group"
      aria-label={ariaLabel ?? text.player}
    >
      <NativeMedia
        key={mediaKey}
        {...{
          kind,
          src,
          sources,
          tracks,
          poster,
          preload,
          crossOrigin,
          defaultVolume,
          defaultMuted,
          playbackRates,
          labels: text,
          classes,
          mediaRef,
          onPlaybackTimeChange,
          onError
        }}
      />
    </div>
  );
});

MediaPlayer.displayName = 'MediaPlayer';
