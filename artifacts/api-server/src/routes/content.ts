import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

const TMDB_BASE = "https://api.themoviedb.org/3";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY not set");
  return key;
}

interface FilterConfig {
  endpoint: string;
  params: Record<string, string>;
}

async function fetchCategory(category: string, type: "movie" | "tv", page: number) {
  const apiKey = getApiKey();
  const config = getCategoryConfig(category, type);
  const url = new URL(`${TMDB_BASE}${config.endpoint}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", page.toString());
  url.searchParams.set("include_adult", "false");
  for (const [k, v] of Object.entries(config.params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data = await res.json();
  return data.results || [];
}

function getCategoryConfig(category: string, type: "movie" | "tv"): FilterConfig {
  const mediaEndpoint = `/discover/${type}`;
  const configs: Record<string, FilterConfig> = {
    "popular-movies": { endpoint: "/discover/movie", params: { sort_by: "popularity.desc", "vote_count.gte": "500" } },
    "top-rated-movies": { endpoint: "/discover/movie", params: { sort_by: "vote_average.desc", "vote_count.gte": "3000" } },
    "popular-tvshows": { endpoint: "/discover/tv", params: { sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "top-rated-tvshows": { endpoint: "/discover/tv", params: { sort_by: "vote_average.desc", "vote_count.gte": "1000" } },
    "horror-movies": { endpoint: "/discover/movie", params: { with_genres: "27", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "comedy-movies": { endpoint: "/discover/movie", params: { with_genres: "35", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "action-movies": { endpoint: "/discover/movie", params: { with_genres: "28", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "thriller-movies": { endpoint: "/discover/movie", params: { with_genres: "53", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "scifi-fantasy-movies": { endpoint: "/discover/movie", params: { with_genres: "878|14", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "drama-movies": { endpoint: "/discover/movie", params: { with_genres: "18", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "romance-movies": { endpoint: "/discover/movie", params: { with_genres: "10749", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "romcom-movies": { endpoint: "/discover/movie", params: { with_genres: "10749|35", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "crime-movies": { endpoint: "/discover/movie", params: { with_genres: "80", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "mystery-movies": { endpoint: "/discover/movie", params: { with_genres: "9648", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "animation-movies": { endpoint: "/discover/movie", params: { with_genres: "16", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "documentary-movies": { endpoint: "/discover/movie", params: { with_genres: "99", sort_by: "popularity.desc", "vote_count.gte": "100" } },
    "nolan-films": { endpoint: "/discover/movie", params: { with_crew: "525", sort_by: "popularity.desc" } },
    "spielberg-films": { endpoint: "/discover/movie", params: { with_crew: "488", sort_by: "popularity.desc" } },
    "scorsese-films": { endpoint: "/discover/movie", params: { with_crew: "1032", sort_by: "popularity.desc" } },
    "fincher-films": { endpoint: "/discover/movie", params: { with_crew: "7467", sort_by: "popularity.desc" } },
    "villeneuve-films": { endpoint: "/discover/movie", params: { with_crew: "137427", sort_by: "popularity.desc" } },
    "marvel-mcu": { endpoint: "/discover/movie", params: { with_companies: "420", sort_by: "release_date.desc" } },
    "a24-films": { endpoint: "/discover/movie", params: { with_companies: "41077", sort_by: "popularity.desc" } },
    "warner-bros": { endpoint: "/discover/movie", params: { with_companies: "174", sort_by: "popularity.desc", "vote_count.gte": "500" } },
    "universal-films": { endpoint: "/discover/movie", params: { with_companies: "33", sort_by: "popularity.desc", "vote_count.gte": "500" } },
    "binge-worthy-series": { endpoint: "/discover/tv", params: { sort_by: "popularity.desc", "vote_average.gte": "7.5", "vote_count.gte": "500" } },
    "limited-series": { endpoint: "/discover/tv", params: { with_type: "4", sort_by: "popularity.desc", "vote_count.gte": "100" } },
    "docuseries": { endpoint: "/discover/tv", params: { with_genres: "99", sort_by: "popularity.desc" } },
    "reality-tv": { endpoint: "/discover/tv", params: { with_genres: "10764", sort_by: "popularity.desc" } },
    "hidden-gems": { endpoint: "/discover/movie", params: { "vote_average.gte": "7.5", "vote_count.gte": "100", "vote_count.lte": "1000", sort_by: "vote_average.desc" } },
    "critically-acclaimed": { endpoint: "/discover/movie", params: { sort_by: "vote_average.desc", "vote_count.gte": "5000", "vote_average.gte": "8.0" } },
    "blockbuster-hits": { endpoint: "/discover/movie", params: { sort_by: "revenue.desc", "vote_count.gte": "1000" } },
    "early-2000s-movies": { endpoint: "/discover/movie", params: { "release_date.gte": "2000-01-01", "release_date.lte": "2009-12-31", sort_by: "popularity.desc", "vote_count.gte": "500" } },
    "eighties-movies": { endpoint: "/discover/movie", params: { "release_date.gte": "1980-01-01", "release_date.lte": "1989-12-31", sort_by: "popularity.desc", "vote_count.gte": "200" } },
    "nineties-movies": { endpoint: "/discover/movie", params: { "release_date.gte": "1990-01-01", "release_date.lte": "1999-12-31", sort_by: "popularity.desc", "vote_count.gte": "200" } },
  };

  if (configs[category]) return configs[category];

  if (category.startsWith("genre-")) {
    const genreId = category.replace("genre-", "");
    return { endpoint: mediaEndpoint, params: { with_genres: genreId, sort_by: "popularity.desc", "vote_count.gte": "100" } };
  }

  if (category.startsWith("director-")) {
    const directorId = category.replace("director-", "");
    return { endpoint: "/discover/movie", params: { with_crew: directorId, sort_by: "popularity.desc" } };
  }

  if (category.startsWith("studio-")) {
    const studioId = category.replace("studio-", "");
    return { endpoint: mediaEndpoint, params: { with_companies: studioId, sort_by: "popularity.desc" } };
  }

  if (category.startsWith("year-")) {
    const year = category.replace("year-", "");
    return { endpoint: mediaEndpoint, params: { "release_date.gte": `${year}-01-01`, "release_date.lte": `${year}-12-31`, sort_by: "popularity.desc" } };
  }

  if (category.startsWith("tv-")) {
    return { endpoint: "/discover/tv", params: { sort_by: "popularity.desc", "vote_count.gte": "100" } };
  }

  return { endpoint: mediaEndpoint, params: { sort_by: "popularity.desc", "vote_count.gte": "100" } };
}

router.get("/content", async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string) || "";
    const type = ((req.query.type as string) || "movie") as "movie" | "tv";
    const page = parseInt((req.query.page as string) || "1", 10);

    if (type !== "movie" && type !== "tv") {
      return res.status(400).json({ error: "Invalid type" });
    }

    const results = await fetchCategory(category, type, page);
    const filtered = results.filter((item: { poster_path?: string | null }) => item.poster_path);

    return res.json({ results: filtered, page, category, type });
  } catch (e) {
    console.error("Content route error:", e);
    return res.status(500).json({ error: "Failed to fetch content" });
  }
});

router.get("/content-rows", async (req: Request, res: Response) => {
  try {
    const rowId = req.query.id as string;
    const count = parseInt((req.query.count as string) || "20", 10);

    if (!rowId) return res.status(400).json({ error: "Row ID required" });

    const rowTypeMap: Record<string, "movie" | "tv"> = {
      "popular-movies": "movie", "top-rated-movies": "movie", "horror-movies": "movie",
      "comedy-movies": "movie", "action-movies": "movie", "thriller-movies": "movie",
      "scifi-fantasy-movies": "movie", "drama-movies": "movie", "romance-movies": "movie",
      "romcom-movies": "movie", "crime-movies": "movie", "mystery-movies": "movie",
      "animation-movies": "movie", "documentary-movies": "movie", "nolan-films": "movie",
      "spielberg-films": "movie", "scorsese-films": "movie", "fincher-films": "movie",
      "villeneuve-films": "movie", "marvel-mcu": "movie", "a24-films": "movie",
      "warner-bros": "movie", "universal-films": "movie", "hidden-gems": "movie",
      "critically-acclaimed": "movie", "blockbuster-hits": "movie",
      "early-2000s-movies": "movie", "eighties-movies": "movie", "nineties-movies": "movie",
      "popular-tvshows": "tv", "top-rated-tvshows": "tv", "binge-worthy-series": "tv",
      "limited-series": "tv", "docuseries": "tv", "reality-tv": "tv",
    };

    const type = rowTypeMap[rowId] || (rowId.includes("tv") || rowId.includes("show") || rowId.includes("series") ? "tv" : "movie");

    const results = await fetchCategory(rowId, type, 1);
    const filtered = results.filter((item: { poster_path?: string | null }) => item.poster_path).slice(0, count);

    return res.json(filtered);
  } catch (e) {
    console.error("Content rows error:", e);
    return res.status(500).json({ error: "Failed to fetch content rows" });
  }
});

export default router;
