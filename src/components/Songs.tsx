import React from "react";
import { Song } from "../types";
import MusicBeat from "./MusicBeat";
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
            {/* {selectedSong?.id === song.id && ( */}
            {/*   <div className={styles["song-selected-now-playing"]}> */}
            {/*     Playing now */}
            {/*     <MusicBeat /> */}
            {/*   </div> */}
            {/* )} */}
            <img src={song.album_art_url} alt={song.artist} />
            <div className={styles["song-title-artist-container"]}>
              <span>{song.title}</span>
              <br />
              <i>{song.artist}</i>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongList;
