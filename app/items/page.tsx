"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Grid3X3, List, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import ItemGrid from "@/components/item-grid"
import ItemList from "@/components/item-list"
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select"

interface Item {
  name: string;
  tags: string[];
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  type: string;
  slug: string;
  image?: string;
  description?: string;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isGridView, setIsGridView] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/items");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesRarity = rarityFilter === "" || item.rarity.toLowerCase() === rarityFilter.toLowerCase();

    const matchesType = typeFilter === "" || item.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesRarity && matchesType;
  });

  const clearFilters = () => {
    setSearch("");
    setRarityFilter("");
    setTypeFilter("");
  };

  const types = Array.from(new Set(items.map((item) => item.type)));
  const predefinedTypes = ["Weapon", "Armor", "Potion", "Artifact"];

  const rarityOptions: FilterOption[] = [
    { value: "Common", label: "Comum" },
    { value: "Uncommon", label: "Incomum" },
    { value: "Rare", label: "Raro" },
    { value: "Epic", label: "Épico" },
    { value: "Legendary", label: "Lendário" },
  ]

  const sortedTypes = types.sort((a, b) => {
    const aIndex = predefinedTypes.indexOf(a);
    const bIndex = predefinedTypes.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  const translateItemType = (type: string) => {
    const translations: Record<string, string> = {
      Weapon: "Arma",
      Armor: "Armadura",
      Potion: "Poção",
      Artifact: "Artefato",
    };
    return translations[type] || type;
  };

  const typeOptions: FilterOption[] = sortedTypes.map((type) => ({
    value: type,
    label: translateItemType(type),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 md:pt-6 pt-16">
        <h1 className="fantasy-heading">Biblioteca de Itens</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={isGridView ? "default" : "outline"}
            size="icon"
            onClick={() => setIsGridView(true)}
            className={isGridView ? "bg-gold-primary text-wine-darker" : ""}
          >
            <Grid3X3 className="h-5 w-5" />
          </Button>
          <Button
            variant={!isGridView ? "default" : "outline"}
            size="icon"
            onClick={() => setIsGridView(false)}
            className={!isGridView ? "bg-gold-primary text-wine-darker" : ""}
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
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
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            placeholder="Todas as Raridades"
            className="min-w-[180px]"
          />

          <FilterSelect
            options={typeOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
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

      {/* Item type quick filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={typeFilter === "" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("")}
          className={typeFilter === "" ? "bg-gold-primary text-wine-darker" : "border-gold-dark"}
        >
          Todos
        </Button>
        {predefinedTypes.map((type) => (
          <Button
            key={type}
            variant={typeFilter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter(type)}
            className={typeFilter === type ? "bg-gold-primary text-wine-darker" : "border-gold-dark"}
          >
            {translateItemType(type)}
          </Button>
        ))}
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
    </div>
  )
}

