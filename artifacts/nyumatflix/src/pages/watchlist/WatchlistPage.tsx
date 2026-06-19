import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { StaticHero } from "@/components/hero/carousel-static";
import { ContentContainer } from "@/components/layout/content-container";
import { WatchlistClient } from "@/components/watchlist/watchlist-client";
import { useSession } from "@/lib/useSession";
import { apiJson } from "@/lib/api";
import type { MediaItem } from "@/utils/typings";

interface WatchlistItem {
  id: string;
  userId: string;
  contentId: number;
  mediaType: "movie" | "tv";
  status: "watching" | "waiting" | "finished";
  lastWatchedSeason?: number | null;
  lastWatchedEpisode?: number | null;
  lastWatchedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function WatchlistPage() {
  const session = useSession();
  const [, navigate] = useLocation();
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [allItems, setAllItems] = useState<(MediaItem & { watchlistItem: WatchlistItem })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      navigate("/login");
    }
  }, [session.status]);

  useEffect(() => {
    if (session.status !== "authenticated") return;

    apiJson<{ items: WatchlistItem[] }>("/api/watchlist")
      .then(async (data) => {
        const items = data.items || [];
        setWatchlistItems(items);

        const mediaPromises = items.map(async (item) => {
          try {
            const url = item.mediaType === "movie" ? `/api/movies/${item.contentId}` : `/api/tv/${item.contentId}`;
            const mediaData = await apiJson<MediaItem>(url);
            return { ...mediaData, media_type: item.mediaType, watchlistItem: item };
          } catch {
            return null;
          }
        });

        const results = await Promise.all(mediaPromises);
        setAllItems(results.filter(Boolean) as (MediaItem & { watchlistItem: WatchlistItem })[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session.status]);

  if (session.status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <StaticHero imageUrl="/movie-banner.webp" title="" route="" />
      <ContentContainer className="w-full flex flex-col items-center z-10">
        <WatchlistClient allItems={allItems} watchlistItems={watchlistItems} />
      </ContentContainer>
    </div>
  );
}
