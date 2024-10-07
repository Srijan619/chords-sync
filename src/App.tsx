import React, { useState, useEffect, useRef } from "react";
import YoutubeAudioPlayer from "./components/YoutubeAudioPlayer";
import LyricsDisplay from "./components/LyricsDisplay";
import Songs from "./components/Songs";
import Artists from "./components/Artists";
// import { SparshaSangeet, VananaMatra, HajarJanma } from "./testSongs";
import "./App.css";
import type { ChordInfo, SongInfoApiResponse, Song, Lyric } from "./types";
import { calculateLyricsWithTimes } from "./utils/transformLyrics";

const LOCAL_STORAGE_KEY = "cachedSongs";
const API_URL = import.meta.env.VITE_API_URL;
const LYRIC_LATENCY = -0.5; // TODO: Make configurable
const App: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null); // Use state for selected song
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const [isSongsLoading, setIsSongsLoading] = useState(false);
  const [isErrorLoadingSongs, setIsErrorLoadingSongs] = useState(false);
  const audioPlayerRef = useRef<{
    play: () => void;
    pause: () => void;
    handlePlayPause: () => void;
    seekTo: (newTime: number) => void;
  }>(null);

  // Fetch Songs
  useEffect(() => {
    useCacheAndFetchData();
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

    // @ts-ignore
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

    //fetchChords();
  }, [selectedSong]);

  // cache songs for slow API response

  const useCacheAndFetchData = () => {
    const cachedSongs = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedSongs) {
      updateFetchedDataState(JSON.parse(cachedSongs));
      fetchSongs();
    } else {
      fetchSongs();
    }
  };

  const fetchSongs = async () => {
    setIsSongsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/songs`);
      const data: Song[] = await response.json();
      updateFetchedDataState(data);

      // Save to cache
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching songs:", error);
      setIsErrorLoadingSongs(true);
    }
  };

  const updateFetchedDataState = (data: Song[]) => {
    setAllSongs(data);
    setFilteredSongs(data);
    handleSongSelect(data[0]); // Select first song by default after fetching.... probably in future need to select last played? TODO ?
    setIsSongsLoading(false);
  };

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
      lyrics: formattedLyrics,
    });
    setCurrentLine(0);
    setCurrentTime(0);
  };

  const handleArtistFilterSelected = (artistToFilter: string) => {
    if (!artistToFilter) {
      setFilteredSongs(allSongs);
    } else {
      const filteredSongs = allSongs.filter(
        (song: Song) => song.artist === artistToFilter,
      );
      setFilteredSongs(filteredSongs);
    }
  };

  return (
    <div className="App">
      {isSongsLoading && (
        <div>Fresh songs are being loaded in the background...</div>
      )}
      {isErrorLoadingSongs && <div>Error loading songs, try to refresh...</div>}
      <div className="side-by-side-songs-lyrics-container">
        <Songs
          filteredSongs={filteredSongs}
          selectedSong={selectedSong}
          handleSongSelect={handleSongSelect}
        />
        {selectedSong && (
          <LyricsDisplay
            lyrics={selectedSong.lyrics}
            currentLine={currentLine}
            onSeekToAndPlay={seekToAndPlay}
            onSeekToAndLyricPlay={seekToAndLyricPlay}
          />
        )}
      </div>
      {selectedSong && (
        <div className="floating-fixed-bottom-container">
          <Artists
            allSongs={allSongs}
            onArtistFilterSelected={handleArtistFilterSelected}
          />
          <YoutubeAudioPlayer
            ref={audioPlayerRef}
            song={selectedSong}
            onTimeUpdate={handleTimeUpdate}
            onArtistFilterSelected={handleArtistFilterSelected}
          />
        </div>
      )}
    </div>
  );
};

export default App;
