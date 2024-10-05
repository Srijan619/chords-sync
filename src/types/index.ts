// Lyrics with timestamps
export interface Lyric {
  lyricalTime: number;
  chordTime: number;
  text: string;
  chord?: ChordInfo | null;
}

export interface ChordInfo {
  timestamp: number;
  pitched_common_mame: string;
  pitches: string[];
  chord_name: string;
}

export interface TempoInfo {
  tempo: number;
}

export interface KeyInfo {
  key_name: string;
}

export interface TimeSignatureInfo {
  beats_per_measure: number;
  beat_type: number;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  album_art_url: string;
  video_id: string;
  lyrics: Lyric[];
  tempo?: TempoInfo;
  key?: KeyInfo;
  time_signature?: TimeSignatureInfo;
}

export interface SongInfoApiResponse {
  chords: ChordInfo[];
  tempo: TempoInfo;
  key: KeyInfo;
  time_signature: TimeSignatureInfo;
}
