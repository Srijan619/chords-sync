import React, { useState, useEffect, useRef } from "react";
import YoutubeAudioPlayer from "./components/YoutubeAudioPlayer";
import LyricsDisplay from "./components/LyricsDisplay";
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

const LYRIC_LATENCY = -0.5; // TODO: Could be something to allow as configurable such that user can handle themseves?
const App: React.FC = () => {
  const [song, setSong] = useState<Song>(HajarJanma);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const audioPlayerRef = useRef<{
    play: () => void;
    pause: () => void;
    seekTo: (newTime: number) => void;
  }>(null);

  // Switch song logic
  // @ts-ignore
  window.switchSong = () => {
    if (song === SparshaSangeet) setSong(VananaMatra);
    else if (song === VananaMatra) setSong(HajarJanma);
    else setSong(SparshaSangeet);
  };

  useEffect(() => {
    const line =
      song.lyrics.findIndex(
        (lyric) => lyric.lyricalTime > currentTime - LYRIC_LATENCY,
      ) - 1;
    if (line !== currentLine && line >= 0) {
      setCurrentLine(line);
    }
  }, [currentTime, currentLine, song.lyrics]);

  useEffect(() => {
    const fetchChords = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/chords/" + song.videoId,
        );
        const data: ChordInfo[] = await response.json();
        const updatedLyrics = mapChordsToLyrics(song.lyrics, data);
        console.log("🎸 Updated Lyrics with Chords", updatedLyrics);
        setSong((prevSong) => ({ ...prevSong, lyrics: updatedLyrics }));
      } catch (error) {
        console.error("Error fetching chords:", error);
      }
    };
    fetchChords();
  }, [song.lyrics]);

  const handleTimeUpdate = (time: number) => setCurrentTime(time);

  const seekToAndLyricPlay = (lyric: Lyric) => {
    setCurrentTime(lyric.lyricalTime);
    audioPlayerRef.current?.seekTo(lyric.lyricalTime);
    audioPlayerRef.current?.play();
  };

  const seekToAndPlay = (lyricalTime: number) => {
    setCurrentTime(lyricalTime);
    audioPlayerRef.current?.seekTo(lyricalTime);
    audioPlayerRef.current?.play();
  };

  const mapChordsToLyrics = (lyrics: Lyric[], chords: ChordInfo[]): Lyric[] =>
    lyrics.map((lyric) => {
      const chordInfo =
        chords.find(
          (chord) =>
            Math.round(chord.timestamp * 2) / 2 ===
            Math.round(lyric.chordTime * 2) / 2,
        ) || null;
      return { ...lyric, chord: chordInfo };
    });

  return (
    <div className="App">
      <LyricsDisplay
        lyrics={song.lyrics}
        currentLine={currentLine}
        onSeekToAndPlay={seekToAndPlay}
        onSeekToAndLyricPlay={seekToAndLyricPlay}
      />
      <YoutubeAudioPlayer
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
