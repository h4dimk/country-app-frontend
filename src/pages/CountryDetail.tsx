import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCountry } from "../api/countries";
import type { Country } from "../types";
import Loader from "../components/Loader";
import Error from "../components/Error";

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

  const handleBack = () => navigate(-1);

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
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Error
            message={error || "Country not found"}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Countries
        </button>

        {/* Header */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="relative h-60">
            <img
              src={country.flag}
              alt={`Flag of ${country.name}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 bg-black bg-opacity-50 w-full p-4 text-white">
              <h1 className="text-3xl font-bold">{country.name}</h1>
              {country.capital && <p className="text-lg">{country.capital}</p>}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-8">
            {/* Overview */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailCard label="Country Code" value={country.code} />
                <DetailCard label="Region" value={country.region} />
                {country.capital && (
                  <DetailCard label="Capital" value={country.capital} />
                )}
                <DetailCard
                  label="Population"
                  value={country.population.toLocaleString()}
                />

                {/* New Flag Field */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Flag</p>
                  <img
                    src={country.flag}
                    alt={`Flag of ${country.name}`}
                    className="mt-2 w-24 h-auto border border-gray-300 rounded"
                  />
                </div>
              </div>
            </section>

            {/* Additional Info */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Additional Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailCard
                  label="Currencies"
                  value={
                    country.currencies?.length
                      ? country.currencies.join(", ")
                      : "Not specified"
                  }
                />
                <DetailCard
                  label="Languages"
                  value={
                    country.languages?.length
                      ? country.languages.join(", ")
                      : "Not specified"
                  }
                />
              </div>
            </section>

            {/* Timezones */}
            {country.timezones?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Current Local Time
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {country.timezones.map((tz, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <p className="text-sm text-gray-500">{tz}</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {timeForOffset(tz)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Detail Card */
function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
}
