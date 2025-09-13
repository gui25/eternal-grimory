/**
 * Tipos centralizados para o sistema CMS
 */

export type ContentTypeName = 'item' | 'session' | 'note' | 'npc' | 'monster' | 'player'

export interface ContentType {
  id: ContentTypeName
  name: string
  pluralName?: string
  description?: string
  category?: string
  schema: ContentSchema
  apiPath: string
  routePath: string
  icon?: string
  color?: string
  features?: {
    comments?: boolean
    versioning?: boolean
    publishing?: boolean
    templates?: boolean
  }
}

export type FieldType = 
  | 'text'
  | 'textarea' 
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'image'
  | 'file'
  | 'rich-text'
  | 'json'
  | 'slug'
  | 'tags'
  | 'relation'

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message?: string
  validator?: (value: any, data: any) => boolean | Promise<boolean>
}

export interface ContentField {
  name: string
  label: string
  type: FieldType
  description?: string
  required?: boolean
  defaultValue?: any
  placeholder?: string
  validation?: ValidationRule[]
  options?: Array<{ value: string; label: string }>
  multiple?: boolean
  accept?: string
  maxSize?: number
  relation?: {
    type: ContentTypeName
    displayField: string
    searchField?: string
  }
  conditional?: {
    field: string
    value: any
    operator?: 'equals' | 'not_equals' | 'contains' | 'not_contains'
  }
}

export interface ContentSchema {
  name: string
  label: string
  description?: string
  fields: ContentField[]
  slugField?: string
  titleField?: string
  dateField?: string
  statusField?: string
  imageField?: string
  contentField?: string
  tagsField?: string
  categoryField?: string
  permissions?: {
    create?: string[]
    read?: string[]
    update?: string[]
    delete?: string[]
  }
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  data?: any
}

export interface ContentItem {
  id?: string
  slug: string
  name: string
  type?: string
  status?: 'draft' | 'published' | 'archived'
  created?: string
  updated?: string
  author?: string
  campaignId?: string
  metadata?: Record<string, any>
  content?: string
  frontMatter?: Record<string, any>
  [key: string]: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
    timestamp?: string
    [key: string]: any
  }
}

export interface CmsError extends Error {
  code: string
  statusCode?: number
  details?: any
}

export interface CmsHook {
  name: string
  type: 'beforeSave' | 'afterSave' | 'beforeDelete' | 'afterDelete'
  handler: (data: any, context?: any) => Promise<any> | any
  priority?: number
  conditions?: Array<{
    field: string
    operator: 'equals' | 'not_equals' | 'contains' | 'exists'
    value: any
  }>
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  tags: string[]
}

export interface CacheConfig {
  defaultTtl: number
  maxSize: number
  cleanupInterval: number
}

export interface ContentQuery {
  type: ContentTypeName
  filters?: Record<string, any>
  search?: string
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
  pagination?: {
    page: number
    limit: number
  }
  include?: string[]
  exclude?: string[]
  campaignId?: string
}

export interface ContentManagerConfig {
  contentRoot: string
  cache: CacheConfig
  validation: {
    enabled: boolean
    strict: boolean
  }
  hooks: {
    enabled: boolean
    timeout: number
  }
  fileSystem: {
    encoding: 'utf8'
    extensions: string[]
  }
}

export interface CmsContext {
  campaignId?: string
  userId?: string
  permissions?: string[]
  timestamp?: number
  ip?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export interface FileSystemItem {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified?: Date
  created?: Date
  extension?: string
  content?: string
  frontMatter?: Record<string, any>
}

export interface CMSOperation {
  type: 'create' | 'read' | 'update' | 'delete' | 'list'
  contentType: ContentTypeName
  data?: any
  query?: ContentQuery
  context?: CmsContext
  timestamp: number
  id: string
}

export interface CMSEvent {
  type: string
  data: any
  timestamp: number
  context?: CmsContext
}

// Tipos para configuração de conteúdo
export interface ContentTypeConfig {
  id: ContentTypeName
  name: string
  label: string
  description?: string
  schema: ContentSchema
  routePath: string
  apiPath: string
  fileExtension: string
  directory: string
  icon?: string
  color?: string
  features?: {
    comments?: boolean
    versioning?: boolean
    publishing?: boolean
    templates?: boolean
  }
}

// Tipos para sistema de campanhas
export interface Campaign {
  id: string
  name: string
  description?: string
  path: string
  active: boolean
  created?: string
  updated?: string
  metadata?: Record<string, any>
}

// Tipos para operações de arquivo
export interface FileOperation {
  type: 'read' | 'write' | 'delete' | 'move' | 'copy'
  source: string
  destination?: string
  content?: string
  encoding?: BufferEncoding
}

export interface CMSConfig {
  version: string
  contentTypes: ContentType[]
  campaigns: Campaign[]
  features: {
    imageUpload: boolean
    fileUpload: boolean
    richTextEditor: boolean
    versioning: boolean
    comments: boolean
    workflows: boolean
    multiLanguage: boolean
    search: boolean
    analytics: boolean
  }
  storage: {
    driver: 'filesystem' | 's3' | 'cloudinary'
    config: Record<string, any>
  }
  cache: CacheConfig
  validation: {
    enabled: boolean
    strict: boolean
    rules: Record<string, ValidationRule[]>
  }
  hooks: {
    enabled: boolean
    timeout: number
    retries: number
  }
  api: {
    prefix: string
    version: string
    cors: boolean
    rateLimit: {
      enabled: boolean
      requests: number
      windowMs: number
    }
  }
  security: {
    encryption: boolean
    sanitization: boolean
    xss: boolean
    csrf: boolean
  }
}

// Re-export tipos comuns
export type { ContentTypeName as CmsContentType }
export type { ContentItem as CmsContentItem }
export type { ContentSchema as CmsContentSchema }
export type { ValidationResult as CmsValidationResult }
