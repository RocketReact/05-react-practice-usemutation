import axios from "axios";
import type { Movie } from "../types/movie.ts";

const BASE_URL = "https://api.themoviedb.org/3/search/movie";

interface MovieResponse {
  results: Movie[];
  total_pages: number;
}
export default async function movieService(
  query: string,
  page: number,
): Promise<MovieResponse> {
  const response = await axios.get<MovieResponse>(BASE_URL, {
    params: {
      query: query,
      language: "en-US",
      include_adult: "false",
      page: page,
    },
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    },
  });
  return response.data;
}
