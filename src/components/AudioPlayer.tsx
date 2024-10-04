import React, { useRef, useState, useEffect } from "react";
import YouTube from "react-youtube";
import "../AudioPlayer.css"; // Import your custom styles

interface AudioPlayerProps {
  title: string;
  artist: string;
  albumArtUrl: string;
  onTimeUpdate: (currentTime: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  title,
  artist,
  albumArtUrl,
  onTimeUpdate,
}) => {
  const playerRef = useRef<any>(null);
  const playing = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  const opts = {
    height: "0",
    width: "0",
    playerVars: {
      autoplay: 0, // Disable autoplay
      controls: 0, // Hide default controls
    },
  };

  const onReady = (event: any) => {
    playerRef.current = event.target;
    if (playerRef.current) {
      setDuration(playerRef.current.getDuration());
    }
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (playing.current) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      playing.current = !playing.current;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (e.target.value / 100) * duration;
    if (playerRef.current) {
      playerRef.current.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  const updateCurrentTime = () => {
    if (playerRef.current && playing.current) {
      const time = Math.floor(playerRef.current.getCurrentTime());
      setCurrentTime(time);
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
      reset();
    }
  };

  const format = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const reset = () => {
    setCurrentTime(0);
  };

  useEffect(() => {
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animationFrameId]);

  return (
    <div className="container">
      <div className="audio-player">
        <h3 className="audio-player__episode_title">{title}</h3>
        <h5 className="audio-player__title">
          <i>{artist}</i>
        </h5>
        <div className="audio-player__meta">
          <YouTube
            className="youtube-player"
            videoId="s-ln780yJpI"
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
          />
          <div className="controls">
            <button className="audio-player__play" onClick={togglePlay}>
              {playing.current ? (
                <span className="audio-player__pause-button"></span>
              ) : (
                <span className="audio-player__play-button"></span>
              )}
            </button>
            <div className="progress-container">
              <input
                type="range"
                min={0}
                max={100}
                value={
                  currentTime && duration ? (currentTime / duration) * 100 : 0
                }
                onChange={handleSeek}
                className="seek-bar"
              />
            </div>
            <div className="time-display" role="timer" aria-live="off">
              <span>{format(currentTime)}</span>
              <span> | </span>
              <span>{format(duration)}</span>
            </div>
          </div>
          <a href="#" className="artwork">
            <img src={`${albumArtUrl}`} alt="Audio Artwork" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
