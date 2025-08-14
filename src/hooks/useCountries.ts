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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
  // Use ref to track loading state to avoid circular dependencies
  const loadingRef = useRef(false);

  const loadCountries = useCallback(async (pageNum: number, append: boolean = true) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await getCountries(pageNum, 20);
      const newCountries = response.data.countries || response.data;

      if (append) {
        setCountries((prev) => [...prev, ...newCountries]);
      } else {
        setCountries(newCountries);
      }

      setHasMore(newCountries.length === 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load countries");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // Remove loading from dependencies

  const search = useCallback(async (params: SearchParams) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    setIsSearching(true);

    try {
      const response = await searchCountries(params);
      const searchResults = response.data.countries || response.data;
      setCountries(searchResults);
      setHasMore(false); // Search results don't support pagination
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search countries");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // Remove loading from dependencies

  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore && !isSearching) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadCountries(nextPage, true);
    }
  }, [hasMore, isSearching, page, loadCountries]);

  const reset = useCallback(() => {
    setCountries([]);
    setPage(1);
    setHasMore(true);
    setIsSearching(false);
    setError(null);
    loadCountries(1, false);
  }, [loadCountries]);

  useEffect(() => {
    loadCountries(1, false);
  }, [loadCountries]);

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
