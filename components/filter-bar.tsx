import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterSelect, FilterOption } from "@/components/ui/filter-select";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: Record<string, FilterConfig>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

interface FilterConfig {
  value: string;
  options: FilterOption[];
  placeholder: string;
}

export function FilterBar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-8"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {Object.entries(filters).map(([key, config]) => (
          <FilterSelect
            key={key}
            options={config.options}
            value={config.value}
            onChange={(e) => onFilterChange(key, e.target.value)}
            placeholder={config.placeholder}
            className="min-w-[180px]"
          />
        ))}

        <Button
          variant="outline"
          onClick={onClearFilters}
          className="border-gold-dark text-gold-light hover:bg-wine-dark hover:text-gold"
        >
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}
