import type { Metadata } from 'next';

interface MetadataProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  path?: string;
}

/**
 * Creates consistent metadata for all pages
 */
export function createMetadata({
  title,
  description,
  keywords = [],
  image = '/images/og-image.jpg', // Default OG image
  type = 'website',
  path = '',
}: MetadataProps): Metadata {
  const baseKeywords = ['RPG', 'D&D', 'compêndio', 'campanha', 'mestre', 'jogador'];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://grimorio-eterno.com';
  const url = `${baseUrl}${path}`;

  return {
    title,
    description,
    keywords: [...baseKeywords, ...keywords],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Grimório Eterno',
      locale: 'pt_BR',
      type,
      images: [
        {
          url: image.startsWith('http') ? image : `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.startsWith('http') ? image : `${baseUrl}${image}`],
    },
  };
}

/**
 * Creates metadata for item pages
 */
export function createItemMetadata(item: {
  name: string;
  description?: string;
  type: string;
  rarity?: string;
  image?: string;
  slug: string;
}): Metadata {
  const description = item.description || 
    `Detalhes sobre ${item.name}, um item ${item.rarity ? `${item.rarity.toLowerCase()} ` : ''}do tipo ${item.type.toLowerCase()}.`;
  
  return createMetadata({
    title: item.name,
    description,
    keywords: [item.type, item.rarity || '', 'item', 'equipamento'],
    image: item.image,
    type: 'article',
    path: `/items/${item.slug}`,
  });
}

/**
 * Creates metadata for character pages
 */
export function createCharacterMetadata(character: {
  name: string;
  description?: string;
  type: string;
  category: 'npc' | 'player' | 'monster';
  image?: string;
  slug: string;
}): Metadata {
  const categoryMap = {
    npc: 'NPC',
    player: 'Personagem',
    monster: 'Monstro',
  };

  const description = character.description || 
    `Detalhes sobre ${character.name}, um ${categoryMap[character.category]} do tipo ${character.type.toLowerCase()}.`;
  
  return createMetadata({
    title: character.name,
    description,
    keywords: [character.type, character.category, 'personagem', character.category === 'player' ? 'jogador' : ''],
    image: character.image,
    type: 'article',
    path: `/characters/${character.category}s/${character.slug}`,
  });
}

/**
 * Creates metadata for session pages
 */
export function createSessionMetadata(session: {
  session_number: number;
  date?: string;  // Make date optional to match SessionMeta
  description?: string;
  image?: string;
  slug: string;
}): Metadata {
  const description = session.description || 
    `Relatório da Sessão ${session.session_number}${session.date ? ` realizada em ${session.date}` : ''}.`;
  
  return createMetadata({
    title: `Sessão ${session.session_number}`,
    description,
    keywords: ['sessão', 'relatório', 'campanha', 'aventura'],
    image: session.image, // createMetadata will use default if undefined
    type: 'article',
    path: `/sessions/${session.slug}`,
  });
} 