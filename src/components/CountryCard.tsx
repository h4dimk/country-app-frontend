import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Country } from "../types";

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
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface CountryCardProps {
  country: Country;
}

export default function CountryCard({ country }: CountryCardProps) {
  const [localTime, setLocalTime] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const tz = country.timezones?.[0];
    if (!tz) {
      setLocalTime("N/A");
      return;
    }
    const update = () => setLocalTime(timeForOffset(tz) || "N/A");
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [country.timezones]);

  const handleClick = () => {
    navigate(`/country/${country.code}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="bg-white shadow-lg p-4 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${country.name}`}
    >
      <div className="relative">
        <img
          src={country.flag}
          alt={`Flag of ${country.name}`}
          className="w-full h-32 object-cover rounded-md"
          loading="lazy"
        />
        {localTime && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {localTime}
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3
          className="font-bold text-lg text-gray-900 truncate"
          title={country.name}
        >
          {country.name}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-medium">Region:</span> {country.region}
        </p>
        {country.capital && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Capital:</span> {country.capital}
          </p>
        )}
        <p className="text-sm text-gray-600">
          <span className="font-medium">Population:</span>{" "}
          {country.population.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
