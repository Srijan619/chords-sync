import React, { useState, useEffect, useRef } from "react";
import YoutubeAudioPlayer from "./components/YoutubeAudioPlayer";
import LyricsDisplay from "./components/LyricsDisplay";
import Songs from "./components/Songs";
import Artists from "./components/Artists";
// import { SparshaSangeet, VananaMatra, HajarJanma } from "./testSongs";
import "./App.css";
import type { ChordInfo, SongInfoApiResponse, Song, Lyric } from "./types";
import { calculateLyricsWithTimes } from "./utils/transformLyrics";
import { createPortal } from "react-dom";

const LOCAL_STORAGE_CACHED_SONGS = "cachedSongs";
const LOCAL_STORAGE_NOW_PLAYING = "nowPlayingMeta";
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
  const [isChordFetched, setIsChordFetched] = useState(false);
  const [lyricsOnlyMode, setLyricsOnlyMode] = useState(false);

  const fullScreenRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<{
    play: () => void;
    pause: () => void;
    handlePlayPause: () => void;
    seekTo: (newTime: number) => void;
    playOnlyIfPaused: () => void;
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
    // Save status of now playing song to cache (regularly when time, line and selectedSong changes)
    saveNowPlayingSongStatus();
  }, [currentTime, currentLine, selectedSong]);

  // Fetch chords for the selected song
  useEffect(() => {
    if (!selectedSong) return; // Do nothing if no song is selected

    if (isChordFetched) return;
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
      } finally {
        setIsChordFetched(true);
      }
    };

    fetchChords();
  }, [selectedSong]);

  // cache songs for slow API response

  const useCacheAndFetchData = () => {
    const cachedSongs = localStorage.getItem(LOCAL_STORAGE_CACHED_SONGS);
    if (cachedSongs) {
      updateFetchedDataState(JSON.parse(cachedSongs));
      fetchSongs();
    } else {
      fetchSongs();
    }

    restoreSession(); // Try and restore now playing session
  };

  const fetchSongs = async () => {
    setIsSongsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/songs`);
      const data: Song[] = await response.json();

      // Format the songs before updating state or caching
      const formattedSongs = data.map((song) => {
        const formattedLyrics = calculateLyricsWithTimes(
          song.lyrics_starting_time,
          song.lyrics_time_interval,
          song.lyrics.toString(),
        );
        return {
          ...song,
          lyrics: formattedLyrics,
        };
      });

      updateFetchedDataState(formattedSongs);

      // Save to cache
      localStorage.setItem(
        LOCAL_STORAGE_CACHED_SONGS,
        JSON.stringify(formattedSongs),
      );
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setIsErrorLoadingSongs(true);
      setIsSongsLoading(false);
      setTimeout(() => {
        setIsErrorLoadingSongs(false); // Auto hide error loading container after a second
      }, 1000);
    }
  };

  const updateFetchedDataState = (data: Song[]) => {
    setAllSongs(data);
    setFilteredSongs(data);
    setIsSongsLoading(false);
  };

  const handleTimeUpdate = (time: number) => setCurrentTime(time);

  const seekToAndLyricPlay = (lyric: Lyric) => {
    setCurrentTime(lyric.lyricalTime);
    audioPlayerRef.current?.seekTo(lyric.lyricalTime);
    audioPlayerRef.current?.playOnlyIfPaused();
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
    setSelectedSong(song);
    setCurrentLine(0);
    setCurrentTime(0);
    setIsChordFetched(false);
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

  // Track last played song and its detail

  const saveNowPlayingSongStatus = () => {
    const meta = {
      selectedSong: selectedSong,
      currentTime: currentTime,
      currentLine: currentLine,
    };
    localStorage.setItem(LOCAL_STORAGE_NOW_PLAYING, JSON.stringify(meta));
  };

  const restoreSession = () => {
    const nowPlayingMeta = localStorage.getItem(LOCAL_STORAGE_NOW_PLAYING);
    if (nowPlayingMeta) {
      const jsonNowPlayingMeta = JSON.parse(nowPlayingMeta);
      setSelectedSong(jsonNowPlayingMeta.selectedSong);
      setCurrentLine(jsonNowPlayingMeta.currentLine);
      setCurrentTime(jsonNowPlayingMeta.currentTime);
    }
  };

  const handlePlayNextSong = () => {
    const currentIndex = allSongs.findIndex(
      (song: Song) => song.id === selectedSong?.id,
    );

    // If the current song is not found or it's the last song, do nothing or loop back to the first song
    if (currentIndex === -1) {
      handleSongSelect(allSongs[0]);
    } else {
      const nextIndex =
        currentIndex + 1 >= allSongs.length ? 0 : currentIndex + 1;
      handleSongSelect(allSongs[nextIndex]);
    }

    audioPlayerRef.current?.handlePlayPause();
  };

  const toggleLyricsOnlyMode = () => {
    if (!lyricsOnlyMode) {
      fullScreenRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }

    setLyricsOnlyMode((prev) => !prev);
  };

  // Sync state if user manually exits fullscreen
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setLyricsOnlyMode(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  return (
    <div className="App">
      {isSongsLoading && (
        <div>Fresh songs are being loaded in the background...</div>
      )}
      {isErrorLoadingSongs && <div>Error loading songs, try to refresh...</div>}

      <button className="fullscreen-btn" onClick={toggleLyricsOnlyMode}>
        {lyricsOnlyMode ? "⛶" : "⤢"}
      </button>

      {/* Portal Fullscreen Lyrics - Always Mounted */}
      {createPortal(
        <div
          ref={fullScreenRef}
          className={`full-screen-mode ${lyricsOnlyMode ? "visible" : "hidden"}`}
        >
          {selectedSong && (
            <>
              <LyricsDisplay
                lyrics={selectedSong.lyrics}
                currentLine={currentLine}
                onSeekToAndPlay={seekToAndPlay}
                onSeekToAndLyricPlay={seekToAndLyricPlay}
              />
              <button className="fullscreen-btn" onClick={toggleLyricsOnlyMode}>
                {lyricsOnlyMode ? "⛶" : "⤢"}
              </button>
            </>
          )}
        </div>,
        document.body,
      )}

      {/* Non-Fullscreen Mode */}
      <div
        className={`non-fullscreen-mode ${lyricsOnlyMode ? "hidden" : "visible"}`}
      >
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
              currentTime={currentTime}
              onPlayNext={handlePlayNextSong}
              onTimeUpdate={handleTimeUpdate}
              onArtistFilterSelected={handleArtistFilterSelected}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
