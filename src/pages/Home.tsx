import { useRef, useCallback, useState } from "react";
import { useCountries } from "../hooks/useCountries";
import CountryCard from "../components/CountryCard";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import Loader from "../components/Loader";
import Error from "../components/Error";
import type { SearchParams } from "../types";

export default function Home() {
  const { countries, loading, error, hasMore, loadMore, search, reset } =
    useCountries();

  const [useInfiniteScroll, setUseInfiniteScroll] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<SearchParams>({});
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !useInfiniteScroll) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore, useInfiniteScroll]
  );

  const handleSearch = useCallback(
    (searchTerm: string) => {
      setCurrentSearchTerm(searchTerm);

      if (searchTerm.trim()) {
        // Combine search term with current filters
        const searchParams: SearchParams = {
          ...currentFilters,
          name: searchTerm,
          capital: searchTerm,
        };
        search(searchParams);
      } else {
        // If no search term, just apply current filters
        if (Object.keys(currentFilters).length > 0) {
          search(currentFilters);
        } else {
          reset();
        }
      }
    },
    [search, reset, currentFilters]
  );

  const handleRegionFilter = useCallback(
    (region: string) => {
      const newFilters = { ...currentFilters };

      if (region) {
        newFilters.region = region;
      } else {
        delete newFilters.region;
      }

      setCurrentFilters(newFilters);

      // Combine with current search term
      if (currentSearchTerm.trim()) {
        const searchParams: SearchParams = {
          ...newFilters,
          name: currentSearchTerm,
          capital: currentSearchTerm,
        };
        search(searchParams);
      } else if (Object.keys(newFilters).length > 0) {
        search(newFilters);
      } else {
        reset();
      }
    },
    [search, reset, currentFilters, currentSearchTerm]
  );

  const handleTimezoneFilter = useCallback(
    (timezone: string) => {
      console.log("Timezone filter changed:", timezone);
      const newFilters = { ...currentFilters };

      if (timezone.trim()) {
        newFilters.timezone = timezone;
      } else {
        delete newFilters.timezone;
      }

      console.log("New filters:", newFilters);
      setCurrentFilters(newFilters);

      // Combine with current search term
      if (currentSearchTerm.trim()) {
        const searchParams: SearchParams = {
          ...newFilters,
          name: currentSearchTerm,
          capital: currentSearchTerm,
        };
        console.log("Searching with params:", searchParams);
        search(searchParams);
      } else if (Object.keys(newFilters).length > 0) {
        console.log("Searching with filters:", newFilters);
        search(newFilters);
      } else {
        console.log("Resetting to default");
        reset();
      }
    },
    [search, reset, currentFilters, currentSearchTerm]
  );

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  const toggleScrollMode = useCallback(() => {
    setUseInfiniteScroll(!useInfiniteScroll);
  }, [useInfiniteScroll]);

  const clearAllFilters = useCallback(() => {
    setCurrentFilters({});
    setCurrentSearchTerm("");
    reset();
  }, [reset]);

  // Only show error page for actual errors (network issues, etc.)
  // Not for "no results found" scenarios
  if (error && !loading && countries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Error message={error} onRetry={reset} />
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    Object.keys(currentFilters).length > 0 || currentSearchTerm.trim() !== "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Countries of the World
          </h1>
          <p className="text-gray-600">
            Explore countries, their details, and current local times
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <SearchBar onSearch={handleSearch} />
          <FilterBar
            onRegionChange={handleRegionFilter}
            onTimezoneChange={handleTimezoneFilter}
          />

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800">
                  Active Filters:
                </span>
                {currentSearchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{currentSearchTerm}"
                  </span>
                )}
                {currentFilters.region && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Region: {currentFilters.region}
                  </span>
                )}
                {currentFilters.timezone && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Timezone: {currentFilters.timezone}
                  </span>
                )}
              </div>
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Debug Info */}
          {/* {process.env.NODE_ENV === "development" && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Debug Info:
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Total Countries: {countries.length}</div>
                <div>Current Filters: {JSON.stringify(currentFilters)}</div>
                <div>Search Term: "{currentSearchTerm}"</div>
                {countries.length > 0 && (
                  <div>
                    Sample Timezones:{" "}
                    {countries
                      .slice(0, 3)
                      .map((c) => c.timezones?.join(", "))
                      .join(" | ")}
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* Load More Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useInfiniteScroll}
                  onChange={toggleScrollMode}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Infinite Scroll
                </span>
              </label>
            </div>

            {!useInfiniteScroll && hasMore && countries.length > 0 && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Load More Countries"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {countries.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {countries.length}{" "}
              {countries.length === 1 ? "country" : "countries"}
              {hasActiveFilters && (
                <span className="text-blue-600 ml-1">(filtered results)</span>
              )}
            </p>
          </div>
        )}

        {/* Countries Grid */}
        {countries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {countries.map((country, index) => {
              if (index === countries.length - 1 && useInfiniteScroll) {
                return (
                  <div key={country.code} ref={lastElementRef}>
                    <CountryCard country={country} />
                  </div>
                );
              }
              return <CountryCard key={country.code} country={country} />;
            })}
          </div>
        ) : !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="h-16 w-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No countries found
            </h3>
            <p className="text-gray-600">
              {hasActiveFilters
                ? "Try adjusting your search or filter criteria"
                : "No countries available"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : null}

        {/* Loading State */}
        {loading && <Loader />}

        {/* End of Results */}
        {!hasMore && countries.length > 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              You've reached the end of the results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
