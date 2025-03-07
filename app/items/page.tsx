"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Grid3X3, List } from "lucide-react"
import { useState } from "react"
import ItemGrid from "@/components/item-grid"
import ItemList from "@/components/item-list"
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select"
import { useFilteredData } from "@/hooks/useFilteredData"
import { ErrorMessage } from "@/components/ui/error-message"
import { translateItemType, translateRarity } from "@/utils/translations"
import { Item } from "@/types"
import { PREDEFINED_ITEM_TYPES } from "@/constants/items"
import { PageContainer } from "@/components/ui/page-container"

export default function ItemsPage() {
  const [isGridView, setIsGridView] = useState(true);
  
  const {
    data: items,
    filteredData: filteredItems,
    error,
    search,
    setSearch,
    filters,
    setFilter,
    clearFilters,
  } = useFilteredData<Item>(
    "/api/items",
    (item, { search, filters }) => {
      const matchesSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesRarity = !filters.rarity || item.rarity.toLowerCase() === filters.rarity.toLowerCase();
      const matchesType = !filters.type || item.type.toLowerCase() === filters.type.toLowerCase();

      return matchesSearch && matchesRarity && matchesType;
    }
  );

  const types = Array.from(new Set(items.map((item) => item.type)));
  
  const rarityOptions: FilterOption[] = [
    { value: "Common", label: translateRarity("Common") },
    { value: "Uncommon", label: translateRarity("Uncommon") },
    { value: "Rare", label: translateRarity("Rare") },
    { value: "Epic", label: translateRarity("Epic") },
    { value: "Legendary", label: translateRarity("Legendary") },
  ];

  const sortedTypes = types.sort((a, b) => {
    const aIndex = PREDEFINED_ITEM_TYPES.indexOf(a);
    const bIndex = PREDEFINED_ITEM_TYPES.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  const typeOptions: FilterOption[] = sortedTypes.map((type) => ({
    value: type,
    label: translateItemType(type),
  }));
  
  if (error) return (
    <ErrorMessage 
      message="Não foi possível carregar os itens. Tente novamente mais tarde." 
      onRetry={() => window.location.reload()}
    />
  );

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="fantasy-heading">Biblioteca de Itens</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar itens..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <FilterSelect
            options={rarityOptions}
            value={filters.rarity || ""}
            onChange={(e) => setFilter("rarity", e.target.value)}
            placeholder="Todas as Raridades"
            className="min-w-[180px]"
          />

          <FilterSelect
            options={typeOptions}
            value={filters.type || ""}
            onChange={(e) => setFilter("type", e.target.value)}
            placeholder="Todos os Tipos"
            className="min-w-[180px]"
          />

          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-gold-dark text-gold-light hover:bg-wine-dark hover:text-gold"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        isGridView ? (
          <ItemGrid items={filteredItems} />
        ) : (
          <ItemList items={filteredItems} />
        )
      ) : (
        <div className="text-center py-12">
          <p className="text-gold-light text-lg">Nenhum item corresponde aos seus filtros.</p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="mt-4 border-gold-dark text-gold-light hover:bg-wine-dark hover:text-gold"
          >
            Limpar Filtros
          </Button>
        </div>
      )}
    </PageContainer>
  )
}

