import { useEffect, useState, useRef, ChangeEvent } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Music,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { LoopMode, Track } from "../types";

interface PlayerControlsProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  loopMode: LoopMode;
  onPlayPauseToggle: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onShuffleToggle: () => void;
  onLoopToggle: () => void;
  onVolumeChange: (vol: number) => void;
  onMuteToggle: () => void;
  onSeek: (time: number) => void;
  onLyricsToggle?: () => void;
  isLyricsOpen?: boolean;
}

export default function PlayerControls({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  loopMode,
  onPlayPauseToggle,
  onNextTrack,
  onPrevTrack,
  onShuffleToggle,
  onLoopToggle,
  onVolumeChange,
  onMuteToggle,
  onSeek,
  onLyricsToggle,
  isLyricsOpen,
}: PlayerControlsProps) {
  const [isLiked, setIsLiked] = useState(false);

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(e.target.value));
  };

  return (
    <div className="bg-neutral-950 border-t border-neutral-900 px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none shrink-0 relative bg-gradient-to-t from-black to-neutral-950/90 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] z-30">
      
      {/* Current Song Details Spot */}
      <div className="flex items-center gap-3.5 w-full md:w-1/4 min-w-0 justify-start">
        {currentTrack ? (
          <>
            <div className="w-14 h-14 rounded-lg overflow-hidden shadow-lg border border-neutral-800 shrink-0 select-none bg-neutral-900 group relative">
              <img
                id="player-control-cover"
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? "scale-105" : "scale-100"
                }`}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1 truncate">
              <p id="player-control-title" className="text-sm font-bold text-white leading-tight truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </p>
              <p id="player-control-artist" className="text-xs text-neutral-400 truncate hover:text-neutral-300 cursor-pointer mt-0.5 font-medium">
                {currentTrack.artist}
              </p>
            </div>
            <button
              id="player-control-heart-btn"
              onClick={() => setIsLiked(!isLiked)}
              className={`p-1 hover:scale-105 active:scale-95 transition-all outline-none ${
                isLiked ? "text-emerald-500 fill-emerald-500" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Heart className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-lg bg-neutral-900/60 flex items-center justify-center border border-neutral-800/80 text-neutral-600">
              <Music className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-400">Spotify Playback</p>
              <p className="text-xs text-neutral-600 mt-0.5">Select a song to start</p>
            </div>
          </>
        )}
      </div>

      {/* Main Playback Progress & Control Knobs */}
      <div className="flex flex-col items-center gap-2.5 w-full md:w-2/4">
        {/* Playback action buttons */}
        <div className="flex items-center gap-5 md:gap-6">
          
          {/* Shuffle button */}
          <button
            id="player-shuffle-btn"
            onClick={onShuffleToggle}
            className={`transition-colors p-1 relative rounded-full hover:bg-neutral-900 ${
              isShuffle ? "text-emerald-400" : "text-neutral-500 hover:text-neutral-300"
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && <span className="absolute bottom-1 left-2.5 w-1 h-1 bg-emerald-400 rounded-full" />}
          </button>

          {/* Previous song */}
          <button
            id="player-prev-btn"
            onClick={onPrevTrack}
            disabled={!currentTrack}
            className="text-neutral-500 hover:text-white disabled:text-neutral-800 disabled:cursor-not-allowed transition-colors p-1"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current stroke-none" />
          </button>

          {/* Play/Pause Pulsing center button */}
          <button
            id="player-play-pause-toggle"
            onClick={onPlayPauseToggle}
            disabled={!currentTrack}
            className="w-10 h-10 bg-white hover:scale-105 text-neutral-950 rounded-full flex items-center justify-center shadow transition-all duration-200 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:scale-100"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-neutral-950 stroke-none" />
            ) : (
              <Play className="w-4 h-4 fill-neutral-950 stroke-none pl-0.5" />
            )}
          </button>

          {/* Next song */}
          <button
            id="player-next-btn"
            onClick={onNextTrack}
            disabled={!currentTrack}
            className="text-neutral-500 hover:text-white disabled:text-neutral-800 disabled:cursor-not-allowed transition-colors p-1"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current stroke-none" />
          </button>

          {/* Repeat modes */}
          <button
            id="player-repeat-btn"
            onClick={onLoopToggle}
            className={`transition-colors p-1 relative rounded-full hover:bg-neutral-900 ${
              loopMode !== LoopMode.NONE ? "text-emerald-400" : "text-neutral-500 hover:text-neutral-300"
            }`}
            title={`Repeat: ${loopMode}`}
          >
            {loopMode === LoopMode.TRACK ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            {loopMode !== LoopMode.NONE && (
              <span className="absolute bottom-1 left-2.5 w-1 h-1 bg-emerald-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Dynamic length progress seek bar */}
        <div className="flex items-center gap-3 w-full max-w-lg">
          <span className="text-[10px] font-semibold text-neutral-500 w-8 text-right tabular-nums select-none">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative group py-2">
            <input
              id="player-seek-slider"
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              disabled={!currentTrack}
              className="w-full accent-emerald-500 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer outline-none hover:bg-neutral-700 transition-all focus:accent-emerald-400 group-hover:h-1.5"
            />
            <div
              className="absolute left-0 bottom-0 top-0 h-1 bg-emerald-500 rounded-lg pointer-events-none group-hover:h-1.5"
              style={{
                width: `${(currentTime / (duration || 1)) * 100}%`,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </div>
          <span className="text-[10px] font-semibold text-neutral-500 w-8 text-left tabular-nums select-none">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Utilities Column (Volume & Sync Lyrics control) */}
      <div className="flex items-center justify-end gap-3.5 w-full md:w-1/4 select-none">
        
        {/* Toggle Real Time Lyrics panel button */}
        {onLyricsToggle && (
          <button
            id="player-lyrics-toggle-btn"
            onClick={onLyricsToggle}
            disabled={!currentTrack}
            className={`px-3 py-1.5 rounded-full text-xs font-bold leading-none select-none transition-colors border active:scale-98 ${
              isLyricsOpen
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
            }`}
          >
            Lyrics
          </button>
        )}

        <div className="flex items-center gap-2 max-w-[120px] w-full shrink-0 group py-1">
          <button
            id="player-volume-mute-btn"
            onClick={onMuteToggle}
            disabled={!currentTrack}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <input
            id="player-volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            disabled={!currentTrack}
            className="w-full accent-emerald-500 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer outline-none hover:bg-neutral-700 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
