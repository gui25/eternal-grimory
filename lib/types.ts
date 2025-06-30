// Tipos para Sessões
export interface Session {
  slug: string;
  session_number: number;
  name: string;
  date: string;
  players: string[];
  image?: string;
  description: string;
  content: string;
}

// Tipos para Anotações
export interface Note {
  slug: string;
  name: string;
  date?: string;
  description: string;
  tags: string[];
  image?: string;
  content: string;
}

// Tipos para Itens
export interface Item {
  slug: string;
  name: string;
  type: "Weapon" | "Armor" | "Potion" | "Artifact" | string;
  rarity: "Common" | "Uncommon" | "Rare" | "Very Rare" | "Legendary" | "Artifact" | string;
  tags: string[];
  description: string;
  content: string;
}

// Tipos para o mapeamento de ícones de itens
export const itemTypeIcons: Record<string, string> = {
  Weapon: "Sword",
  Armor: "Shield",
  Potion: "Flask",
  Artifact: "Sparkles",
};

// Tipos para Personagens
export interface BaseCharacter {
  slug: string;
  name: string;
  image?: string;
  description: string;
  content: string;
  tags: string[];
}

export interface PlayerCharacter extends BaseCharacter {
  player: string;
  class: string;
  race: string;
  level: number;
}

export interface NPC extends BaseCharacter {
  type: string;
  affiliation: string;
}

export interface Monster extends BaseCharacter {
  type: string;
  challenge: string;
}

// Tipo de união para todos os tipos de personagem
export type Character = PlayerCharacter | NPC | Monster;
