import React, { useState, useEffect, useRef } from "react";
import AudioPlayer from "./components/AudioPlayer";
import { SparshaSangeet, VananaMatra, HajarJanma } from "./testSongs";
import "./App.css";

// Lyrics with timestamps
export interface Lyric {
  lyricalTime: number;
  chordTime: number;
  text: string;
  chord?: ChordInfo | null;
}

export interface Song {
  title: string;
  artist: string;
  albumArtUrl: string;
  videoId: string;
  lyrics: Lyric[];
}

interface ChordInfo {
  timestamp: number;
  pitched_common_mame: string;
  pitches: string[];
  chord_name: string;
}
type ChordsState = ChordInfo[];
const LYRIC_LATENCY = -0.5; // TODO: Could be something to allow as configurable such that user can handle themseves?
const App: React.FC = () => {
  const [song, setSong] = useState<Song>(HajarJanma);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const lyricsRef = useRef<HTMLDivElement | null>(null);
  const [currentLine, setCurrentLine] = useState<number>(0);
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
    } else if (song === VananaMatra) {
      setSong(HajarJanma);
    } else {
      setSong(SparshaSangeet);
    }
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
        const response = await fetch("http://localhost:5000/api/chords");
        const data: ChordsState = await response.json();
        // Map the fetched chords to the existing lyrics
        const updatedLyrics = mapChordsToLyrics(song.lyrics, data);

        setSong((prevSong) => ({
          ...prevSong,
          lyrics: updatedLyrics, // Update the lyrics
        }));
      } catch (error) {
        console.error("Error fetching chords data:", error);
      }
    };

    fetchChords();
  }, []);

  const handleTimeUpdate = (currentTime: number) => {
    setCurrentTime(currentTime);
  };

  const mapChordsToLyrics = (lyrics: Lyric[], chords: ChordInfo[]): Lyric[] => {
    return lyrics.map((lyric) => {
      // Find the corresponding chord based on the chord time
      const chordInfo =
        chords.find(
          (chord) =>
            Math.round(chord.timestamp * 2) / 2 ===
            Math.round(lyric.chordTime * 2) / 2,
        ) || null;

      // Return updated lyric with corresponding chord
      return {
        ...lyric,
        chord: chordInfo, // Set chord to found chord info or null
      };
    });
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
            {lyric.text} - {lyric.chord?.chord_name}
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
