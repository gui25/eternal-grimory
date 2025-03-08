import { useState } from "react";
import useSWR from "swr";

interface FilterState {
  search: string;
  filters: Record<string, string>;
}

export function useFilteredData<T>(
  apiEndpoint: string,
  filterFunction: (item: T, state: FilterState) => boolean
) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data, error, isLoading, mutate } = useSWR<T[]>(apiEndpoint, async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    return response.json();
  }, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000, // 1 minute
  });

  const filteredData = data 
    ? data.filter((item: T) => filterFunction(item, { search, filters }))
    : [];

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({});
  };

  return {
    data: data || [],
    filteredData,
    error,
    isLoading,
    search,
    setSearch,
    filters,
    setFilter,
    clearFilters,
    mutate,
  };
}
