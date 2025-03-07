import { useState, useEffect } from "react";

interface FilterState {
  search: string;
  filters: Record<string, string>;
}

export function useFilteredData<T>(
  apiEndpoint: string,
  filterFunction: (item: T, state: FilterState) => boolean
) {
  const [data, setData] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error(`Erro ao buscar dados de ${apiEndpoint}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    fetchData();
  }, [apiEndpoint]);

  const filteredData = data.filter((item) =>
    filterFunction(item, { search, filters })
  );

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({});
  };

  return {
    data,
    filteredData,
    error,
    search,
    setSearch,
    filters,
    setFilter,
    clearFilters,
  };
}
