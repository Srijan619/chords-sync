import type { Song } from "../types";
import { calculateLyricsWithTimes } from "../utils/transformLyrics";

const LYRICAL_STARTING_TIME = 28; // Starting time for Sparsha Sangeet
const LYRICAL_INTERVAL = 4; // The time gap between each lyric entry

const song: Song = {
  title: "Sparsha Sangeet",
  artist: "Purna Rai",
  albumArtUrl:
    "https://e-cdn-images.dzcdn.net/images/cover/6356360ed951c3ff4e8b516b0e31ef58/500x500-000000-80-0-0.jpg",
  videoId: "s-ln780yJpI",
  lyrics: [
    { lyricalTime: 0, chordTime: 0, text: "Intro Music.." }, // Musical introduction
    ...calculateLyricsWithTimes(LYRICAL_STARTING_TIME, LYRICAL_INTERVAL, [
      "गाजलु तिम्रा आँखा,",
      "लजालु भाका तिम्रा",
      "अड्कल नै गर्न गाह्रो,",
      "बयानै गरूँ कहाँबाट?",
      "केशको लय समाऊँ कि?",
      "ओठमा लाली सजाउनी",
      "उज्यालो मुस्कान बताऊँ कि?",
      "मनै शुद्ध झल्काउँछिन्",
      "टाढिएर नजाऊ तिमी, हेर,",
      "विश्वास गर मलाई एकफेर",
      "सहजै काटौँला यो जिन्दगी,",
      "जाँदैन तिम्रो माया है खेर",
      "माया छ नि यतै मैतिर,",
      "दौडी आउनू, अँगाल्नू एकफेर",
      "दुई कदम तिमी सार्नू अनि",
      "दुई कदम मै सारौँला.....",
      "musical........",
      "Hooo ooo... Hoo ooo",
      "Ho ho ho ho hoo..",
      "Ho oooo... Hoooo......",
      "Ho ho ho ho hooooooo.....",
      "Ho ho ho hohohoh........",
      "Ho ho ho ho ho ho........",
      "Hohoho........",
      "मेरी माया फूलजस्ती,",
      "बगैँचामा फुलिरहनी",
      "मेरी माया चम्किला",
      "ताराहरूमा चम्किने जून",
      "मेरी माया आकाशमाथि,",
      "मेरी माया धर्तीमा नि",
      "मेरी माया फराकिलै संसारमा",
      "फराकिलै सोच राख्छिन्",
    ]),
  ],
};

export { song as SparshaSangeet };
