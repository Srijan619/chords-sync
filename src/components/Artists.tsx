import React, { useState } from "react";
import styles from "../Artists.module.css";
import type { Song } from "../types";

interface ArtistListProps {
  allSongs: Song[];
  onArtistFilterSelected: (artistFilterSelected: string) => void;
}

const Artists: React.FC<ArtistListProps> = ({
  allSongs,
  onArtistFilterSelected,
}) => {
  const [selectedArtist, setSelectedArtist] = useState("");

  const handleArtistClick = (artist: string) => {
    console.log("Artist clicked..", artist);
    if (selectedArtist && selectedArtist === artist) {
      onArtistFilterSelected("");
      setSelectedArtist("");
    } else {
      onArtistFilterSelected(artist);
      setSelectedArtist(artist);
    }
  };
  return (
    <div className={styles["artist-list"]}>
      {allSongs.map(({ artist, album_art_url, id }) => (
        <div
          key={id}
          className={`${styles["artist-item"]} ${selectedArtist && selectedArtist === artist ? styles["artist-item-selected"] : ""}`}
          onClick={() => handleArtistClick(artist)}
        >
          <img src={album_art_url} alt={artist} />
          <p>{artist}</p>
        </div>
      ))}
    </div>
  );
};

export default Artists;
