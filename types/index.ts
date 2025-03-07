export interface Item {
  name: string;
  tags: string[];
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  type: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface NPC {
  name: string;
  type: string;
  affiliation: string;
  tags: string[];
  slug: string;
  image?: string;
}

export interface Monster {
  name: string;
  type: string;
  challenge: string;
  tags: string[];
  slug: string;
  image?: string;
}

export interface Player {
  name: string;
  level: number;
  class: string;
  race: string;
  player: string;
  slug: string;
  image?: string;
}

export interface ViewableItem {
  slug: string;
  name: string;
  type: string;
  category: "item" | "npc" | "monster" | "player" | "session";
}
