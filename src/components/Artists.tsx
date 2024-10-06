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
  const [showArtists, setShowArtists] = useState(false);

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

  const handleShowArtists = () => {
    setShowArtists(!showArtists);
  };

  const hideArtistsStyle = {
    transform: "rotate(270deg)",
    left: "-4rem",
    bottom: "0rem",
    background: "var(--color-fill)",
  };

  return (
    <div className={styles["artist-list-container"]}>
      <button
        className={styles["show-artists"]}
        style={!showArtists ? {} : hideArtistsStyle}
        onClick={handleShowArtists}
      >
        {showArtists ? "Hide" : "Show"} artists....
      </button>
      <div className={styles["artist-list"]}>
        {showArtists &&
          allSongs.map(({ artist, album_art_url, id }) => (
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
    </div>
  );
};

export default Artists;
