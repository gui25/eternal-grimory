/**
 * Configuração centralizada do CMS
 */
import { CMSConfig, ContentType, ContentSchema, FieldType } from './types'

// Schema para NPCs
const npcSchema: ContentSchema = {
  id: 'npc',
  name: 'NPC',
  description: 'Personagens não-jogadores',
  category: 'character',
  fields: [
    {
      id: 'name',
      name: 'Nome',
      type: 'text',
      required: true,
      validation: [
        { type: 'required', message: 'Nome é obrigatório' },
        { type: 'min', value: 2, message: 'Nome deve ter ao menos 2 caracteres' }
      ]
    },
    {
      id: 'type',
      name: 'Tipo',
      type: 'select',
      required: true,
      default: 'NPC',
      options: {
        options: [
          { value: 'NPC', label: 'NPC Comum' },
          { value: 'Comerciante', label: 'Comerciante' },
          { value: 'Nobre', label: 'Nobre' },
          { value: 'Guarda', label: 'Guarda' },
          { value: 'Sábio', label: 'Sábio' },
          { value: 'Vilão', label: 'Vilão' }
        ]
      }
    },
    {
      id: 'affiliation',
      name: 'Afiliação',
      type: 'text',
      options: {
        placeholder: 'Ex: Guilda dos Mercadores, Reino de Aethermoor'
      }
    },
    {
      id: 'description',
      name: 'Descrição',
      type: 'textarea',
      options: {
        placeholder: 'Breve descrição do NPC...'
      }
    },
    {
      id: 'image',
      name: 'Imagem',
      type: 'image'
    },
    {
      id: 'tags',
      name: 'Tags',
      type: 'multiselect',
      options: {
        options: [
          { value: 'aliado', label: 'Aliado' },
          { value: 'neutro', label: 'Neutro' },
          { value: 'inimigo', label: 'Inimigo' },
          { value: 'comerciante', label: 'Comerciante' },
          { value: 'informante', label: 'Informante' },
          { value: 'quest-giver', label: 'Quest Giver' }
        ]
      }
    },
    {
      id: 'content',
      name: 'Conteúdo',
      type: 'markdown',
      required: true,
      options: {
        placeholder: 'Descrição detalhada em Markdown...'
      }
    }
  ]
}

// Schema para Monstros
const monsterSchema: ContentSchema = {
  id: 'monster',
  name: 'Monstro',
  description: 'Criaturas e monstros',
  category: 'character',
  fields: [
    {
      id: 'name',
      name: 'Nome',
      type: 'text',
      required: true
    },
    {
      id: 'type',
      name: 'Tipo',
      type: 'select',
      required: true,
      default: 'Monstro',
      options: {
        options: [
          { value: 'Monstro', label: 'Monstro' },
          { value: 'Dragão', label: 'Dragão' },
          { value: 'Morto-vivo', label: 'Morto-vivo' },
          { value: 'Demônio', label: 'Demônio' },
          { value: 'Elemental', label: 'Elemental' },
          { value: 'Besta', label: 'Besta' }
        ]
      }
    },
    {
      id: 'challenge',
      name: 'Nível de Desafio',
      type: 'select',
      required: true,
      default: '1',
      options: {
        options: Array.from({ length: 30 }, (_, i) => ({
          value: (i + 1).toString(),
          label: `CR ${i + 1}`
        }))
      }
    },
    {
      id: 'description',
      name: 'Descrição',
      type: 'textarea'
    },
    {
      id: 'image',
      name: 'Imagem',
      type: 'image'
    },
    {
      id: 'tags',
      name: 'Tags',
      type: 'multiselect'
    },
    {
      id: 'content',
      name: 'Conteúdo',
      type: 'markdown',
      required: true
    }
  ]
}

// Schema para Itens
const itemSchema: ContentSchema = {
  id: 'item',
  name: 'Item',
  description: 'Itens, equipamentos e artefatos',
  category: 'item',
  fields: [
    {
      id: 'name',
      name: 'Nome',
      type: 'text',
      required: true
    },
    {
      id: 'type',
      name: 'Tipo',
      type: 'select',
      required: true,
      default: 'Item',
      options: {
        options: [
          { value: 'Arma', label: 'Arma' },
          { value: 'Armadura', label: 'Armadura' },
          { value: 'Acessório', label: 'Acessório' },
          { value: 'Consumível', label: 'Consumível' },
          { value: 'Ferramenta', label: 'Ferramenta' },
          { value: 'Tesouro', label: 'Tesouro' },
          { value: 'Artefato', label: 'Artefato' }
        ]
      }
    },
    {
      id: 'rarity',
      name: 'Raridade',
      type: 'select',
      required: true,
      default: 'Comum',
      options: {
        options: [
          { value: 'Comum', label: 'Comum' },
          { value: 'Incomum', label: 'Incomum' },
          { value: 'Raro', label: 'Raro' },
          { value: 'Épico', label: 'Épico' },
          { value: 'Lendário', label: 'Lendário' }
        ]
      }
    },
    {
      id: 'description',
      name: 'Descrição',
      type: 'textarea'
    },
    {
      id: 'image',
      name: 'Imagem',
      type: 'image'
    },
    {
      id: 'tags',
      name: 'Tags',
      type: 'multiselect'
    },
    {
      id: 'content',
      name: 'Conteúdo',
      type: 'markdown',
      required: true
    }
  ]
}

// Schema para Sessões
const sessionSchema: ContentSchema = {
  id: 'session',
  name: 'Sessão',
  description: 'Sessões de jogo',
  category: 'session',
  fields: [
    {
      id: 'title',
      name: 'Título',
      type: 'text',
      required: true
    },
    {
      id: 'date',
      name: 'Data',
      type: 'date',
      required: true,
      default: new Date().toISOString().split('T')[0]
    },
    {
      id: 'session_number',
      name: 'Número da Sessão',
      type: 'number',
      required: true,
      default: 1,
      options: {
        min: 1
      }
    },
    {
      id: 'players',
      name: 'Jogadores',
      type: 'multiselect',
      options: {
        relation: {
          contentType: 'player',
          displayField: 'name',
          multiple: true
        }
      }
    },
    {
      id: 'image',
      name: 'Imagem',
      type: 'image'
    },
    {
      id: 'tags',
      name: 'Tags',
      type: 'multiselect'
    },
    {
      id: 'content',
      name: 'Conteúdo',
      type: 'markdown',
      required: true
    }
  ]
}

// Schema para Anotações
const noteSchema: ContentSchema = {
  id: 'note',
  name: 'Anotação',
  description: 'Anotações gerais',
  category: 'note',
  fields: [
    {
      id: 'name',
      name: 'Nome',
      type: 'text',
      required: true
    },
    {
      id: 'date',
      name: 'Data',
      type: 'date',
      default: new Date().toISOString().split('T')[0]
    },
    {
      id: 'description',
      name: 'Descrição',
      type: 'textarea'
    },
    {
      id: 'image',
      name: 'Imagem',
      type: 'image'
    },
    {
      id: 'tags',
      name: 'Tags',
      type: 'multiselect'
    },
    {
      id: 'content',
      name: 'Conteúdo',
      type: 'markdown',
      required: true
    }
  ]
}

// Tipos de conteúdo disponíveis
export const CONTENT_TYPES: ContentType[] = [
  {
    id: 'npc',
    name: 'NPC',
    pluralName: 'NPCs',
    description: 'Personagens não-jogadores',
    category: 'character',
    schema: npcSchema,
    apiPath: '/api/content/npcs',
    routePath: '/characters/npcs',
    icon: 'User'
  },
  {
    id: 'monster',
    name: 'Monstro',
    pluralName: 'Monstros',
    description: 'Criaturas e monstros',
    category: 'character',
    schema: monsterSchema,
    apiPath: '/api/content/monsters',
    routePath: '/characters/monsters',
    icon: 'Skull'
  },
  {
    id: 'player',
    name: 'Jogador',
    pluralName: 'Jogadores',
    description: 'Personagens jogadores',
    category: 'character',
    schema: monsterSchema, // Reutiliza por simplicidade, poderia ter seu próprio schema
    apiPath: '/api/content/players',
    routePath: '/characters/players',
    icon: 'Users'
  },
  {
    id: 'item',
    name: 'Item',
    pluralName: 'Itens',
    description: 'Itens, equipamentos e artefatos',
    category: 'item',
    schema: itemSchema,
    apiPath: '/api/content/items',
    routePath: '/items',
    icon: 'Package'
  },
  {
    id: 'session',
    name: 'Sessão',
    pluralName: 'Sessões',
    description: 'Sessões de jogo',
    category: 'session',
    schema: sessionSchema,
    apiPath: '/api/content/sessions',
    routePath: '/sessions',
    icon: 'BookOpen'
  },
  {
    id: 'note',
    name: 'Anotação',
    pluralName: 'Anotações',
    description: 'Anotações gerais',
    category: 'note',
    schema: noteSchema,
    apiPath: '/api/content/notes',
    routePath: '/notes',
    icon: 'FileText'
  }
]

// Configuração principal do CMS
export const CMS_CONFIG: CMSConfig = {
  version: '2.0.0',
  contentTypes: CONTENT_TYPES,
  campaigns: [], // Será populado dinamicamente
  features: {
    imageUpload: true,
    comments: false,
    versioning: true,
    collaboration: false,
    api: {
      rateLimit: 100,
      caching: true,
      cors: true
    }
  },
  theme: {
    primary: '#D4AF37',
    secondary: '#8B4513',
    accent: '#DC143C'
  }
}

// Funções utilitárias
export function getContentType(id: string): ContentType | undefined {
  return CONTENT_TYPES.find(type => type.id === id)
}

export function getContentTypeByPath(path: string): ContentType | undefined {
  return CONTENT_TYPES.find(type => path.startsWith(type.routePath))
}

export function getSchemaField(contentTypeId: string, fieldId: string) {
  const contentType = getContentType(contentTypeId)
  return contentType?.schema.fields.find(field => field.id === fieldId)
}

export function validateContentType(contentTypeId: string): boolean {
  return CONTENT_TYPES.some(type => type.id === contentTypeId)
}
