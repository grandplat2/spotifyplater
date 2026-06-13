import { Playlist, Track } from "./types";

// Unsplash cover arts
export const COVER_IMAGES = {
  lofi: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80",
  synthwave: "https://images.unsplash.com/photo-1515462277126-270d878326e5?w=500&q=80",
  indie: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80",
  jazz: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80",
  classical: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&q=80",
  workout: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
  gaming: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&q=80",
};

export const TRACK_LYRICS: Record<string, string[]> = {
  "Sunrise Mirage": [
    "[0:00] (Instrumental Chill Lo-Fi Intro)",
    "[0:12] Golden light begins to filter through the trees",
    "[0:24] A gentle warmth riding on the morning breeze",
    "[0:36] Let the rhythm guide your waking eyes",
    "[0:48] Underneath these pastel, quiet skies",
    "[1:00] (Smoothe sax solo)",
    "[1:20] Sunrise mirage fading far away",
    "[1:35] Welcoming another peaceful day",
    "[1:50] (Chilled out ambient fadeout)"
  ],
  "Midnight Drive": [
    "[0:00] (Synthwave Neon Bassline)",
    "[0:10] Chrome reflections on the highway lane",
    "[0:20] Driving fast to wash away the pain",
    "[0:32] Under purple lights on the city blocks",
    "[0:44] Racing past the shadows as the engine talks",
    "[0:56] Laser grids and midnight dreams",
    "[1:10] Nothing is as quiet as it seems",
    "[1:25] (Epic retro synth solo)",
    "[1:45] Midnight drive into the endless dark",
    "[2:00] Leaving behind a glowing electric spark"
  ],
  "Acoustic Sun": [
    "[0:00] (Soft folk guitar picking)",
    "[0:08] Feet in the grass, eyes on the hill",
    "[0:18] If time would freeze, if the world were still",
    "[0:28] Silver guitar strings humming a song",
    "[0:38] To the warm summer days where we both belong",
    "[0:48] Singing low, singing with the sea",
    "[0:58] Oh, the acoustic sun shines bright on me"
  ],
};

export const DEFAULT_TRACKS: Track[] = [
  {
    id: "t1",
    title: "Sunrise Mirage",
    artist: "Hologram Vibe",
    album: "Stardust EP",
    duration: 180,
    coverUrl: COVER_IMAGES.lofi,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "t2",
    title: "Midnight Drive",
    artist: "Retro Comet",
    album: "Neon Horizons",
    duration: 215,
    coverUrl: COVER_IMAGES.synthwave,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: "t3",
    title: "Acoustic Sun",
    artist: "Oliver & The Oak",
    album: "Wildflower Woods",
    duration: 195,
    coverUrl: COVER_IMAGES.indie,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: "t4",
    title: "Techno Beats",
    artist: "Cyber Grid",
    album: "Pulse Matrix",
    duration: 250,
    coverUrl: COVER_IMAGES.gaming,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: "t5",
    title: "Dreamy Ocean",
    artist: "Deep Tide",
    album: "Solitude Surf",
    duration: 160,
    coverUrl: COVER_IMAGES.classical,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: "t6",
    title: "Jazz Morning",
    artist: "The Lounge Trio",
    album: "Velvet Cafe",
    duration: 280,
    coverUrl: COVER_IMAGES.jazz,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: "t7",
    title: "Electro Pulse",
    artist: "Vortex Echo",
    album: "Hyper Drive",
    duration: 204,
    coverUrl: COVER_IMAGES.workout,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  }
];

export const CURATED_PLAYLISTS: Playlist[] = [
  {
    name: "Lo-Fi Studies",
    description: "Deep chill beats to study, code, and relax your mind.",
    tracks: [
      DEFAULT_TRACKS[0],
      DEFAULT_TRACKS[2],
      DEFAULT_TRACKS[4],
      DEFAULT_TRACKS[5],
    ]
  },
  {
    name: "Synthwave Horizons",
    description: "Retrofuturistic high-speed lasers and digital neon vibes.",
    tracks: [
      DEFAULT_TRACKS[1],
      DEFAULT_TRACKS[3],
      DEFAULT_TRACKS[6],
    ]
  },
  {
    name: "Acoustic Escape",
    description: "Serene acoustic folk strings and peaceful organic harmonies.",
    tracks: [
      DEFAULT_TRACKS[2],
      DEFAULT_TRACKS[4],
      DEFAULT_TRACKS[5],
    ]
  },
  {
    name: "Classic Calm & Jazz",
    description: "Smooth keys, elegant brass instruments and vintage sounds.",
    tracks: [
      DEFAULT_TRACKS[5],
      DEFAULT_TRACKS[4],
      DEFAULT_TRACKS[0],
    ]
  }
];
