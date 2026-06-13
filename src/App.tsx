import { useState, useEffect, useRef } from "react";
import {
  Heart,
  Music,
  Clock,
  Play,
  Pause,
  Shuffle,
  Repeat,
  Volume2,
  Trash2,
  ListMusic,
  Plus,
  Compass,
  Code,
  Laptop,
} from "lucide-react";
import { Playlist, Track, LoopMode } from "./types";
import { DEFAULT_TRACKS, CURATED_PLAYLISTS, COVER_IMAGES } from "./data";
import Sidebar from "./components/Sidebar";
import PlaylistView from "./components/PlaylistView";
import PlayerControls from "./components/PlayerControls";
import LyricsPanel from "./components/LyricsPanel";
import SpotifyImport from "./components/SpotifyImport";

// Import Firebase config
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function App() {
  // Playlists store
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [activeView, setActiveView] = useState<"home" | "playlist" | "import">("home");

  // Playback core state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>(LoopMode.NONE);

  // Layout panels
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Queues & History tracking arrays
  const [activeQueue, setActiveQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  // Audio HTML DOM element Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Local clock state for ambient home screen greeting
  const [greeting, setGreeting] = useState("Welcome");

  // Load playlists from localStorage on mount & set home greeting
  useEffect(() => {
    // 1. Restore playlists from LocalStorage
    const storedPl = localStorage.getItem("spotify_playlists");
    if (storedPl) {
      try {
        const parsed = JSON.parse(storedPl);
        setPlaylists(parsed);
      } catch (err) {
        setPlaylists(CURATED_PLAYLISTS);
      }
    } else {
      setPlaylists(CURATED_PLAYLISTS);
    }

    // 2. Set beautiful ambient greeting
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good Morning");
    else if (hours < 18) setGreeting("Good Day");
    else setGreeting("Good Evening");
  }, []);

  // Save playlists locally whenever modified
  const persistPlaylistsLocally = (updated: Playlist[]) => {
    setPlaylists(updated);
    try {
      localStorage.setItem("spotify_playlists", JSON.stringify(updated));
    } catch (e) {
      console.warn("Local storage capacity full. Local fallback utilized.");
    }
  };

  // HTML Audio Events binding
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onAudioEnded = () => {
      handleTrackEnded();
    };

    // Attach listeners
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onAudioEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onAudioEnded);
    };
  }, [activeQueue, queueIndex, loopMode, isShuffle]);

  // Audio resource synchronisation
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;
    
    // Check if source changed
    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    }

    // Play or pause
    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn("Playback blocked by browser audio policy. User interaction required:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]);

  // Sync Volume & Muted states
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Select a song and compile its active queue/queueIndex
  const handleTrackSelect = (track: Track, playlistTracks: Track[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);

    const index = playlistTracks.findIndex((t) => t.id === track.id);
    setActiveQueue(playlistTracks);
    setQueueIndex(index);
  };

  // Toggle playback
  const handlePlayPauseToggle = () => {
    if (!currentTrack) {
      // Fallback: Start first default track
      handleTrackSelect(DEFAULT_TRACKS[0], DEFAULT_TRACKS);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  // Next song
  const handleNextTrack = () => {
    if (activeQueue.length === 0) return;

    let nextIdx = queueIndex + 1;

    if (isShuffle) {
      // Pick random index excluding current
      nextIdx = Math.floor(Math.random() * activeQueue.length);
    }

    if (nextIdx >= activeQueue.length) {
      if (loopMode === LoopMode.PLAYLIST) {
        nextIdx = 0;
      } else {
        // End of queue
        setIsPlaying(false);
        setCurrentTime(0);
        return;
      }
    }

    setQueueIndex(nextIdx);
    setCurrentTrack(activeQueue[nextIdx]);
    setIsPlaying(true);
  };

  // Previous song
  const handlePrevTrack = () => {
    if (activeQueue.length === 0) return;

    let prevIdx = queueIndex - 1;

    if (prevIdx < 0) {
      if (loopMode === LoopMode.PLAYLIST) {
        prevIdx = activeQueue.length - 1;
      } else {
        // Stay on first track, reset progress
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
        }
        return;
      }
    }

    setQueueIndex(prevIdx);
    setCurrentTrack(activeQueue[prevIdx]);
    setIsPlaying(true);
  };

  // Track ended handler
  const handleTrackEnded = () => {
    if (loopMode === LoopMode.TRACK) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setCurrentTime(0);
    } else {
      handleNextTrack();
    }
  };

  // Toggle loop modes
  const handleLoopToggle = () => {
    setLoopMode((prev) => {
      if (prev === LoopMode.NONE) return LoopMode.PLAYLIST;
      if (prev === LoopMode.PLAYLIST) return LoopMode.TRACK;
      return LoopMode.NONE;
    });
  };

  // Manual Seek
  const handleSeek = (timeSecs: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeSecs;
      setCurrentTime(timeSecs);
    }
  };

  // Load shared playlist via save code from Firestore
  const handleLoadSaveCode = async (code: string): Promise<boolean> => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) return false;

    // Check configuration
    if (!isFirebaseConfigured || !db) {
      // Sandbox fallback: check if code exists in local memory
      const match = playlists.find((p) => p.saveCode === cleanCode);
      if (match) {
        setSelectedPlaylist(match);
        return true;
      }
      return false;
    }

    const pathForGet = `playlists/${cleanCode}`;
    try {
      const docRef = doc(db, "playlists", cleanCode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const val = docSnap.data();
        const playlistObj: Playlist = {
          name: val.name,
          description: val.description || `Cloud Sync Code: ${cleanCode}`,
          tracks: val.tracks,
          saveCode: cleanCode,
        };

        // Append to local directory if not already there, matching name
        const exists = playlists.some((p) => p.saveCode === cleanCode || p.name === playlistObj.name);
        if (!exists) {
          persistPlaylistsLocally([...playlists, playlistObj]);
        }

        setSelectedPlaylist(playlistObj);
        return true;
      }
      return false;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, pathForGet);
      return false;
    }
  };

  // Save current dynamic playlist to Firestore, returning 6-digit saveCode
  const handleCloudShare = async (playlistToShare: Playlist) => {
    setIsSharing(true);

    try {
      // 1. Generate unique 6-digit alphanumeric code
      const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const saveCode = playlistToShare.saveCode || randStr;

      // 2. Prepare schema payload matching SharedPlaylist entity definitions
      const payload = {
        saveCode: saveCode,
        name: playlistToShare.name,
        description: playlistToShare.description || `A template shared code: ${saveCode}`,
        tracks: playlistToShare.tracks,
        createdAt: new Date().toISOString(),
      };

      if (isFirebaseConfigured && db) {
        const pathForWrite = `playlists/${saveCode}`;
        try {
          const docRef = doc(db, "playlists", saveCode);
          await setDoc(docRef, payload);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, pathForWrite);
        }
      } else {
        console.warn("Cloud connection not ready. Shared temporarily in Sandbox mode!");
      }

      // Add code to parent object in memory & update lists
      const updatedList = playlists.map((p) => {
        if (p.name === playlistToShare.name) {
          return { ...p, saveCode: saveCode };
        }
        return p;
      });

      persistPlaylistsLocally(updatedList);
      setSelectedPlaylist({ ...playlistToShare, saveCode: saveCode });

    } catch (error) {
      console.error("Cloud share upload failed:", error);
    } finally {
      setIsSharing(false);
    }
  };

  // Add imported Spotify playlist to local/cloud lists
  const handleImportSuccess = (importedPlaylist: Playlist) => {
    // Unique check
    const exists = playlists.some((p) => p.name === importedPlaylist.name);
    let updated;
    if (exists) {
      // Override/Refresh
      updated = playlists.map((p) => (p.name === importedPlaylist.name ? importedPlaylist : p));
    } else {
      updated = [...playlists, importedPlaylist];
    }

    persistPlaylistsLocally(updated);
    setSelectedPlaylist(importedPlaylist);
    setActiveView("playlist");
  };

  // Safe playlist creation
  const handleCreateEmptyPlaylist = () => {
    const plName = `My Playlist #${playlists.length + 1}`;
    const newPlaylist: Playlist = {
      name: plName,
      description: "Custom playlist curated by user.",
      tracks: DEFAULT_TRACKS.slice(0, 3), // Populate with a few high quality samples immediately
    };

    persistPlaylistsLocally([...playlists, newPlaylist]);
    setSelectedPlaylist(newPlaylist);
    setActiveView("playlist");
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white font-sans overflow-hidden antialiased">
      
      {/* Upper Layout Workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden p-2 gap-2">
        
        {/* Navigation Sidebar Drawer */}
        <Sidebar
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          onSelectPlaylist={setSelectedPlaylist}
          onLoadSaveCode={handleLoadSaveCode}
          activeView={activeView}
          onSetView={setActiveView}
        />

        {/* Central Display Panel */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0 gap-2 h-full overflow-hidden">
          
          {/* Main Dashboard Router View */}
          <div className="flex-1 flex flex-col min-h-0 h-full">
            {activeView === "home" ? (
              <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 flex-1 h-full overflow-y-auto rounded-xl p-6 border border-neutral-800 relative scrollbar-thin">
                
                {/* Visual Top Highlight */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

                <div className="relative space-y-8 pb-12">
                  
                  {/* Greeting Block */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                    <div>
                      <h1 id="app-greeting-header" className="text-3xl font-black text-white tracking-tight">
                        {greeting}, Music Lover 🎵
                      </h1>
                      <p className="text-neutral-400 text-xs mt-1 font-medium">
                        Welcome to your responsive Spotify playback & sharing console.
                      </p>
                    </div>

                    <button
                      id="home-create-quick-btn"
                      onClick={handleCreateEmptyPlaylist}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 select-none font-bold text-xs rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer max-w-fit flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span>Create Playlist</span>
                    </button>
                  </div>

                  {/* Curated Grid Dashboard Cards */}
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4 font-semibold flex items-center gap-2">
                      <Compass className="w-4 h-4" /> CURATED SOUNDS
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {CURATED_PLAYLISTS.map((pl, idx) => (
                        <div
                          id={`curated-panel-${idx}`}
                          key={idx}
                          onClick={() => {
                            setSelectedPlaylist(pl);
                            setActiveView("playlist");
                          }}
                          className="group bg-neutral-900/40 hover:bg-neutral-800/60 border border-neutral-800/50 hover:border-emerald-500/10 rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden"
                        >
                          <div className="w-full aspect-square rounded-lg overflow-hidden border border-neutral-800 mb-3.5 shadow-lg select-none">
                            <img
                              id={`curated-cover-${idx}`}
                              src={pl.tracks[0]?.coverUrl}
                              alt={pl.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <span className="text-xs text-emerald-500 font-mono tracking-wider font-bold block mb-1">STATION</span>
                            <h3 className="font-bold text-white text-sm tracking-tight truncate">{pl.name}</h3>
                            <p className="text-xs text-neutral-400 truncate mt-1 leading-relaxed">{pl.description}</p>
                          </div>
                          <span className="absolute bottom-4 right-4 p-2 bg-emerald-500 text-neutral-950 rounded-full shadow opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 active:scale-90">
                            <Play className="w-4 h-4 fill-current stroke-none pl-0.5" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Playable Songs Shelf */}
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4 font-semibold flex items-center gap-2">
                      <Music className="w-4 h-4" /> EXPLORE REAL STREAMS
                    </h2>
                    <div className="bg-neutral-900/30 border border-neutral-800/60 rounded-xl p-4 overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {DEFAULT_TRACKS.map((track) => (
                          <div
                            id={`explore-row-${track.id}`}
                            key={track.id}
                            onClick={() => handleTrackSelect(track, DEFAULT_TRACKS)}
                            className="flex items-center gap-3 p-2 bg-neutral-950/45 hover:bg-neutral-900/70 rounded-lg cursor-pointer border border-neutral-800/10 transition-colors group"
                          >
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-10 h-10 rounded object-cover shadow border border-neutral-900 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1 truncate">
                              <span className="font-semibold text-xs text-white block truncate group-hover:text-emerald-400 transition-colors">
                                {track.title}
                              </span>
                              <span className="text-[10px] text-neutral-400 block truncate mt-0.5">{track.artist}</span>
                            </div>
                            <span className="p-1 px-2.5 bg-neutral-900 text-neutral-400 text-[10px] font-bold rounded-md group-hover:bg-emerald-500 group-hover:text-neutral-950 transition-colors shrink-0 select-none uppercase tracking-wider">
                              Play
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cloud Workspace Integration block */}
                  {!isFirebaseConfigured && (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5 flex items-start gap-4 shadow-md">
                      <Laptop className="w-10 h-10 text-amber-500/60 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-500">Cloud Share Engine Offline fallback</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                          The cloud sharing network is booting or offline. Complete the terms configuration step in the setup workspace panel to authorize continuous Firestore. During this, all playlists saved remain perfectly stored in your <span className="text-amber-400 font-semibold">Local state</span>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Spotify URL import component */}
                  <SpotifyImport onImportSuccess={handleImportSuccess} />

                </div>
              </div>
            ) : activeView === "import" ? (
              <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 flex-1 h-full overflow-y-auto rounded-xl p-6 border border-neutral-800 relative scrollbar-thin">
                <div className="max-w-xl mx-auto space-y-6 pt-6">
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-black text-white">Create & Import Workspace</h1>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                      Import active public Spotify playlists, or bootstrap empty sound matrices to paint chords manually.
                    </p>
                  </div>
                  
                  <SpotifyImport onImportSuccess={handleImportSuccess} />

                  <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <h4 className="font-bold text-sm text-white">Curated Manual Template</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Start fresh with some acoustic lo-fi presets.</p>
                    </div>
                    <button
                      id="import-create-manual"
                      onClick={handleCreateEmptyPlaylist}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-full transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Create Fresh
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              selectedPlaylist && (
                <PlaylistView
                  playlist={selectedPlaylist}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onTrackSelect={handleTrackSelect}
                  onTogglePlay={handlePlayPauseToggle}
                  onCloudShare={handleCloudShare}
                  isSharing={isSharing}
                  onBackToHome={() => setActiveView("home")}
                />
              )
            )}
          </div>

          {/* Sync Scrolling Lyrics Drawer right panel */}
          {isLyricsOpen && (
            <div className="w-full lg:w-80 shrink-0 h-80 lg:h-full">
              <LyricsPanel currentTrack={currentTrack} currentTime={currentTime} />
            </div>
          )}

        </div>
      </div>

      {/* Media Playback bottom bar controls panel */}
      <PlayerControls
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        loopMode={loopMode}
        onPlayPauseToggle={handlePlayPauseToggle}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onShuffleToggle={() => setIsShuffle(!isShuffle)}
        onLoopToggle={handleLoopToggle}
        onVolumeChange={setVolume}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onSeek={handleSeek}
        onLyricsToggle={() => setIsLyricsOpen(!isLyricsOpen)}
        isLyricsOpen={isLyricsOpen}
      />
    </div>
  );
}
