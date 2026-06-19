import { SeasonDetails, TvShowDetails } from "@/utils/typings";

/**
 * Fetches details for a TV show by ID
 */
export async function fetchTVShowDetails(id: string): Promise<TvShowDetails> {
  try {
    const response = await fetch(
      `/api/tmdb/tv/${id}language=en-US&append_to_response=videos,images,credits,recommendations,similar,keywords,reviews,content_ratings,aggregate_credits,images`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch TV show details: ${response.status}`);
    }
    const data = await response.json();

    // Enrich TV show data with logos

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch TV show details");
  }
}

/**
 * Fetches details for a specific season of a TV show (server-side)
 */
export async function fetchSeasonDetailsServer(
  tvId: string,
  seasonNumber: number,
): Promise<SeasonDetails | null> {
  try {
    const response = await fetch(
      `/api/tmdb/tv/${tvId}/season/${seasonNumber}language=en-US`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch season details: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Fetches details for a specific season of a TV show (client-side)
 */
export async function fetchSeasonDetails(
  tvId: string,
  seasonNumber: number,
): Promise<SeasonDetails | null> {
  try {
    // Call the API route instead of directly calling TMDB
    const response = await fetch(`/api/tv/${tvId}/season/${seasonNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch season details: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
