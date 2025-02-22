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
import { motion } from "framer-motion";

interface AudioPlayerProps {
  song: Song;
  currentTime: number;
  onPlayNext: () => void;
  onTimeUpdate: (currentTime: number) => void;
  onArtistFilterSelected: (artistFilterSelected: string) => void;
}

type AudioPlayerControls = {
  play: () => void;
  pause: () => void;
  handlePlayPause: () => void;
  seekTo: (time: number) => void;
  playOnlyIfPaused: () => void;
};

const YoutubeAudioPlayer = forwardRef<AudioPlayerControls, AudioPlayerProps>(
  (
    { song, currentTime, onPlayNext, onTimeUpdate, onArtistFilterSelected },
    ref,
  ) => {
    const { title, artist, album_art_url, video_id, key, tempo } = song;
    const playerRef = useRef<any>(null);
    const [duration, setDuration] = useState(0);
    const [animationFrameId, setAnimationFrameId] = useState<number | null>(
      null,
    );
    const [isPlaying, setIsPlaying] = useState(false);

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
      if (playerRef.current && !isPlaying) {
        seekTo(currentTime || 0); // Either seek to current playing time or always start at 0
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    };

    const pause = () => {
      if (playerRef.current && isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    };

    const playOnlyIfPaused = () => {
      if (playerRef.current && !isPlaying) {
        playerRef.current.playVideo();
        setIsPlaying(true);
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
      if (playerRef.current && isPlaying) {
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
        setIsPlaying(true);
        updateCurrentTime(); // Start updating current time
      } else if (event.data === YouTube.PlayerState.PAUSED) {
        setIsPlaying(false);
      } else if (event.data === YouTube.PlayerState.ENDED) {
        setIsPlaying(false);
        onPlayNext();
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
      playOnlyIfPaused,
    }));

    useEffect(() => {
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }, [animationFrameId]);

    const handlePlayPause = () => {
      if (isPlaying) {
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
              <motion.button
                onClick={handlePlayPause}
                className="audio-player__play"
                whileTap={{ scale: 0.9 }} // Press-down effect
                animate={{
                  scale: isPlaying ? 1.2 : 1,
                  opacity: isPlaying ? 1 : 0.8,
                }} // Smooth transition
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {isPlaying ? (
                  <span className="audio-player__pause-button"></span>
                ) : (
                  <span className="audio-player__play-button"></span>
                )}
              </motion.button>
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
