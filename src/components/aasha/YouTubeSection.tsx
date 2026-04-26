import { useEffect, useState } from "react";
import { Play } from "lucide-react";

interface Video {
  id: string;
  title: string;
  thumb: string;
  url: string;
}

// Channel handle as set in direct-updates.js
const CHANNEL_HANDLE = "aasarextile";
const CHANNEL_URL = `https://youtube.com/@${CHANNEL_HANDLE}`;

// Lightweight CORS-friendly RSS fetch via rss2json (same approach as original app.js fallback chain)
async function fetchChannelVideos(): Promise<Video[]> {
  try {
    // Try rss2json with @handle channel page
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?user=${CHANNEL_HANDLE}`;
    const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    if (r.ok) {
      const j = await r.json();
      if (j.items?.length) {
        return j.items.slice(0, 6).map((it: { guid?: string; link: string; title: string; thumbnail?: string }) => {
          const idMatch = (it.guid || it.link).match(/[\w-]{11}/);
          const vid = idMatch ? idMatch[0] : "";
          return {
            id: vid,
            title: it.title,
            thumb: it.thumbnail || (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : ""),
            url: it.link,
          };
        });
      }
    }
  } catch {
    // ignore
  }
  return [];
}

// Override videos provided manually in direct-updates.js
function getDirectVideos(): Video[] {
  const list = (typeof window !== "undefined" && window.DIRECT_SITE_UPDATES?.youtube) || [];
  return list.map((url, i) => {
    const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/);
    const vid = m ? m[1] : `v-${i}`;
    return {
      id: vid,
      title: `Aasha Textile — Video ${i + 1}`,
      thumb: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
      url,
    };
  });
}

export const YouTubeSection = () => {
  const [videos, setVideos] = useState<Video[]>(getDirectVideos());

  useEffect(() => {
    if (videos.length) return;
    fetchChannelVideos().then((v) => v.length && setVideos(v));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="youtube" className="border-b border-primary/15 py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
              Latest Videos
            </h2>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              Daily stock & new arrivals on YouTube
            </p>
          </div>
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#FF0000] px-4 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            <Play size={14} fill="currentColor" /> Subscribe
          </a>
        </div>

        {videos.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-primary/15 bg-card p-8 text-center text-sm text-muted-foreground">
            Videos load नहीं हो पाए। सीधे{" "}
            <a className="text-primary underline" href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              channel visit करें
            </a>
            .
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {videos.map((v) => (
              <a
                key={v.id}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-2xl border border-primary/15 bg-card transition-colors hover:border-primary/40"
              >
                <div className="relative aspect-video overflow-hidden bg-background">
                  {v.thumb && (
                    <img
                      src={v.thumb}
                      alt={v.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-[#FF0000] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    <Play size={9} fill="currentColor" /> YT
                  </span>
                  <span className="absolute inset-0 grid place-items-center bg-black/0 transition-colors group-hover:bg-black/30">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[#FF0000]/90 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play size={18} fill="currentColor" className="text-white" />
                    </span>
                  </span>
                </div>
                <p className="p-3 text-xs font-medium leading-snug text-foreground line-clamp-2 md:text-sm">
                  {v.title}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
