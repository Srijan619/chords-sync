import React from "react";
import { Song } from "../types";
import styles from "../songs.module.css";

interface SongListProps {
  filteredSongs: Song[];
  selectedSong: Song | null;
  handleSongSelect: (song: Song) => void;
}

const SongList: React.FC<SongListProps> = ({
  filteredSongs,
  selectedSong,
  handleSongSelect,
}) => {
  return (
    <div className={styles["songs-list"]}>
      <b>All songs</b>
      <ul>
        {filteredSongs.map((song) => (
          <li
            key={song.id}
            onClick={() => handleSongSelect(song)}
            className={
              selectedSong?.id === song.id ? styles["song-selected"] : ""
            }
          >
            {selectedSong?.id === song.id && (
              <div className={styles["song-selected-now-playing"]}>
                Playing now
              </div>
            )}
            {song.title}
            <br />
            <i>{song.artist}</i>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongList;
