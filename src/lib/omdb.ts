const OMDB_API_KEY = 'aada7660';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

export interface OMDBMovie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: 'movie' | 'series';
  Plot?: string;
  Director?: string;
  Actors?: string;
  Genre?: string;
  imdbRating?: string;
  Runtime?: string;
  Released?: string;
}

export interface OMDBSearchResponse {
  Search: OMDBMovie[];
  totalResults: string;
  Response: string;
  Error?: string;
}

export interface OMDBDetailResponse extends OMDBMovie {
  Response: string;
  Error?: string;
}

export class OMDBApi {
  private static buildUrl(params: Record<string, string>): string {
    const urlParams = new URLSearchParams({
      apikey: OMDB_API_KEY,
      ...params
    });
    return `${OMDB_BASE_URL}?${urlParams.toString()}`;
  }

  static async searchMovies(
    query: string,
    type?: 'movie' | 'series',
    year?: string,
    page: number = 1
  ): Promise<OMDBSearchResponse> {
    const params: Record<string, string> = {
      s: query,
      page: page.toString()
    };

    if (type) params.type = type;
    if (year) params.y = year;

    const response = await fetch(this.buildUrl(params));
    return response.json();
  }

  static async getMovieDetails(imdbId: string): Promise<OMDBDetailResponse> {
    const params = {
      i: imdbId,
      plot: 'full'
    };

    const response = await fetch(this.buildUrl(params));
    return response.json();
  }

  static async getMovieByTitle(
    title: string,
    year?: string,
    type?: 'movie' | 'series'
  ): Promise<OMDBDetailResponse> {
    const params: Record<string, string> = {
      t: title,
      plot: 'full'
    };

    if (year) params.y = year;
    if (type) params.type = type;

    const response = await fetch(this.buildUrl(params));
    return response.json();
  }
}