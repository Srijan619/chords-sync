import React, { useRef, useEffect, useState } from "react";
import { Lyric } from "../types";

interface LyricsDisplayProps {
  lyrics: Lyric[];
  currentLine: number;
  onSeekToAndLyricPlay: (lyric: Lyric) => void;
  onSeekToAndPlay: (lyricalTime: number) => void;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyrics,
  currentLine,
  onSeekToAndPlay,
  onSeekToAndLyricPlay,
}) => {
  const lyricsRef = useRef<HTMLDivElement | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);

  // Scroll to the active lyric line (Auto Scroll)
  useEffect(() => {
    if (!isUserScrolling) {
      setIsAutoScrolling(true);

      const currentLyricElement = lyricsRef.current?.children[currentLine];

      if (currentLyricElement) {
        currentLyricElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      setTimeout(() => setIsAutoScrolling(false), 500); // Finish auto-scroll
    }
  }, [currentLine]);

  // Add scroll event listener to update timestamp based on manual scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsAutoScrolling(false);
      setIsUserScrolling(true);

      if (lyricsRef.current) {
        const { scrollTop } = lyricsRef.current;
        const lyricHeight = 30;

        // Calculate the index of the first visible lyric
        const index = Math.floor(scrollTop / lyricHeight);

        // Get the current and next lyrics for interpolation
        const currentLyric = lyrics[index];
        const nextLyric = lyrics[index + 1];

        if (currentLyric && nextLyric) {
          const scrollPositionInLyric = scrollTop - index * lyricHeight;
          const progress = scrollPositionInLyric / lyricHeight; // Scroll progress within the lyric

          // Interpolate between the current and next lyric time
          const interpolatedTime =
            currentLyric.lyricalTime +
            progress * (nextLyric.lyricalTime - currentLyric.lyricalTime);

          // Call the seek function with the interpolated time
          onSeekToAndPlay(interpolatedTime);
        }
      }
    };

    const lyricsElement = lyricsRef.current;
    if (lyricsElement) {
      lyricsElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (lyricsElement) {
        lyricsElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [lyrics, onSeekToAndPlay, isAutoScrolling]);

  return (
    <div className="lyrics-container" ref={lyricsRef}>
      {lyrics?.map((lyric, index) => (
        <p
          key={index}
          className={`lyric-line ${index === currentLine ? "active" : ""}`}
          onClick={() => onSeekToAndLyricPlay(lyric)}
        >
          {lyric.text}
          {lyric.chord?.chord_name && `- ${lyric.chord.chord_name}`}
        </p>
      ))}
    </div>
  );
};

export default LyricsDisplay;
