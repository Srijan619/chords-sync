import React from "react";
import styles from "../musicbeat.module.css";

const SongList: React.FC = () => {
  return (
    <div className={styles["music-container"]}>
      <div className={styles["music-beat"]}></div>
      <div className={styles["music-beat"]}></div>
      <div className={styles["music-beat"]}></div>
    </div>
  );
};

export default SongList;
