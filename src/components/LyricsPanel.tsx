import { useEffect, useRef } from "react";
import { Music, Volume2, Disc } from "lucide-react";
import { Track } from "../types";
import { TRACK_LYRICS } from "../data";

interface LyricsPanelProps {
  currentTrack: Track | null;
  currentTime: number;
}

export default function LyricsPanel({ currentTrack, currentTime }: LyricsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Parse lyrics from static dictionary or generate procedural ones
  const getLyrics = (): { text: string; timeSec: number }[] => {
    if (!currentTrack) return [];
    
    const lyricsLines = TRACK_LYRICS[currentTrack.title];
    if (lyricsLines) {
      return lyricsLines.map((line) => {
        const match = line.match(/^\[(\d+):(\d+)\]\s*(.*)$/);
        if (match) {
          const min = parseInt(match[1]);
          const sec = parseInt(match[2]);
          const text = match[3];
          return { text, timeSec: min * 60 + sec };
        }
        return { text: line, timeSec: 0 };
      });
    }

    // Procedural generation fallback for other tracks based on the title
    const docTime = currentTrack.duration;
    const interval = Math.floor(docTime / 8);
    const proceduralLines = [
      { text: `🎶 [Intro] - Entering the soundscapes of ${currentTrack.title}... 🎶`, timeSec: 0 },
      { text: `✨ Feeling the vibrations of "${currentTrack.album}" by ${currentTrack.artist} ✨`, timeSec: Math.floor(interval * 1) },
      { text: "🌊 The drums roll, the ocean carries the beat 🌊", timeSec: Math.floor(interval * 2.5) },
      { text: "🌅 Let the melodies float, washing past the gray walls 🌅", timeSec: Math.floor(interval * 4) },
      { text: "💫 Everything feels transient, suspended in the sound 💫", timeSec: Math.floor(interval * 5.5) },
      { text: "🍁 [Chorus] - Echoes of memory coming alive again 🍁", timeSec: Math.floor(interval * 6.8) },
      { text: "🧘‍♀️ Rest in the peace, let the instruments fade... 🧘‍♀️", timeSec: Math.floor(interval * 7.5) },
    ];
    return proceduralLines;
  };

  const lyrics = getLyrics();

  // Find index of standard current lyric line
  const activeLineIndex = lyrics.reduce((acc, current, idx) => {
    if (currentTime >= current.timeSec) {
      return idx;
    }
    return acc;
  }, 0);

  // Auto-scroll active lyric into view
  useEffect(() => {
    if (panelRef.current) {
      const activeEl = panelRef.current.querySelector('[data-lyric-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeLineIndex]);

  if (!currentTrack) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-500 bg-neutral-950/40 rounded-xl border border-neutral-800">
        <Disc id="icon-lyrics-none" className="w-10 h-10 animate-spin-slow mb-3 text-neutral-600" />
        <p className="text-sm font-semibold">No Song Playing</p>
        <p className="text-xs text-neutral-600 mt-1">Play any sound to watch live sync lyrics.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
      <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">Real-Time Lyrics</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
          <Volume2 className="w-3 h-3 animate-pulse" /> Live Sync
        </div>
      </div>

      <div
        ref={panelRef}
        className="flex-1 overflow-y-auto px-6 py-12 scrollbar-thin select-none"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="space-y-6">
          {lyrics.map((line, idx) => {
            const isActive = idx === activeLineIndex;
            const isPassed = idx < activeLineIndex;
            return (
              <div
                id={`lyric-line-${idx}`}
                key={idx}
                data-lyric-active={isActive ? "true" : "false"}
                className={`transition-all duration-300 transform leading-relaxed text-center ${
                  isActive
                    ? "text-emerald-400 font-bold text-lg md:text-xl scale-102 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    : isPassed
                    ? "text-neutral-400 font-medium text-sm md:text-base opacity-70"
                    : "text-neutral-600 font-medium text-sm md:text-base opacity-40 hover:opacity-60"
                }`}
              >
                {line.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
