export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
}

export interface Playlist {
  name: string;
  description: string;
  tracks: Track[];
  saveCode?: string;
}

export enum LoopMode {
  NONE = "none",
  TRACK = "track",
  PLAYLIST = "playlist",
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // in seconds
  duration: number; // in seconds
  volume: number; // 0 to 1
  isMuted: boolean;
  isShuffle: boolean;
  loopMode: LoopMode;
  queue: Track[];
  history: Track[];
  currentPlaylist: Playlist | null;
}
