import { useState, useEffect } from "react";
import { getFilterOptions } from "../api/countries";

interface FilterBarProps {
  onRegionChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
  className?: string;
}

export default function FilterBar({
  onRegionChange,
  onTimezoneChange,
  className = "",
}: FilterBarProps) {
  const [regions, setRegions] = useState<string[]>([]);
  // const [timezones, setTimezones] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true);
      try {
        const response = await getFilterOptions();
        setRegions(response.data.regions || []);
        // setTimezones(response.data.timezones || []);
      } catch (error) {
        console.error("Failed to load filter options:", error);
        // Fallback to static options
        setRegions(["Asia", "Europe", "Africa", "Americas", "Oceania"]);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRegionChange(e.target.value);
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTimezoneChange(e.target.value);
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <div className="flex-1">
        <label
          htmlFor="region-filter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Region
        </label>
        <select
          id="region-filter"
          onChange={handleRegionChange}
          disabled={loading}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Filter by region"
        >
          <option value="">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label
          htmlFor="timezone-filter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Timezone
        </label>
        <input
          id="timezone-filter"
          type="text"
          placeholder="Filter by timezone..."
          onChange={handleTimezoneChange}
          disabled={loading}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Filter by timezone"
        />
      </div>
    </div>
  );
}
