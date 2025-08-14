import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCountry } from "../api/countries";
import type { Country } from "../types";
import Loader from "../components/Loader";
import Error from "../components/Error";

function parseUtcOffsetMinutes(offset: string): number | null {
  let str = offset.trim().toUpperCase();
  if (str === "UTC" || str === "GMT" || str === "Z") return 0;
  if (str.startsWith("UTC")) str = str.slice(3);
  if (str.startsWith("GMT")) str = str.slice(3);
  if (str === "") return 0;
  const m = str.match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!m) return null;
  const sign = m[1] === "-" ? -1 : 1;
  const hours = parseInt(m[2], 10);
  const minutes = m[3] ? parseInt(m[3], 10) : 0;
  return sign * (hours * 60 + minutes);
}
function timeForOffset(offsetStr: string): string | null {
  const minutesOffset = parseUtcOffsetMinutes(offsetStr);
  if (minutesOffset == null) return null;
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const target = new Date(utcMs + minutesOffset * 60000);
  return target.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CountryDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountry = async () => {
      if (!code) {
        setError("Country code is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getCountry(code);
        setCountry(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load country details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, [code]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Error
            message={error || "Country not found"}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="group inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-all duration-200 hover:scale-105"
          aria-label="Go back"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md group-hover:shadow-lg transition-shadow mr-3">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </div>
          <span className="font-medium">Back to Countries</span>
        </button>

        {/* Single card with flag background */}
        <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Flag Background */}
          <div className="relative h-80">
            <img
              src={country.flag}
              alt={`Flag of ${country.name}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Country Header Info */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">
                {country.name}
              </h1>
              {country.capital && (
                <p className="text-2xl opacity-90 mb-4 drop-shadow-md">
                  {country.capital}
                </p>
              )}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                  {country.region}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                  {country.code}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                  Pop. {country.population.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Information */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <dt className="text-sm font-medium text-blue-600 mb-1">
                    Country Code
                  </dt>
                  <dd className="text-xl font-semibold text-gray-900">
                    {country.code}
                  </dd>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <dt className="text-sm font-medium text-green-600 mb-1">
                    Region
                  </dt>
                  <dd className="text-xl font-semibold text-gray-900">
                    {country.region}
                  </dd>
                </div>
                {country.capital && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <dt className="text-sm font-medium text-purple-600 mb-1">
                      Capital
                    </dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {country.capital}
                    </dd>
                  </div>
                )}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                  <dt className="text-sm font-medium text-orange-600 mb-1">
                    Population
                  </dt>
                  <dd className="text-xl font-semibold text-gray-900">
                    {country.population.toLocaleString()}
                  </dd>
                </div>
              </div>

              {/* Right Column - Additional Details */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
                  <dt className="text-sm font-medium text-amber-600 mb-1">
                    Currencies
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {country.currencies && country.currencies.length > 0
                      ? country.currencies.join(", ")
                      : "Not specified"}
                  </dd>
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                  <dt className="text-sm font-medium text-indigo-600 mb-1">
                    Languages
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {country.languages && country.languages.length > 0
                      ? country.languages.join(", ")
                      : "Not specified"}
                  </dd>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                  <dt className="text-sm font-medium text-teal-600 mb-1">
                    Timezones
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {country.timezones && country.timezones.length > 0
                      ? country.timezones.join(", ")
                      : "Not specified"}
                  </dd>
                </div>
              </div>
            </div>

            {/* Current Time Section */}
            {country.timezones && country.timezones.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Current Local Time
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {country.timezones.map((tz, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {tz}
                      </p>
                      <p className="text-lg font-mono font-bold text-gray-900">
                        {timeForOffset(tz) || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
