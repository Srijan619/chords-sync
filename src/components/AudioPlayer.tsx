import React, { useRef, useState } from "react";
import YouTube from "react-youtube";
import "../AudioPlayer.css"; // Import your custom styles

const AudioPlayer: React.FC = () => {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 0, // Disable autoplay
      controls: 0, // Hide default controls
    },
  };

  const onReady = (event) => {
    playerRef.current = event.target;
    if (playerRef.current) {
      setDuration(playerRef.current.getDuration());
    }
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (playing) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setPlaying(!playing);
    }
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    if (playerRef.current) {
      playerRef.current.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="container">
      <div className="audio-player">
        <h3 className="audio-player__episode_title">Debugging Tools + Tips</h3>
        <h5 className="audio-player__title">
          Syntax.fm <i>Episode 152</i>
        </h5>
        <div className="audio-player__meta">
          <YouTube
            className="youtube-player"
            videoId="s-ln780yJpI"
            opts={opts}
            onReady={onReady}
            onStateChange={(event) => {
              if (event.data === 1) {
                setPlaying(true);
              } else if (event.data === 2) {
                setPlaying(false);
              }
            }}
          />
          <div className="controls">
            <button className="audio-player__play" onClick={togglePlay}>
              {playing ? (
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
                value={(currentTime / duration) * 100}
                onChange={handleSeek}
                className="seek-bar"
              />
            </div>
            <div className="time-display">
              {`${Math.floor(currentTime / 60)}:${("0" + Math.floor(currentTime % 60)).slice(-2)} / ${Math.floor(duration / 60)}:${("0" + Math.floor(duration % 60)).slice(-2)}`}
            </div>
          </div>
          <a href="#" className="artwork">
            <img
              src="https://images.unsplash.com/photo-1490821872962-f2e55097079b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300"
              alt="Audio Artwork"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
