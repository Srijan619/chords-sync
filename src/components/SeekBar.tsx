interface SeekBarProps {
  currentTime: number;
  duration: number;
  seekTo: (time: number) => void;
}

const SeekBar: React.FC<SeekBarProps> = ({ currentTime, duration, seekTo }) => {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (Number(e.currentTarget.value) / 100) * duration;
    seekTo(newTime);
  };

  const inputStyle = {
    background: `linear-gradient(to right, var(--color-fill) ${(currentTime / duration) * 100 || 0}%, var(--color-default) ${(currentTime / duration) * 100 || 0}%)`,
  };

  return (
    <input
      type="range"
      min={0}
      max={100}
      value={currentTime && duration ? (currentTime / duration) * 100 : 0}
      onChange={handleSeek}
      className="seek-bar"
      style={inputStyle}
    />
  );
};

export default SeekBar;
