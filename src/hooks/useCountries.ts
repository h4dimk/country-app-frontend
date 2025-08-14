import { useState, useEffect, useCallback, useRef } from "react";
import { getCountries, searchCountries } from "../api/countries";
import type { Country, SearchParams } from "../types";

interface UseCountriesReturn {
  countries: Country[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  search: (params: SearchParams) => void;
  reset: () => void;
}

export const useCountries = (): UseCountriesReturn => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchParams>({});

  // Use ref to track loading state to avoid circular dependencies
  const loadingRef = useRef(false);

  // Client-side filtering function
  const filterCountries = useCallback(
    (countries: Country[], filters: SearchParams): Country[] => {
      return countries.filter((country) => {
        // Filter by name
        if (
          filters.name &&
          !country.name.toLowerCase().includes(filters.name.toLowerCase())
        ) {
          return false;
        }

        // Filter by capital
        if (
          filters.capital &&
          country.capital &&
          !country.capital.toLowerCase().includes(filters.capital.toLowerCase())
        ) {
          return false;
        }

        // Filter by region
        if (filters.region && country.region !== filters.region) {
          return false;
        }

        // Filter by timezone - more flexible matching
        if (
          filters.timezone &&
          country.timezones &&
          country.timezones.length > 0
        ) {
          const filterTimezone = filters.timezone.toLowerCase().trim();
          const hasMatchingTimezone = country.timezones.some((tz) => {
            const countryTz = tz.toLowerCase().trim();
            // Exact match
            if (countryTz === filterTimezone) return true;
            // Partial match (e.g., "UTC+01" matches "UTC+01:00")
            if (
              countryTz.includes(filterTimezone) ||
              filterTimezone.includes(countryTz)
            )
              return true;
            // Handle different formats
            if (
              filterTimezone.startsWith("utc") &&
              countryTz.startsWith("utc")
            ) {
              const filterOffset = filterTimezone
                .replace("utc", "")
                .replace(":", "");
              const countryOffset = countryTz
                .replace("utc", "")
                .replace(":", "");
              return filterOffset === countryOffset;
            }
            return false;
          });
          if (!hasMatchingTimezone) {
            return false;
          }
        }

        return true;
      });
    },
    []
  );

  const loadCountries = useCallback(
    async (pageNum: number, append: boolean = true) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const response = await getCountries(pageNum, 20);
        const newCountries = response.data.countries || response.data;

        // Debug: Log timezone data from first few countries
        if (pageNum === 1) {
          console.log("Sample country timezone data:");
          newCountries.slice(0, 5).forEach((country) => {
            console.log(
              `${country.name}: ${JSON.stringify(country.timezones)}`
            );
          });
        }

        if (append) {
          const updatedCountries = [...countries, ...newCountries];
          setCountries(updatedCountries);
          setAllCountries(updatedCountries);
        } else {
          setCountries(newCountries);
          setAllCountries(newCountries);
        }

        setHasMore(newCountries.length === 20);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load countries"
        );
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [countries]
  ); // Remove loading from dependencies

  const search = useCallback(
    async (params: SearchParams) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError(null);
      setIsSearching(true);
      setCurrentFilters(params);

      try {
        // Try backend search first
        const response = await searchCountries(params);
        const searchResults = response.data.countries || response.data;

        // If we have timezone filter and no results, try client-side filtering
        if (
          params.timezone &&
          searchResults.length === 0 &&
          allCountries.length > 0
        ) {
          console.log(
            "Backend search returned no results for timezone, trying client-side filtering"
          );
          const filteredResults = filterCountries(allCountries, params);
          setCountries(filteredResults);
        } else {
          setCountries(searchResults);
        }

        setHasMore(false); // Search results don't support pagination
      } catch (err) {
        console.log("Backend search failed, trying client-side filtering");
        // If backend search fails, try client-side filtering
        if (allCountries.length > 0) {
          const filteredResults = filterCountries(allCountries, params);
          setCountries(filteredResults);
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to search countries"
          );
        }
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [allCountries, filterCountries]
  ); // Remove loading from dependencies

  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore && !isSearching) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadCountries(nextPage, true);
    }
  }, [hasMore, isSearching, page, loadCountries]);

  const reset = useCallback(() => {
    setCountries(allCountries);
    setCurrentFilters({});
    setPage(1);
    setHasMore(true);
    setIsSearching(false);
    setError(null);
  }, [allCountries]);

  useEffect(() => {
    loadCountries(1, false);
  }, []);

  return {
    countries,
    loading,
    error,
    hasMore,
    loadMore,
    search,
    reset,
  };
};
