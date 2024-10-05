const LYRICAL_INTERVAL = 4; // The time gap in seconds between each lyric entry

export const calculateLyricsWithTimes = (
  startingTime: number = 0,
  lyricalInterval: number = LYRICAL_INTERVAL,
  lyric: string,
) => {
  // Split the lyric string into an array and trim each entry
  const lyrics = lyric
    .split(",")
    .map((line) => line.trim())
    .filter((line) => line); // Remove empty strings
  console.log("Lyrics..", lyric);
  return lyrics.map((text, index) => {
    const lyricalTime = startingTime + index * lyricalInterval; // Calculate lyrical time
    const chordTime = lyricalTime + 0.5; // Chord time is slightly after lyrical time
    return { lyricalTime, chordTime, text };
  });
};
