import { Clock, Play, Pause, Heart, ListMusic, CloudUpload, ArrowLeft } from "lucide-react";
import { Playlist, Track } from "../types";

interface PlaylistViewProps {
  playlist: Playlist;
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track, playlistTracks: Track[]) => void;
  onTogglePlay: () => void;
  onCloudShare: (playlist: Playlist) => void;
  isSharing: boolean;
  onBackToHome?: () => void;
}

export default function PlaylistView({
  playlist,
  currentTrack,
  isPlaying,
  onTrackSelect,
  onTogglePlay,
  onCloudShare,
  isSharing,
  onBackToHome,
}: PlaylistViewProps) {
  
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  const isCurrentPlaylistPlaying =
    isPlaying && currentTrack && playlist.tracks.some((t) => t.id === currentTrack.id);

  const handlePlaylistPlay = () => {
    if (playlist.tracks.length === 0) return;
    if (currentTrack && playlist.tracks.some((t) => t.id === currentTrack.id)) {
      onTogglePlay();
    } else {
      // Start from first track
      onTrackSelect(playlist.tracks[0], playlist.tracks);
    }
  };

  return (
    <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 text-neutral-300 flex-1 h-full overflow-y-auto rounded-xl border border-neutral-800 relative scrollbar-thin">
      
      {/* Detail Banner */}
      <div className="relative p-6 pt-12 md:p-8 md:pt-16 bg-gradient-to-b from-emerald-950/40 to-transparent flex flex-col md:flex-row items-start md:items-end gap-6 shrink-0 z-10">
        {onBackToHome && (
          <button
            id="playlist-back-btn"
            onClick={onBackToHome}
            className="absolute top-4 left-4 p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white transition-colors cursor-pointer border border-neutral-800/60"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="w-40 h-40 md:w-48 md:h-48 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden shrink-0 border border-neutral-800 select-none">
          {playlist.tracks.length > 0 ? (
            <img
              id="playlist-cover-banner"
              src={playlist.tracks[0].coverUrl}
              alt={playlist.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600">
              <ListMusic id="icon-playlist-blank" className="w-16 h-16 animate-pulse" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">PLAYLIST</span>
          <h1 id="playlist-title-header" className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight select-none">
            {playlist.name}
          </h1>
          <p id="playlist-description-para" className="text-sm text-neutral-400 font-medium max-w-xl">
            {playlist.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pt-2 select-none">
            <span className="font-semibold text-neutral-200">Spotify Applet</span>
            <span className="text-[8px]">•</span>
            <span>{playlist.tracks.length} track{playlist.tracks.length !== 1 ? "s" : ""}</span>
            <span className="text-[8px]">•</span>
            <span>
              Total: {formatDuration(playlist.tracks.reduce((acc, current) => acc + current.duration, 0))}
            </span>
            {playlist.saveCode && (
              <>
                <span className="text-[8px]">•</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-bold tracking-wider uppercase border border-emerald-500/15">
                  Code: {playlist.saveCode}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Control Action Sub-bar */}
      <div className="px-6 md:px-8 py-6 flex items-center gap-4 select-none shrink-0 border-t border-neutral-900/40 bg-neutral-950/20 backdrop-blur-sm sticky top-0 z-20">
        <button
          id="playlist-play-pause-big-btn"
          onClick={handlePlaylistPlay}
          className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-full flex items-center justify-center shadow-lg transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          {isCurrentPlaylistPlaying ? (
            <Pause className="w-6 h-6 fill-neutral-950 stroke-none" />
          ) : (
            <Play className="w-6 h-6 fill-neutral-950 stroke-none pl-1" />
          )}
        </button>

        <button
          id="playlist-cloud-share-btn"
          onClick={() => onCloudShare(playlist)}
          disabled={isSharing || playlist.tracks.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-950 disabled:text-neutral-600 hover:text-white rounded-full font-bold text-xs transition-colors cursor-pointer border border-neutral-800/80 active:scale-98"
        >
          {isSharing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Saving Code...</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{playlist.saveCode ? "Cloud Synced!" : "Save & Share Playlist"}</span>
            </>
          )}
        </button>
      </div>

      {/* Tracks Grid */}
      <div className="px-4 md:px-8 pb-12 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-sans table-auto">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500 font-semibold uppercase tracking-widest leading-none select-none">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3">Title</th>
              <th className="py-3 px-3 hidden sm:table-cell">Album</th>
              <th className="py-3 px-3 w-16 text-right">
                <Clock className="w-4 h-4 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {playlist.tracks.map((track, idx) => {
              const isActive = currentTrack?.id === track.id;
              
              return (
                <tr
                  id={`track-row-${track.id}`}
                  key={track.id}
                  onDoubleClick={() => onTrackSelect(track, playlist.tracks)}
                  className={`group border-b border-transparent hover:bg-neutral-900/50 rounded-lg cursor-pointer transition-colors ${
                    isActive ? "bg-emerald-500/5 text-emerald-400" : ""
                  }`}
                >
                  {/* Number / Sound Bars */}
                  <td className="py-3 px-3 text-center text-neutral-500 font-medium w-12 text-xs">
                    {isActive && isPlaying ? (
                      <div className="flex items-end justify-center gap-0.5 h-3 w-4 mx-auto pb-0.5 select-none">
                        <span className="w-0.5 bg-emerald-400 animate-sound-bar-1 origin-bottom rounded-full" />
                        <span className="w-0.5 bg-emerald-400 animate-sound-bar-2 origin-bottom rounded-full" />
                        <span className="w-0.5 bg-emerald-400 animate-sound-bar-3 origin-bottom rounded-full" />
                        <span className="w-0.5 bg-emerald-400 animate-sound-bar-4 origin-bottom rounded-full" />
                      </div>
                    ) : (
                      <span className="group-hover:hidden transition-all">{idx + 1}</span>
                    )}

                    <button
                      id={`row-play-btn-${track.id}`}
                      onClick={() => onTrackSelect(track, playlist.tracks)}
                      className="hidden group-hover:flex items-center justify-center mx-auto text-neutral-200 hover:text-emerald-400 focus:outline-none transition-transform active:scale-90"
                    >
                      {isActive && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-emerald-400 stroke-none" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current stroke-none pl-[1px]" />
                      )}
                    </button>
                  </td>

                  {/* Title & Artist with Album Thumbnail */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden shadow shrink-0 select-none border border-neutral-900 bg-neutral-800">
                        <img
                          id={`track-cover-${track.id}`}
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="truncate max-w-[200px] md:max-w-xs">
                        <p
                          className={`font-semibold text-sm truncate ${
                            isActive ? "text-emerald-400" : "text-white"
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs text-neutral-400 truncate group-hover:text-neutral-300 transition-colors mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Album Name */}
                  <td className="py-3 px-3 truncate max-w-[150px] hidden sm:table-cell text-neutral-400 group-hover:text-neutral-200 transition-colors font-medium">
                    {track.album}
                  </td>

                  {/* Options & Duration */}
                  <td className="py-3 px-3 text-right text-neutral-400 font-semibold w-16 select-none">
                    <span className="group-hover:hidden">{formatDuration(track.duration)}</span>
                    <button
                      id={`track-heart-btn-${track.id}`}
                      className="hidden group-hover:inline-block text-neutral-500 hover:text-emerald-400 outline-none pr-1 transition-transform active:scale-90"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {playlist.tracks.length === 0 && (
          <div className="text-center py-16 text-neutral-600 bg-neutral-950/20 border-2 border-dashed border-neutral-800 rounded-xl mt-6">
            <ListMusic id="icon-no-tracks" className="w-12 h-12 mx-auto text-neutral-700 mb-3" />
            <p className="text-sm font-semibold text-neutral-400">Empty Playlist</p>
            <p className="text-xs text-neutral-600 mt-1 max-w-xs mx-auto">
              This playlist has no songs yet. Use the Spotify importer at the top or custom generator keywords to inject music!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
