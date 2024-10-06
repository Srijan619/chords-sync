import React from "react";
import styles from "../Artists.module.css";
import type { Song } from "../types";

interface ArtistListProps {
  allSongs: Song[];
}

const Artists: React.FC<ArtistListProps> = ({ allSongs }) => {
  return (
    <div className={styles["artist-list"]}>
      {allSongs.map(({ artist, album_art_url, id }) => (
        <div key={id} className={styles["artist-item"]}>
          <img src={album_art_url} alt={artist} />
          <p>{artist}</p>
        </div>
      ))}
    </div>
  );
};

export default Artists;
