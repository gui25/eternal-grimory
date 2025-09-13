export const itemTypes: Record<string, string> = {
  Weapon: "Arma",
  Armor: "Armadura",
  Potion: "Poção",
  Artifact: "Artefato",
};

export const rarityTranslations: Record<string, string> = {
  Common: "Comum",
  Uncommon: "Incomum", 
  Rare: "Raro",
  Epic: "Épico",
  Legendary: "Lendário",
  // Reverse translations (PT to EN)
  Comum: "Common",
  Incomum: "Uncommon",
  Raro: "Rare", 
  Épico: "Epic",
  Lendário: "Legendary",
};

// Create rarity equivalence groups for better matching
export const rarityEquivalents: Record<string, string[]> = {
  common: ["common", "comum"],
  uncommon: ["uncommon", "incomum"],
  rare: ["rare", "raro"],
  epic: ["epic", "épico"],
  legendary: ["legendary", "lendário"]
};

export function translateItemType(type: string): string {
  return itemTypes[type] || type;
}

export function translateRarity(rarity: string): string {
  return rarityTranslations[rarity] || rarity;
}

// Check if two rarity values are equivalent (handles PT/EN)
export function areRaritiesEquivalent(rarity1: string, rarity2: string): boolean {
  const normalized1 = rarity1.toLowerCase();
  const normalized2 = rarity2.toLowerCase();
  
  if (normalized1 === normalized2) return true;
  
  // Check equivalence groups
  for (const equivalents of Object.values(rarityEquivalents)) {
    if (equivalents.includes(normalized1) && equivalents.includes(normalized2)) {
      return true;
    }
  }
  
  return false;
}
