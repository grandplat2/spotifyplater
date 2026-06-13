import React, { useState } from "react";
import { Music, AlertCircle, Sparkles, Import, ChevronRight } from "lucide-react";
import { Playlist } from "../types";

interface SpotifyImportProps {
  onImportSuccess: (importedPlaylist: Playlist) => void;
}

export default function SpotifyImport({ onImportSuccess }: SpotifyImportProps) {
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotifyUrl.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuggestion(null);

    try {
      const response = await fetch("/api/spotify/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: spotifyUrl }),
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.error || "Failed to parse playlist from this URL.");
      }

      const importedData: Playlist = await response.json();
      onImportSuccess(importedData);
      setSpotifyUrl("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong importing the playlist.");
      // Provide an educational hint mapping natural features
      setSuggestion(
        "For quick testing without external config, you can write any keyword (e.g., 'Acoustic Pop' or 'Retro Wave') and our AI engine will synthesize matching tracks!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (keyword: string) => {
    setSpotifyUrl(keyword);
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
          <Import id="icon-import" className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Import Spotify Playlist</h2>
          <p className="text-xs text-neutral-400">
            Paste any playlist link or write ideas to compile song sheets.
          </p>
        </div>
      </div>

      <form onSubmit={handleImport} className="space-y-4">
        <div className="relative">
          <input
            id="spotify-url-input"
            type="text"
            placeholder="Paste Spotify Link (or try: 'Lofi Chill Study')"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            disabled={isLoading}
            className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 focus:border-emerald-500/80 rounded-lg py-3 px-4 text-sm text-neutral-200 placeholder-neutral-500 transition-all outline-none"
          />
          <button
            id="spotify-import-btn"
            type="submit"
            disabled={isLoading || !spotifyUrl.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Import</span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="flex gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs leading-relaxed">
            <AlertCircle id="icon-alert" className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">{errorMessage}</p>
              {suggestion && (
                <p className="text-neutral-300 mt-1 pl-1 border-l-2 border-emerald-500/40">
                  💡 {suggestion}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="pt-2">
          <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Need inspiration? Try entering:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Focus Programming", "Late Night Synthwave", "Chilled Acoustic Coffee", "Hip Hop Classics"].map(
              (term) => (
                <button
                  id={`shortcut-${term.replace(/\s+/g, '-').toLowerCase()}`}
                  key={term}
                  type="button"
                  onClick={() => handleSuggestionClick(term)}
                  className="px-2.5 py-1 text-xs bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition-colors font-medium cursor-pointer"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
