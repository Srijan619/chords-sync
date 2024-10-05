import React, { useState, useEffect, useRef } from "react";
import AudioPlayer from "./components/AudioPlayer";
import { SparshaSangeet } from "./testSongs/sparshaSangeet";
import { VananaMatra } from "./testSongs/VananaMatra";
import "./App.css";

// Lyrics with timestamps
export interface Lyric {
  lyricalTime: number;
  chordTime: number;
  text: string;
}

export interface Song {
  title: string;
  artist: string;
  albumArtUrl: string;
  videoId: string;
  lyrics: Lyric[];
}

const LYRIC_LATENCY = -0.5; // TODO: Could be something to allow as configurable such that user can handle themseves?
const App: React.FC = () => {
  const [song, setSong] = useState<Song>(VananaMatra);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const lyricsRef = useRef<HTMLDivElement | null>(null);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const [chords, setChords] = useState<{ [key: number]: string }>({});
  const audioPlayerRef = useRef<{
    play: () => void;
    pause: () => void;
    seekTo: (newTime: number) => void;
  }>(null);

  // Util for testing switching songs...
  // @ts-ignore
  window.switchSong = () => {
    if (song === SparshaSangeet) {
      setSong(VananaMatra);
    } else {
      setSong(SparshaSangeet);
    }
    console.log("Current Song:", song);
  };

  useEffect(() => {
    const line =
      song.lyrics.findIndex(
        (lyric) => lyric.lyricalTime > currentTime - LYRIC_LATENCY,
      ) - 1;
    if (line !== currentLine && line >= 0) {
      // Avoid scrolling to top when lyrics not found
      setCurrentLine(line);
      lyricsRef.current?.scrollTo({
        top: line * 30,
        behavior: "smooth",
      });
    }
  }, [currentTime, currentLine]);

  useEffect(() => {
    // Fetch chords data from the backend
    const fetchChords = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notes");
        const data = await response.json();

        // Log the data to check API response
        console.log("Chord data from API:", data);

        // Set chords state with rounded timestamps
        const roundedChords = Object.entries(data).reduce(
          (acc, [key, value]) => {
            const roundedKey = Math.round(parseFloat(key) * 2) / 2; // Round to nearest 0.5 seconds
            acc[roundedKey] = value as string;
            return acc;
          },
          {} as Record<number, string>,
        );

        console.log("Rounded chords..", roundedChords);
        setChords(roundedChords);
      } catch (error) {
        console.error("Error fetching chords data:", error);
      }
    };

    fetchChords();
  }, []);

  const handleTimeUpdate = (currentTime: number) => {
    setCurrentTime(currentTime);
  };

  const handleLyricClick = (lyric: Lyric) => {
    console.log("Clicking indivudal lyric", lyric);
    setCurrentTime(lyric.lyricalTime);
    audioPlayerRef.current?.seekTo(lyric.lyricalTime);
    audioPlayerRef.current?.play();
  };

  return (
    <div className="App">
      <div className="lyrics-container" ref={lyricsRef}>
        {song.lyrics.map((lyric, index) => (
          <p
            key={index}
            className={`lyric-line ${index === currentLine ? "active" : ""}`}
            onClick={() => handleLyricClick(lyric)}
          >
            {lyric.text} - {chords[lyric.chordTime]}
          </p>
        ))}
      </div>
      <AudioPlayer
        ref={audioPlayerRef}
        title={song.title}
        artist={song.artist}
        albumArtUrl={song.albumArtUrl}
        videoId={song.videoId}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
};

export default App;
