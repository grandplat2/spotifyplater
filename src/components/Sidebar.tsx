import { useState, FormEvent } from "react";
import {
  Home,
  Music,
  PlusCircle,
  FolderSync,
  Upload,
  Search,
  CheckCircle,
  AlertCircle,
  Library,
  Radio,
} from "lucide-react";
import { Playlist } from "../types";

interface SidebarProps {
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  onLoadSaveCode: (code: string) => Promise<boolean>;
  activeView: "home" | "playlist" | "import";
  onSetView: (view: "home" | "playlist" | "import") => void;
}

export default function Sidebar({
  playlists,
  selectedPlaylist,
  onSelectPlaylist,
  onLoadSaveCode,
  activeView,
  onSetView,
}: SidebarProps) {
  const [saveCodeInput, setSaveCodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ status: "success" | "error"; msg: string } | null>(null);

  const handleLoadCodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = saveCodeInput.trim().toUpperCase();
    if (!cleanCode || cleanCode.length !== 6) {
      setFeedback({ status: "error", msg: "Save code must be exactly 6 characters." });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const success = await onLoadSaveCode(cleanCode);
      if (success) {
        setFeedback({ status: "success", msg: `Loaded playlist ${cleanCode}!` });
        setSaveCodeInput("");
        onSetView("playlist");
      } else {
        setFeedback({ status: "error", msg: "Invalid or expired share code." });
      }
    } catch (err) {
      setFeedback({ status: "error", msg: "Network error loading. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-64 bg-black flex flex-col h-full shrink-0 select-none p-2 space-y-2 border-r border-neutral-900">
      
      {/* Brand & Sidebar Navigation box */}
      <div className="bg-neutral-900/40 rounded-xl p-4 space-y-4 border border-neutral-800/20 shrink-0">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <svg className="w-8 h-8 text-emerald-500 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.375-1.454-5.367-1.78-8.89-1.012-.335.073-.664-.138-.737-.472-.073-.335.138-.664.472-.738 3.856-.88 7.15-.506 9.8 1.117.295.18.387.565.207.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.717-1.67-6.86-2.155-10.065-1.18-.413.125-.847-.11-1.01-.523-.125-.413.11-.847.523-1.01 3.66-1.11 8.225-.565 11.365 1.366.367.227.487.708.26 1.075zm.106-2.833C14.383 8.8 8.441 8.618 5.006 9.66c-.528.16-1.083-.14-1.243-.668-.16-.528.14-1.083.668-1.243 3.96-1.202 10.514-.99 14.59 1.432.476.283.63.9.347 1.376-.283.477-.9.63-1.376.347z" />
          </svg>
          <div>
            <span className="text-sm font-black text-white leading-none tracking-tight">Spotify Play</span>
            <span className="text-[10px] block font-bold text-emerald-500 tracking-wider font-mono">APPLET CLOUD</span>
          </div>
        </div>

        <nav className="space-y-1">
          <button
            id="nav-home-btn"
            onClick={() => onSetView("home")}
            className={`w-full flex items-center gap-4 py-2 px-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeView === "home"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            id="nav-import-btn"
            onClick={() => onSetView("import")}
            className={`w-full flex items-center gap-4 py-2 px-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeView === "import"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <span>Import / Create</span>
          </button>
        </nav>
      </div>

      {/* Save Code Load Tool */}
      <div className="bg-neutral-900/40 rounded-xl p-4 border border-neutral-800/20 shrink-0">
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2 font-semibold">
          Cloud Save Loader
        </span>
        <form onSubmit={handleLoadCodeSubmit} className="space-y-2">
          <div className="relative">
            <input
              id="save-code-sidebar-input"
              type="text"
              placeholder="Enter 6-digit Code"
              maxLength={6}
              value={saveCodeInput}
              onChange={(e) => setSaveCodeInput(e.target.value)}
              disabled={isLoading}
              className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 focus:border-emerald-500 rounded-lg py-2.5 pl-3 pr-10 text-xs font-semibold text-neutral-200 uppercase tracking-wider placeholder-neutral-600 transition-all outline-none"
            />
            <button
              id="save-code-sidebar-load-btn"
              type="submit"
              disabled={isLoading || saveCodeInput.trim().length !== 6}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-2 bg-emerald-500 disabled:bg-neutral-800 hover:bg-emerald-400 disabled:text-neutral-500 text-neutral-950 font-bold text-[10px] rounded transition-colors flex items-center justify-center cursor-pointer"
            >
              {isLoading ? (
                <span className="w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FolderSync className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {feedback && (
            <div
              className={`flex items-start gap-1.5 p-2 rounded text-[10px] leading-relaxed ${
                feedback.status === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/15 text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/15 text-rose-400"
              }`}
            >
              {feedback.status === "success" ? (
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}
        </form>
      </div>

      {/* Playlists Directory List */}
      <div className="bg-neutral-900/40 rounded-xl p-4 flex-1 flex flex-col overflow-hidden border border-neutral-800/20">
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2 shrink-0 flex items-center gap-1.5">
          <Library className="w-3.5 h-3.5 text-neutral-500" /> Playlists Directory
        </span>

        <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
          {playlists.map((pl, idx) => {
            const isSelected = selectedPlaylist?.name === pl.name;

            return (
              <button
                id={`sidebar-playlist-item-${idx}`}
                key={`${pl.name}-${idx}`}
                onClick={() => {
                  onSelectPlaylist(pl);
                  onSetView("playlist");
                }}
                className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-neutral-800 text-emerald-400 font-bold border border-emerald-500/10"
                    : "text-neutral-400 hover:text-neutral-200 font-medium hover:bg-neutral-900/60"
                }`}
              >
                <div className="w-8 h-8 rounded bg-neutral-800 overflow-hidden shrink-0 border border-neutral-900 shadow">
                  {pl.tracks.length > 0 ? (
                    <img
                      id={`sidebar-playlist-cover-${idx}`}
                      src={pl.tracks[0].coverUrl}
                      alt={pl.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-neutral-900">
                      <Music className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs truncate block leading-tight">{pl.name}</span>
                  <span className="text-[10px] text-neutral-500 block leading-tight mt-0.5 font-medium">
                    {pl.tracks.length} track{pl.tracks.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </button>
            );
          })}

          {playlists.length === 0 && (
            <div className="text-center py-8 text-neutral-600">
              <span className="text-xs block">No Playlists loaded</span>
              <span className="text-[10px] mt-1 block">Import an album template to start</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
