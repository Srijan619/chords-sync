import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import YouTube from "react-youtube";
import "../AudioPlayer.css"; // Import your custom styles
import { Song } from "../types";

interface AudioPlayerProps {
  song: Song;
  currentTime: number;
  onTimeUpdate: (currentTime: number) => void;
  onArtistFilterSelected: (artistFilterSelected: string) => void;
}

type AudioPlayerControls = {
  play: () => void;
  pause: () => void;
  handlePlayPause: () => void;
  seekTo: (time: number) => void;
};

const YoutubeAudioPlayer = forwardRef<AudioPlayerControls, AudioPlayerProps>(
  ({ song, currentTime, onTimeUpdate, onArtistFilterSelected }, ref) => {
    const { title, artist, album_art_url, video_id, key, tempo } = song;
    const playerRef = useRef<any>(null);
    const playing = useRef(false);
    const [duration, setDuration] = useState(0);
    const [animationFrameId, setAnimationFrameId] = useState<number | null>(
      null,
    );

    const [selectedArtist, setSelectedArtist] = useState("");
    const opts = {
      height: "0",
      width: "0",
      playerVars: {
        autoplay: 1,
        controls: 0,
      },
    };

    const onReady = (event: any) => {
      playerRef.current = event.target;
      if (playerRef.current) {
        setDuration(playerRef.current.getDuration());
        playerRef.current.playVideo(); // Auto play..using autoplay from player vars is not recommended as it gets restricted with some browser's policy
      }
    };

    const play = () => {
      if (playerRef.current && !playing.current) {
        seekTo(currentTime || 0); // Either seek to current playing time or always start at 0
        playerRef.current.playVideo();
        playing.current = true;
        updateCurrentTime(); // Start updating current time
      }
    };

    const pause = () => {
      if (playerRef.current && playing.current) {
        playerRef.current.pauseVideo();
        playing.current = false;
      }
    };

    const seekTo = (newTime: number) => {
      playerRef.current?.seekTo(newTime);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = (Number(e.target.value) / 100) * duration;
      seekTo(newTime);
    };

    const updateCurrentTime = () => {
      if (playerRef.current && playing.current) {
        const time = Math.floor(playerRef.current.getCurrentTime());
        onTimeUpdate(time);
        setAnimationFrameId(requestAnimationFrame(updateCurrentTime));
      } else if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        setAnimationFrameId(null);
      }
    };

    const onStateChange = (event: any) => {
      if (event.data === YouTube.PlayerState.PLAYING) {
        playing.current = true;
        updateCurrentTime(); // Start updating current time
      } else if (event.data === YouTube.PlayerState.PAUSED) {
        playing.current = false;
      } else if (event.data === YouTube.PlayerState.ENDED) {
        playing.current = false;
      }
    };

    const format = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    };

    // Expose play and pause methods to parent component
    useImperativeHandle(ref, () => ({
      play,
      pause,
      handlePlayPause,
      seekTo,
    }));

    useEffect(() => {
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }, [animationFrameId]);

    const handlePlayPause = () => {
      if (playing.current) {
        pause();
      } else {
        play();
      }
    };

    const handleOnArtistClick = () => {
      if (selectedArtist) {
        onArtistFilterSelected("");
        setSelectedArtist("");
      } else {
        onArtistFilterSelected(artist);
        setSelectedArtist(artist);
      }
    };

    const inputStyle = {
      background: `linear-gradient(to right, var(--color-fill) ${(currentTime / duration) * 100 || 0}%, var(--color-default) ${(currentTime / duration) * 100 || 0}%)`,
    };

    return (
      <div className="audio-player">
        <div className="audio-meta-container">
          <h3 className="audio-player__episode_title">{title}</h3>
          <p
            className={`audio-player__title ${selectedArtist ? "artist-selected" : ""}`}
            onClick={handleOnArtistClick}
          >
            <i>{artist}</i>
          </p>
          {tempo && (
            <b className="audio-player__title">Tempo: {tempo.tempo} BPM</b>
          )}
          {key?.key_name && (
            <b className="audio-player__title">Key: {key.key_name}</b>
          )}
        </div>
        <div className="audio-player__meta">
          <YouTube
            className="youtube-player-hidden"
            videoId={video_id}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
          />
          <div className="controls">
            <div className="progress-container">
              <button className="audio-player__play" onClick={handlePlayPause}>
                {playing.current ? (
                  <span className="audio-player__pause-button"></span>
                ) : (
                  <span className="audio-player__play-button"></span>
                )}
              </button>
              <div className="time-display-current">{format(currentTime)}</div>

              <input
                type="range"
                min={0}
                max={100}
                value={
                  currentTime && duration ? (currentTime / duration) * 100 : 0
                }
                onChange={handleSeek}
                className="seek-bar"
                style={inputStyle}
              />
              <div className="time-display-duration">{format(duration)}</div>
            </div>
          </div>
          <a href="#" className="artwork">
            <img src={`${album_art_url}`} alt="Audio Artwork" />
          </a>
        </div>
      </div>
    );
  },
);

export default YoutubeAudioPlayer;
