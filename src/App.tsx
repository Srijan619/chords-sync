import React, { useState, useEffect, useRef } from "react";
import YoutubeAudioPlayer from "./components/YoutubeAudioPlayer";
import LyricsDisplay from "./components/LyricsDisplay";
// import { SparshaSangeet, VananaMatra, HajarJanma } from "./testSongs";
import "./App.css";
import type { ChordInfo, SongInfoApiResponse, Song, Lyric } from "./types";
import { calculateLyricsWithTimes } from "./utils/transformLyrics";

const API_URL = import.meta.env.VITE_API_URL;
const LYRIC_LATENCY = -0.5; // TODO: Make configurable
const App: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null); // Use state for selected song
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const audioPlayerRef = useRef<{
    play: () => void;
    pause: () => void;
    seekTo: (newTime: number) => void;
  }>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/songs`);
        const data: Song[] = await response.json();
        setSongs(data);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, []);

  useEffect(() => {
    if (!selectedSong?.lyrics) return;

    const line =
      selectedSong.lyrics.findIndex(
        (lyric) => lyric.lyricalTime > currentTime - LYRIC_LATENCY,
      ) - 1;

    if (line !== currentLine && line >= 0) {
      setCurrentLine(line);
    }
  }, [currentTime, currentLine, selectedSong]);

  // Fetch chords for the selected song
  useEffect(() => {
    if (!selectedSong) return; // Do nothing if no song is selected

    const fetchChords = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/chords/` + selectedSong.video_id,
        );
        const data: SongInfoApiResponse = await response.json();

        const updatedLyrics = mapChordsToLyrics(
          selectedSong.lyrics,
          data.chords,
        );

        setSelectedSong((prevSong) =>
          prevSong
            ? {
              ...prevSong,
              lyrics: updatedLyrics,
              tempo: data.tempo,
              key: data.key,
              time_signature: data.time_signature,
            }
            : null,
        );
      } catch (error) {
        console.error("Error fetching chords:", error);
      }
    };

    fetchChords();
  }, [selectedSong]);

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

  const handleSongSelect = (song: Song) => {
    const formattedLyrics = calculateLyricsWithTimes(
      0,
      4,
      song.lyrics.toString(),
    );
    setSelectedSong({
      ...song,
      lyrics: formattedLyrics, // Add the formatted lyrics directly
    });
    setCurrentLine(0);
    setCurrentTime(0);
  };

  return (
    <div className="App">
      <div className="songs-list">
        <ul>
          {songs.map((song) => (
            <li
              key={song.id}
              onClick={() => handleSongSelect(song)}
              className={selectedSong?.id === song.id ? "song-selected" : ""}
            >
              {song.title}
              <br />
              <i>{song.artist}</i>{" "}
            </li>
          ))}
        </ul>
      </div>

      {selectedSong && (
        <>
          <LyricsDisplay
            lyrics={selectedSong.lyrics}
            currentLine={currentLine}
            onSeekToAndPlay={seekToAndPlay}
            onSeekToAndLyricPlay={seekToAndLyricPlay}
          />
          <YoutubeAudioPlayer
            ref={audioPlayerRef}
            song={selectedSong}
            onTimeUpdate={handleTimeUpdate}
          />
        </>
      )}
    </div>
  );
};

export default App;
