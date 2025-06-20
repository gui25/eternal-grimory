// Tipo base para todos os itens visualizados
export interface BaseViewedItem {
  slug: string;
}

// Tipo para monstros
export interface MonsterMeta extends BaseViewedItem {
  category: "monster";
  name: string;
  type: string;
  challenge: string;
  tags: string[];
  image?: string;
  description?: string;
}

// Tipo para NPCs
export interface NpcMeta extends BaseViewedItem {
  category: "npc";
  name: string;
  type: string;
  tags: string[];
  image?: string;
  affiliation?: string;
  description?: string;
}

// Tipo para personagens jogadores
export interface PlayerMeta extends BaseViewedItem {
  category: "player";
  name: string;
  race?: string;
  class?: string;
  tags: string[];
  image?: string;
  player?: string;
  level?: number;
  description?: string;
}

// Tipo para itens
export interface ItemMeta extends BaseViewedItem {
  slug: string;
  name: string;
  type: string;
  rarity?: string;
  tags: string[];
  image?: string;
  description?: string;
}

// Tipo para sessões
export interface SessionMeta extends BaseViewedItem {
  slug: string;
  session_number: number;
  date?: string;
  players?: string[];
  image?: string;
  description?: string;
}

// União de todos os tipos possíveis para ViewedItem
export type ViewedItem = MonsterMeta | NpcMeta | PlayerMeta | ItemMeta | SessionMeta;
