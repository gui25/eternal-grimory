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
};

export function translateItemType(type: string): string {
  return itemTypes[type] || type;
}

export function translateRarity(rarity: string): string {
  return rarityTranslations[rarity] || rarity;
}
