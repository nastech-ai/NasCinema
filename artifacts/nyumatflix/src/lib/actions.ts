import type { MediaItem } from "@/utils/typings";

export interface PaginatedResponse {
  results: MediaItem[];
  total_pages?: number;
  total_results?: number;
}

export async function getMovies(category: string, page: number = 1): Promise<PaginatedResponse> {
  try {
    const response = await fetch(`/api/movies?category=${encodeURIComponent(category)}&page=${page}`);
    if (!response.ok) return { results: [] };
    return response.json() as Promise<PaginatedResponse>;
  } catch {
    return { results: [] };
  }
}

export async function getTVShows(category: string, page: number = 1): Promise<PaginatedResponse> {
  try {
    const response = await fetch(`/api/tv?category=${encodeURIComponent(category)}&page=${page}`);
    if (!response.ok) return { results: [] };
    return response.json() as Promise<PaginatedResponse>;
  } catch {
    return { results: [] };
  }
}

export async function buildItemsWithCategories<T extends MediaItem>(
  items: T[],
  _mediaType: string,
): Promise<T[]> {
  return items;
}

export async function buildMaybeItemsWithCategories<T extends MediaItem>(
  items: T[],
  _mediaType: string,
): Promise<T[]> {
  return items;
}

export async function fetchPaginatedCategory(
  category: string,
  mediaType: string,
  page: number = 1,
): Promise<MediaItem[]> {
  try {
    const endpoint = mediaType === "movie" ? "movies" : "tv";
    const response = await fetch(`/api/${endpoint}?category=${encodeURIComponent(category)}&page=${page}`);
    if (!response.ok) return [];
    const data = await response.json() as PaginatedResponse;
    return data.results || [];
  } catch {
    return [];
  }
}

export async function fetchAndEnrichMediaItems(items: MediaItem[], _mediaType: string): Promise<MediaItem[]> {
  return items;
}
