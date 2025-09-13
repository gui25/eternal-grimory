"use client"
import { Grid3X3, List, Plus } from "lucide-react"
import { useState } from "react"
import ItemGrid from "@/components/item-grid"
import ItemList from "@/components/item-list"
import { type FilterOption } from "@/components/ui/filter-select"
import { useFilteredData } from "@/hooks/useFilteredData"
import { ErrorMessage } from "@/components/ui/error-message"
import { translateItemType, translateRarity, areRaritiesEquivalent } from "@/utils/translations"
import { Item } from "@/types"
import { PREDEFINED_ITEM_TYPES } from "@/constants/items"
import { Button } from "@/components/ui/button"
import { SectionLayout } from "@/components/layouts/section-layout"
import { FilterBar } from "@/components/ui/filter-bar"
import { CAMPAIGNS } from "@/lib/campaign-config"
import { AdminSection, AdminButton } from "@/components/ui/admin-button"

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
    isLoading,
    refreshData,
    currentCampaignId,
  } = useFilteredData<Item>(
    "/api/items",
    (item, { search, filters }) => {
      const matchesSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesRarity = !filters.rarity || areRaritiesEquivalent(item.rarity, filters.rarity);
      const matchesType = !filters.type || item.type.toLowerCase() === filters.type.toLowerCase();

      return matchesSearch && matchesRarity && matchesType;
    }
  );

  const types = Array.from(new Set((items || []).map((item) => item.type)));
  
  // Create rarity options from both actual data and predefined values
  const allRarities = Array.from(new Set([
    ...(items || []).map(item => item.rarity),
    "Common", "Uncommon", "Rare", "Epic", "Legendary",
    "Comum", "Incomum", "Raro", "Épico", "Lendário"
  ]));

  const rarityOptions: FilterOption[] = allRarities.map(rarity => ({
    value: rarity,
    label: translateRarity(rarity) || rarity
  }));

  const sortedTypes = types?.length > 0 ? types.sort((a, b) => {
    const aIndex = PREDEFINED_ITEM_TYPES.indexOf(a);
    const bIndex = PREDEFINED_ITEM_TYPES.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  }) : [];

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
    <div className="space-y-4 pb-2">
      <AdminSection>
        <AdminButton href="/admin/create/item">
          <Plus className="h-4 w-4 mr-2" />
          Criar Item
        </AdminButton>
      </AdminSection>
      
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar itens..."
        filters={filterConfigs}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
      />
    </div>
  );

  return (
    <SectionLayout
      title="Biblioteca de Itens"
      description="Explore todos os itens mágicos, armas e equipamentos da campanha"
      headerContent={
        <>
          {filterBar}
        </>
      }
      transitionMode="slide"
    >
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Erro ao carregar os itens. Por favor, tente novamente.</p>
          <Button
            variant="outline"
            onClick={() => refreshData()}
            className="mt-4 border-gold-dark text-gold-light hover:bg-wine-dark hover:text-gold"
          >
            Tentar Novamente
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin-slow text-gold">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span className="ml-3 text-gold-light">Carregando itens...</span>
        </div>
      ) : filteredItems.length > 0 ? (
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

