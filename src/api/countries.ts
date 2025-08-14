import axios from "axios";
import type { AxiosResponse } from "axios";
import type { Country, CountriesResponse, SearchParams } from "../types";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const getCountries = async (
  page: number,
  limit: number
): Promise<AxiosResponse<CountriesResponse>> => {
  try {
    return await api.get("/countries", { params: { page, limit } });
  } catch (error) {
    throw new Error(
      `Failed to fetch countries: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const searchCountries = async (
  params: SearchParams
): Promise<AxiosResponse<CountriesResponse>> => {
  try {
    console.log("Searching countries with params:", params);
    const response = await api.get("/countries/search", { params });
    console.log("Search response:", response.data);
    return response;
  } catch (error) {
    console.error("Search error:", error);
    throw new Error(
      `Failed to search countries: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getCountry = async (
  code: string
): Promise<AxiosResponse<Country>> => {
  try {
    return await api.get(`/countries/${code}`);
  } catch (error) {
    throw new Error(
      `Failed to fetch country: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getFilterOptions = async (): Promise<
  AxiosResponse<{ regions: string[]; timezones: string[] }>
> => {
  try {
    return await api.get("/countries/filters");
  } catch (error) {
    throw new Error(
      `Failed to fetch filter options: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
