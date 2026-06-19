import { MovieDb } from "moviedb-promise";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_API_KEY = process.env.TMDB_API_KEY || "";

export const movieDb = new MovieDb(TMDB_API_KEY);

export const LOGGER_TITLE = "Nyumatflix API";

export const requiredEnvVars = [
  "TMDB_API_KEY",
  "DATABASE_URL",
];
