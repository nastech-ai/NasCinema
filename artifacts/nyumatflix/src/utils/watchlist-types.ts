export interface WatchlistItem {
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

export interface EpisodeInfo {
  hasNewEpisodes: boolean;
  newEpisodeCount: number;
  nextEpisodeDate: Date | null;
  countdown: string | null;
  latestEpisodeAirDate: Date | null;
}

export async function getWatchlistItem(contentId: number, mediaType: "movie" | "tv"): Promise<WatchlistItem | null> {
  try {
    const response = await fetch(`/api/watchlist/check?contentId=${contentId}&mediaType=${mediaType}`);
    if (!response.ok) return null;
    const data = await response.json() as { item?: WatchlistItem };
    return data.item || null;
  } catch {
    return null;
  }
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  try {
    const response = await fetch("/api/watchlist");
    if (!response.ok) return [];
    const data = await response.json() as { items?: WatchlistItem[] };
    return data.items || [];
  } catch {
    return [];
  }
}
