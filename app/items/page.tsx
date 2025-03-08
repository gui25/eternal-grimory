"use client"
import { Grid3X3, List } from "lucide-react"
import { useState } from "react"
import ItemGrid from "@/components/item-grid"
import ItemList from "@/components/item-list"
import { type FilterOption } from "@/components/ui/filter-select"
import { useFilteredData } from "@/hooks/useFilteredData"
import { ErrorMessage } from "@/components/ui/error-message"
import { translateItemType, translateRarity } from "@/utils/translations"
import { Item } from "@/types"
import { PREDEFINED_ITEM_TYPES } from "@/constants/items"
import { Button } from "@/components/ui/button"
import { SectionLayout } from "@/components/layouts/section-layout"
import { FilterBar } from "@/components/ui/filter-bar"

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

  // Filter configurations for the FilterBar component
  const filterConfigs = [
    {
      key: "rarity",
      value: filters.rarity || "",
      options: rarityOptions,
      placeholder: "Todas as Raridades"
    },
    {
      key: "type",
      value: filters.type || "",
      options: typeOptions,
      placeholder: "Todos os Tipos"
    }
  ];

  // View toggle button for grid/list view
  const viewToggleButton = (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setIsGridView(!isGridView)}
      title={isGridView ? "Visualizar em lista" : "Visualizar em grade"}
      className="ml-2"
    >
      {isGridView ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
    </Button>
  );

  // Filter bar component
  const filterBar = (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar itens..."
        filters={filterConfigs}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
      />
      <div className="flex justify-end">
        {viewToggleButton}
      </div>
    </div>
  );

  return (
    <SectionLayout
      title="Biblioteca de Itens"
      description="Explore todos os itens mágicos, armas e equipamentos da campanha"
      headerContent={filterBar}
      transitionMode="slide"
    >
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
    </SectionLayout>
  );
}

