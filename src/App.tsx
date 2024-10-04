import React, { useState, useEffect, useRef, Children } from "react";
import AudioPlayer from "./components/AudioPlayer";
import "./App.css";

// Lyrics with timestamps
interface Lyric {
  lyricalTime: number;
  chordTime: number;
  text: string;
}

interface Song {
  title: string;
  artist: string;
  albumArtUrl: string;
  lyrics: Lyric[];
}

const song: Song = {
  title: "Sparsha sangeet",
  artist: "Purna Rai",
  albumArtUrl:
    "https://e-cdn-images.dzcdn.net/images/cover/6356360ed951c3ff4e8b516b0e31ef58/500x500-000000-80-0-0.jpg",
  lyrics: [
    { lyricalTime: 0, chordTime: 0, text: "Intro Music.." },
    { lyricalTime: 28, chordTime: 28.5, text: "गाजलु तिम्रा आँखा," },
    { lyricalTime: 32, chordTime: 32.5, text: "लजालु भाका तिम्रा" },
    { lyricalTime: 36, chordTime: 36.5, text: "अड्कल नै गर्न गाह्रो," },
    { lyricalTime: 40, chordTime: 40.5, text: "बयानै गरूँ कहाँबाट?" },
    { lyricalTime: 44, chordTime: 44.5, text: "केशको लय समाऊँ कि?" },
    { lyricalTime: 47, chordTime: 48.5, text: "ओठमा लाली सजाउनी" },
    { lyricalTime: 51, chordTime: 52.5, text: "उज्यालो मुस्कान बताऊँ कि?" },
    { lyricalTime: 55, chordTime: 56.5, text: "मनै शुद्ध झल्काउँछिन्" },
    { lyricalTime: 59, chordTime: 60.5, text: "टाढिएर नजाऊ तिमी, हेर," },
    { lyricalTime: 63, chordTime: 64.5, text: "विश्वास गर मलाई एकफेर" },
    { lyricalTime: 67, chordTime: 68.5, text: "सहजै काटौँला यो जिन्दगी," },
    { lyricalTime: 71, chordTime: 72.5, text: "जाँदैन तिम्रो माया है खेर" },
    { lyricalTime: 74, chordTime: 76.5, text: "माया छ नि यतै मैतिर," },
    { lyricalTime: 78, chordTime: 80.5, text: "दौडी आउनू, अँगाल्नू एकफेर" },
    { lyricalTime: 82, chordTime: 84.5, text: "दुई कदम तिमी सार्नू अनि" },
    { lyricalTime: 86, chordTime: 88.5, text: "दुई कदम मै सारौँला....." },
    { lyricalTime: 89, chordTime: 92.5, text: "musical........" },
    { lyricalTime: 91, chordTime: 96.5, text: "Hooo ooo... Hoo ooo" },
    { lyricalTime: 95, chordTime: 100.5, text: "Ho ho ho ho hoo.." },
    { lyricalTime: 99, chordTime: 104.5, text: "Ho oooo... Hoooo......" },
    { lyricalTime: 103, chordTime: 108.5, text: "Ho ho ho ho hooooooo....." },
    { lyricalTime: 107, chordTime: 112.5, text: "Ho ho ho hohohoh........" },
    { lyricalTime: 111, chordTime: 116.5, text: "Ho ho ho ho ho ho........" },
    { lyricalTime: 114, chordTime: 120.5, text: "Hohoho........" },

    { lyricalTime: 116, chordTime: 124.5, text: "मेरी माया फूलजस्ती," },
    { lyricalTime: 120, chordTime: 128.5, text: "बगैँचामा फुलिरहनी" },
    {
      lyricalTime: 124,
      chordTime: 132.5,
      text: "मेरी माया चम्किला",
    },
    {
      lyricalTime: 128,
      chordTime: 136.5,
      text: "ताराहरूमा चम्किने जून",
    },
    { lyricalTime: 132, chordTime: 140.5, text: "मेरी माया आकाशमाथि," },
    { lyricalTime: 136, chordTime: 144.5, text: "मेरी माया धर्तीमा नि" },
    {
      lyricalTime: 140,
      chordTime: 148.5,
      text: "मेरी माया फराकिलै संसारमा",
    },
    {
      lyricalTime: 144,
      chordTime: 152.5,
      text: "फराकिलै सोच राख्छिन्",
    },
  ],
};

const LYRIC_LATENCY = -0.5; // TODO: Could be something to allow as configurable such that user can handle themseves?
const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const lyricsRef = useRef<HTMLDivElement | null>(null);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const [chords, setChords] = useState<{ [key: number]: string }>({});
  const audioPlayerRef = useRef<{
    play: () => void;
    pause: () => void;
    seekTo: (newTime: number) => void;
  }>(null);

  useEffect(() => {
    const line =
      song.lyrics.findIndex(
        (lyric) => lyric.lyricalTime > currentTime - LYRIC_LATENCY,
      ) - 1;
    if (line !== currentLine && line >= 0) {
      // Avoid scrolling to top when lyrics not found
      setCurrentLine(line);
      lyricsRef.current?.scrollTo({
        top: line * 30,
        behavior: "smooth",
      });
    }
  }, [currentTime, currentLine]);

  useEffect(() => {
    // Fetch chords data from the backend
    const fetchChords = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notes");
        const data = await response.json();

        // Log the data to check API response
        console.log("Chord data from API:", data);

        // Set chords state with rounded timestamps
        const roundedChords = Object.entries(data).reduce(
          (acc, [key, value]) => {
            const roundedKey = Math.round(parseFloat(key) * 2) / 2; // Round to nearest 0.5 seconds
            acc[roundedKey] = value;
            return acc;
          },
          {} as Record<number, string>,
        );

        console.log("Rounded chords..", roundedChords);
        setChords(roundedChords);
      } catch (error) {
        console.error("Error fetching chords data:", error);
      }
    };

    fetchChords();
  }, []);

  const handleTimeUpdate = (currentTime: number) => {
    setCurrentTime(currentTime);
  };

  const handleLyricClick = (lyric: Lyric) => {
    console.log("Clicking indivudal lyric", lyric);
    setCurrentTime(lyric.lyricalTime);
    audioPlayerRef.current?.seekTo(lyric.lyricalTime);
    audioPlayerRef.current?.play();
  };

  return (
    <div className="App">
      <div className="lyrics-container" ref={lyricsRef}>
        {song.lyrics.map((lyric, index) => (
          <p
            key={index}
            className={`lyric-line ${index === currentLine ? "active" : ""}`}
            onClick={() => handleLyricClick(lyric)}
          >
            {lyric.text} - {chords[lyric.chordTime]}
          </p>
        ))}
      </div>
      <AudioPlayer
        ref={audioPlayerRef}
        title={song.title}
        artist={song.artist}
        albumArtUrl={song.albumArtUrl}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
};

export default App;
