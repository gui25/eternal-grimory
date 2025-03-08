import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select";

interface FilterConfig {
  key: string;
  value: string;
  options: FilterOption[];
  placeholder: string;
  label?: string;
  className?: string;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  layout?: "horizontal" | "vertical";
  className?: string;
  filterClassName?: string;
  clearButtonLabel?: string;
}

/**
 * A standardized filter bar component for list pages
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters,
  onFilterChange,
  onClearFilters,
  layout = "horizontal",
  className = "",
  filterClassName = "",
  clearButtonLabel = "Limpar Filtros",
}: FilterBarProps) {
  const isVertical = layout === "vertical";

  return (
    <div 
      className={`flex ${isVertical ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 ${className}`}
    >
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-8 w-full"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter selects */}
      <div className={`flex ${isVertical ? 'flex-col' : 'flex-col sm:flex-row'} gap-2 ${filterClassName}`}>
        {filters.map((filter) => (
          <div key={filter.key} className={filter.className}>
            {filter.label && (
              <label className="block text-sm font-medium mb-1">
                {filter.label}
              </label>
            )}
            <FilterSelect
              options={filter.options}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              placeholder={filter.placeholder}
              className={`${!filter.label ? 'mt-0' : ''} ${isVertical ? 'w-full' : 'min-w-[180px]'}`}
            />
          </div>
        ))}

        {/* Clear filters button */}
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="border-gold-dark text-gold-light hover:bg-wine-dark hover:text-gold self-end"
        >
          {clearButtonLabel}
        </Button>
      </div>
    </div>
  );
} 