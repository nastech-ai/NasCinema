import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

const TMDB_BASE = "https://api.themoviedb.org/3";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY not set");
  return key;
}

async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  const apiKey = getApiKey();
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

router.get("/genres", async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    const apiKey = getApiKey();

    const [movieData, tvData] = await Promise.all([
      fetch(`${TMDB_BASE}/genre/movie/list?api_key=${apiKey}`).then((r) => r.json()),
      fetch(`${TMDB_BASE}/genre/tv/list?api_key=${apiKey}`).then((r) => r.json()),
    ]);

    if (type === "movie") return res.json({ genres: movieData.genres || [] });
    if (type === "tv") return res.json({ genres: tvData.genres || [] });

    const allGenres = [...(movieData.genres || []), ...(tvData.genres || [])];
    const genresMap: Record<number, string> = {};
    allGenres.forEach((g: { id: number; name: string }) => { if (g?.id) genresMap[g.id] = g.name; });
    return res.json(genresMap);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch genres" });
  }
});

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const page = (req.query.page as string) || "1";
    const apiKey = getApiKey();

    if (!query?.trim()) return res.status(400).json({ error: "Query required" });

    const baseUrl = `${TMDB_BASE}/search`;
    const commonParams = new URLSearchParams({ api_key: apiKey, query: query.trim(), page, include_adult: "false", language: "en-US" });

    const [movieRes, tvRes] = await Promise.all([
      fetch(`${baseUrl}/movie?${commonParams}`),
      fetch(`${baseUrl}/tv?${commonParams}`),
    ]);

    const [movieData, tvData] = await Promise.all([movieRes.json(), tvRes.json()]);

    const movies = (movieData.results || []).filter((m: { poster_path?: string | null }) => m.poster_path).map((m: object) => ({ ...m, media_type: "movie" }));
    const tvShows = (tvData.results || []).filter((s: { genre_ids?: number[]; poster_path?: string | null }) => !s.genre_ids?.includes(10767) && s.poster_path).map((s: object) => ({ ...s, media_type: "tv" }));

    const allMedia = [...movies, ...tvShows].sort((a: { popularity?: number }, b: { popularity?: number }) => (b.popularity || 0) - (a.popularity || 0));

    let people: object[] = [];
    if (page === "1") {
      try {
        const peopleRes = await fetch(`${baseUrl}/person?api_key=${apiKey}&query=${encodeURIComponent(query.trim())}&page=1&include_adult=false`);
        if (peopleRes.ok) {
          const pd = await peopleRes.json();
          people = (pd.results || []).map((p: { id: number; name: string; profile_path?: string | null; popularity?: number }) => ({
            id: p.id, name: p.name, profile_path: p.profile_path || null, popularity: p.popularity || 0, media_type: "person",
          })).sort((a: { popularity?: number }, b: { popularity?: number }) => (b.popularity || 0) - (a.popularity || 0));
        }
      } catch {}
    }

    return res.json({
      media: allMedia,
      people,
      page: parseInt(page),
      totalPages: Math.max(movieData.total_pages || 1, tvData.total_pages || 1),
      totalResults: (movieData.total_results || 0) + (tvData.total_results || 0),
    });
  } catch (e) {
    return res.status(500).json({ error: "Search failed" });
  }
});

router.get("/search-preview", async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const apiKey = getApiKey();
    if (!query?.trim() || query.length < 2) return res.json({ results: [] });

    const r = await fetch(`${TMDB_BASE}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query.trim())}&page=1&include_adult=false`);
    if (!r.ok) return res.status(r.status).json({ error: "TMDB error" });
    const data = await r.json();
    const results = (data.results || [])
      .filter((item: { media_type: string; poster_path?: string | null }) => ["movie", "tv"].includes(item.media_type) && item.poster_path)
      .slice(0, 8)
      .map((item: { id: number; title?: string; name?: string; poster_path: string | null; media_type: string; release_date?: string; first_air_date?: string }) => ({
        id: item.id,
        title: item.title,
        name: item.name,
        poster_path: item.poster_path,
        media_type: item.media_type,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
      }));
    return res.json({ results });
  } catch (e) {
    return res.status(500).json({ error: "Search preview failed" });
  }
});

router.get("/movies/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await tmdbFetch(`/movie/${id}`, { append_to_response: "videos,images,credits,recommendations,similar,keywords" });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch movie" });
  }
});

router.get("/movies/:id/recommendations", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = (req.query.page as string) || "1";
    const data = await tmdbFetch(`/movie/${id}/recommendations`, { page });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

router.get("/tv/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await tmdbFetch(`/tv/${id}`, { append_to_response: "videos,images,credits,recommendations,similar,keywords" });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch TV show" });
  }
});

router.get("/tv/:id/recommendations", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = (req.query.page as string) || "1";
    const data = await tmdbFetch(`/tv/${id}/recommendations`, { page });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch TV recommendations" });
  }
});

router.get("/tv/:id/season/:seasonNumber", async (req: Request, res: Response) => {
  try {
    const { id, seasonNumber } = req.params;
    const data = await tmdbFetch(`/tv/${id}/season/${seasonNumber}`);
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch season" });
  }
});

router.get("/person/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await tmdbFetch(`/person/${id}`, { append_to_response: "combined_credits,images" });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch person" });
  }
});

router.get("/person-search", async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const page = (req.query.page as string) || "1";
    const apiKey = getApiKey();
    if (!query?.trim()) return res.status(400).json({ error: "Query required" });
    const r = await fetch(`${TMDB_BASE}/search/person?api_key=${apiKey}&query=${encodeURIComponent(query.trim())}&page=${page}&include_adult=false`);
    if (!r.ok) return res.status(r.status).json({ error: "TMDB error" });
    const data = await r.json();
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: "Person search failed" });
  }
});

router.get("/country/:country", async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    const page = (req.query.page as string) || "1";
    const mediaType = (req.query.type as string) || "movie";
    const sortBy = (req.query.sortBy as string) || "popularity.desc";
    const apiKey = getApiKey();

    const queryParams = new URLSearchParams({
      api_key: apiKey, language: "en-US", include_adult: "false",
      sort_by: sortBy, page, "vote_count.gte": "10",
    });
    if (mediaType === "movie") {
      queryParams.set("region", country);
    } else {
      queryParams.set("with_origin_country", country);
    }

    const r = await fetch(`${TMDB_BASE}/discover/${mediaType}?${queryParams}`);
    if (!r.ok) return res.status(r.status).json({ error: "TMDB error" });
    const data = await r.json();
    const results = (data.results || []).filter((item: { poster_path?: string | null }) => item.poster_path);
    return res.json({ ...data, results });
  } catch (e) {
    return res.status(500).json({ error: "Country browse failed" });
  }
});

router.get("/genre/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mediaType = req.query.type === "tv" ? "tv" : "movie";
    const page = (req.query.page as string) || "1";
    const apiKey = getApiKey();

    const queryParams = new URLSearchParams({
      api_key: apiKey, language: "en-US", include_adult: "false",
      sort_by: "popularity.desc", with_genres: id, page, "vote_count.gte": "10",
    });

    const r = await fetch(`${TMDB_BASE}/discover/${mediaType}?${queryParams}`);
    if (!r.ok) return res.status(r.status).json({ error: "TMDB error" });
    const data = await r.json();
    const results = (data.results || []).filter((item: { poster_path?: string | null }) => item.poster_path);
    return res.json({ ...data, results, type: mediaType, genreId: id });
  } catch (e) {
    return res.status(500).json({ error: "Genre browse failed" });
  }
});

router.get("/map", async (req: Request, res: Response) => {
  try {
    const apiKey = getApiKey();
    const r = await fetch(`${TMDB_BASE}/configuration/countries?api_key=${apiKey}&language=en-US`);
    if (!r.ok) return res.status(r.status).json({ error: "TMDB error" });
    const data = await r.json();
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: "Map data failed" });
  }
});

export default router;
