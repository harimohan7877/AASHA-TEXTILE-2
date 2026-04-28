import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Video {
  id: string;
  title: string;
  thumb: string;
  url: string;
}

const CHANNEL_HANDLE = "aasarextile";
const CHANNEL_URL = `https://youtube.com/@${CHANNEL_HANDLE}`;

// Manual override from direct-updates.js
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

const INITIAL_VIDEOS = 4;

export const YouTubeSection = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      // 1) Cloud DB first
      const { data } = await supabase
        .from("videos")
        .select("*")
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setVideos(
          data.map((v) => ({
            id: v.video_id,
            title: v.title,
            thumb: v.thumbnail_url || `https://i.ytimg.com/vi/${v.video_id}/hqdefault.jpg`,
            url: `https://www.youtube.com/watch?v=${v.video_id}`,
          }))
        );
        return;
      }
      // 2) Fallback to direct-updates
      const direct = getDirectVideos();
      if (direct.length) setVideos(direct);
    })();
  }, []);

  const shown = showAll ? videos : videos.slice(0, INITIAL_VIDEOS);
  const remaining = Math.max(0, videos.length - INITIAL_VIDEOS);

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
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {shown.map((v) => (
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

            {remaining > 0 && !showAll && (
              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="font-deva inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-6 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5 md:text-sm"
                >
                  और {remaining} videos देखें
                </button>
              </div>
            )}
            {showAll && videos.length > INITIAL_VIDEOS && (
              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => setShowAll(false)}
                  className="font-deva text-xs font-semibold text-muted-foreground hover:text-primary"
                >
                  ↑ कम दिखाएँ
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
