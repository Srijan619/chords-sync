import type { Song } from "../types";
import { calculateLyricsWithTimes } from "../utils/transformLyrics";

const LYRICAL_STARTING_TIME = 11; // The starting time in seconds
const LYRICAL_INTERVAL = 4; // The time gap in seconds between each lyric entry

const song: Song = {
  title: "Hajar Janma",
  artist: "Rockheads",
  albumArtUrl:
    "https://e-cdn-images.dzcdn.net/images/artist/80517378b8f30393f5bde0a23f96f689/500x500-000000-80-0-0.jpg",
  videoId: "iavYg5-ZwTc",
  lyrics: [
    { lyricalTime: 0, chordTime: 0, text: "Intro Music.." }, // Musical introduction
    ...calculateLyricsWithTimes(LYRICAL_STARTING_TIME, LYRICAL_INTERVAL, [
      "तिम्रो लागि एक होइन",
      "हजारै जन्म पनि लिउला म",
      "म............",
      "खुसि सारेर तिमीलाई दिएर",
      "आसु सबै आफै लिउला म",
      "म............",
      "आखा तिमीलाई हेरी रहन्छ",
      "तर किन सपना लाग्छ",
      "सपना नै हो भने यो",
      "अब साएद नबिउझिउला म",
      "म............",
      "Musical break.....",
      "Musical break.....",
      "Musical break.....",
      "Musical break.....",
      "Musical break.....",
      "मेरो सुख हरु तिम्रो",
      "तिम्रो दुख हरु हाम्रो",
      "सबै चाहना संगै अटौला",
      "सारा इश्वोर सचि राखी",
      "तिम्रो सफलताको लागि",
      "दैब संग पनि ढातौला",
      "मन मात्र होइन मेरो",
      "आत्मा नै सुम्पिदिउला म",
      "म............",
      "तिम्रो लागि एक होइन",
      "हजारै जन्म पनि लिउला म",
      "म............",
      "Solo music.....",
    ]),
  ],
};

export { song as HajarJanma };
