export interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
  capital?: string;
  population: number;
  currencies: string[];
  languages: string[];
  timezones: string[];
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface CountriesResponse {
  countries: Country[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchParams {
  name?: string;
  region?: string;
  timezone?: string;
  capital?: string;
}

export interface FilterOptions {
  regions: string[];
  timezones: string[];
}
