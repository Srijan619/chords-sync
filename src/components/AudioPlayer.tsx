import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "../AudioPlayer.css"; // Import your custom styles

// TODO: Still incomplete and not usable component. Idea is it will be totally custom audio player that gets stream from python backend
interface AudioPlayerProps {
  title: string;
  artist: string;
  albumArtUrl: string;
  videoId: string;
  onTimeUpdate: (currentTime: number) => void;
}

type AudioPlayerControls = {
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
};

const AudioPlayer = forwardRef<AudioPlayerControls, AudioPlayerProps>(
  ({ title, artist, albumArtUrl, videoId, onTimeUpdate }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playing = useRef(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [animationFrameId, setAnimationFrameId] = useState<number | null>(
      null,
    );

    const play = () => {
      if (audioRef.current && !playing.current) {
        audioRef.current.play();
        playing.current = true;
        updateCurrentTime(); // Start updating current time
      }
    };

    const pause = () => {
      if (audioRef.current && playing.current) {
        audioRef.current.pause();
        playing.current = false;
      }
    };

    const seekTo = (newTime: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = (Number(e.target.value) / 100) * duration;
      seekTo(newTime);
    };

    const updateCurrentTime = () => {
      if (audioRef.current && playing.current) {
        const time = Math.floor(audioRef.current.currentTime);
        setCurrentTime(time);
        onTimeUpdate(time);
        setAnimationFrameId(requestAnimationFrame(updateCurrentTime));
      } else if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        setAnimationFrameId(null);
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

    // Expose play and pause methods to parent component
    useImperativeHandle(ref, () => ({
      play,
      pause,
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

    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.addEventListener("loadedmetadata", () => {
          setDuration(audioRef.current!.duration);
        });
      }
    }, [videoId]);

    const inputStyle = {
      background: `linear-gradient(to right, var(--color-fill) ${(currentTime / duration) * 100 || 0}%, var(--color-default) ${(currentTime / duration) * 100 || 0}%)`,
    };

    return (
      <div className="container">
        <div className="audio-player">
          <h3 className="audio-player__episode_title">{title}</h3>
          <h5 className="audio-player__title">
            <i>{artist}</i>
          </h5>
          <div className="audio-player__meta">
            <audio
              ref={audioRef}
              src={`http://localhost:5000/stream/${videoId}^`}
              onEnded={reset}
            />
            <div className="controls">
              <div className="progress-container">
                <button
                  className="audio-player__play"
                  onClick={handlePlayPause}
                >
                  {playing.current ? (
                    <span className="audio-player__pause-button"></span>
                  ) : (
                    <span className="audio-player__play-button"></span>
                  )}
                </button>
                <div className="time-display-current">
                  {format(currentTime)}
                </div>

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
              <img src={`${albumArtUrl}`} alt="Audio Artwork" />
            </a>
          </div>
        </div>
      </div>
    );
  },
);

export default AudioPlayer;
