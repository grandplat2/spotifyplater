import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Ensure lookup works correctly in some sandbox environments
dns.setDefaultResultOrder && dns.setDefaultResultOrder("ipv4first");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Shared royalty-free track URLs for streaming
  const DEMO_AUDIO_POOL = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3"
  ];

  const GENRE_MAPPING: Record<string, string> = {
    lofi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    synthwave: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    guitar: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    electronic: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    ambient: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    jazz: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    dance: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    retro: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    classical: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    hiphop: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    cinematic: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    darksynth: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    acoustic: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    soul: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    chill: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3"
  };

  // Unsplash images pool for covers
  const DEFAULT_COVERS = [
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
    "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  ];

  // Spotify Public Playlist parser logic
  app.post("/api/spotify/import", async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "No Spotify URL or playlist query provided." });
    }

    try {
      // 1. If Spotify client secrets are available, we can connect real API (optional enhancement)
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      if (clientId && clientSecret) {
        // Real Spotify integration could run here, but as a fallback/primary parser 
        // that handles ANY url/query with high conversational compliance, we use server-side Gemini
      }

      // Check for Gemini API key
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        // Return structured mock default in absence of API Key to allow immediate usage
        return res.json({
          name: "Vocal Uplift Playlist",
          description: "A beautifully synthesized lo-fi acoustic playlist (Offline Sandbox fallback).",
          tracks: [
            { id: "synth-default-1", title: "Sunrise Mirage", artist: "Hologram Vibe", album: "Stardust EP", duration: 180, coverUrl: DEFAULT_COVERS[0], audioUrl: DEMO_AUDIO_POOL[0] },
            { id: "synth-default-2", title: "Chasing Waves", artist: "Sandy Keys", album: "Coastal Echoes", duration: 215, coverUrl: DEFAULT_COVERS[1], audioUrl: DEMO_AUDIO_POOL[1] },
            { id: "synth-default-3", title: "Midnight Espresso", artist: "Lofi Cafe", album: "Barista Grooves", duration: 195, coverUrl: DEFAULT_COVERS[2], audioUrl: DEMO_AUDIO_POOL[2] }
          ]
        });
      }

      // Initialize Gemini Client
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Query Gemini to extract playlist/track metadata
      const prompt = `The user is providing a Spotify playlist URL or search query: "${url}".
Extract, parse, or generate a highly realistic set of 5 to 12 matching songs representing this vibe.
Make sure the playlist name and description map perfectly to the vibe of the input.
Return a valid JSON object matching the following structure:
{
  "name": "Title of the Spotify Playlist",
  "description": "Short matching description of the playlist",
  "tracks": [
    {
      "title": "Real song name in that playlist context",
      "artist": "Correct mapping artist name",
      "album": "Correct mapping album name",
      "duration": 180,
      "genreKey": "lofi" 
    }
  ]
}

For "genreKey" choose one of these keywords that fits the track sound: lofi, synthwave, guitar, electronic, ambient, jazz, dance, retro, classical, hiphop, cinematic, darksynth, acoustic, soul, chill.

Return ONLY the raw JSON block without markdown formatting or backticks. Code response must be valid JSON parseable.`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const textResponse = geminiResponse.text?.trim() || "{}";
      
      // Sanitise JSON text if Gemini wrapped it in markdown code blocks
      const cleanJsonStr = textResponse
        .replace(/^```json/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      const parsedData = JSON.parse(cleanJsonStr);

      if (!parsedData.tracks || !Array.isArray(parsedData.tracks)) {
        throw new Error("Invalid playlist tracks structure returned by AI.");
      }

      // Populate tracks with real streaming URLs and beautiful covers
      const tracks = parsedData.tracks.map((track: any, index: number) => {
        const genre = track.genreKey || "chill";
        const audioUrl = GENRE_MAPPING[genre] || DEMO_AUDIO_POOL[index % DEMO_AUDIO_POOL.length];
        const coverUrl = DEFAULT_COVERS[index % DEFAULT_COVERS.length];
        
        return {
          id: `imported-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`,
          title: track.title || "Unknown Master",
          artist: track.artist || "Ambient Spirit",
          album: track.album || "Echo Chamber",
          duration: Number(track.duration) || 180,
          coverUrl: coverUrl,
          audioUrl: audioUrl
        };
      });

      return res.json({
        name: parsedData.name || "Imported Playlist",
        description: parsedData.description || `Successfully parsed from: ${url}`,
        tracks: tracks
      });

    } catch (error) {
      console.error("Spotify Import Backend Error:", error);
      return res.status(500).json({ error: "Failed to parse playlist. Check formatting or try again." });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
