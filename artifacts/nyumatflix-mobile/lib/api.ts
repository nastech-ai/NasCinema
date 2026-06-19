const getBase = () => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
};

export async function apiJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getBase()}${path}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function apiJsonAuth<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getBase()}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  number_of_seasons?: number;
  status?: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
}

export interface SearchResult {
  media: MediaItem[];
  people: Array<{
    id: number;
    name: string;
    profile_path?: string | null;
    popularity?: number;
  }>;
  page: number;
  totalPages: number;
  totalResults: number;
}

export const TMDB_IMG = (path: string | null | undefined, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export const MEDIA_TITLE = (item: MediaItem) => item.title || item.name || "Unknown";

export async function fetchContent(category: string, type: "movie" | "tv", page = 1): Promise<MediaItem[]> {
  const data = await apiJson<{ results: MediaItem[] }>(
    `/api/content?category=${category}&type=${type}&page=${page}`
  );
  return (data.results || []).map((item) => ({ ...item, media_type: type }));
}

export async function fetchContentRow(rowId: string, count = 20, enrich = false): Promise<MediaItem[]> {
  const params = new URLSearchParams({ id: rowId, count: String(count), enrich: String(enrich) });
  return apiJson<MediaItem[]>(`/api/content-rows?${params}`);
}

export async function fetchMovieDetail(id: number | string): Promise<MediaItem> {
  const data = await apiJson<MediaItem>(`/api/movies/${id}`);
  return { ...data, media_type: "movie" };
}

export async function fetchTvDetail(id: number | string): Promise<MediaItem> {
  const data = await apiJson<MediaItem>(`/api/tv/${id}`);
  return { ...data, media_type: "tv" };
}

export async function fetchSearch(query: string, page = 1): Promise<SearchResult> {
  if (!query.trim()) return { media: [], people: [], page: 1, totalPages: 1, totalResults: 0 };
  return apiJson<SearchResult>(`/api/search?query=${encodeURIComponent(query)}&page=${page}`);
}

export interface WatchlistItem {
  id: string;
  userId: string;
  contentId: number;
  mediaType: "movie" | "tv";
  status: "watching" | "waiting" | "finished";
  createdAt: string;
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const data = await apiJson<{ items: WatchlistItem[] }>("/api/watchlist");
  return data.items || [];
}

export async function addToWatchlist(contentId: number, mediaType: "movie" | "tv"): Promise<void> {
  await apiJson("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentId, mediaType }),
  });
}

export async function removeFromWatchlist(contentId: number, mediaType: "movie" | "tv"): Promise<void> {
  await apiJson(`/api/watchlist/${contentId}?mediaType=${mediaType}`, { method: "DELETE" });
}
