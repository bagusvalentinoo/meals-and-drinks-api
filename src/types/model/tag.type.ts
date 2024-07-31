import type { UserCreatorOrUpdater } from '@type/model/user.type'
import type { Pagination } from '@type/model/page.type'

export type TagResponse = {
  id: string
  name: string
  slug: string
  meals_count: number
  drinks_count: number
  created_at: Date
  updated_at: Date
  creator: UserCreatorOrUpdater
  updater: UserCreatorOrUpdater
}

export type TagIncludeCreatorUpdaterAndCount = {
  id: string
  name: string
  slug: string
  created_at?: Date
  updated_at?: Date
  creator?: UserCreatorOrUpdater
  updater?: UserCreatorOrUpdater
  _count?: {
    meals: number
    drinks: number
  }
}

export type GetTagsResponse = {
  tags: TagResponse[]
  pagination: Pagination
}

export type CreateTagRequest = {
  names: string | string[]
}

export type CreateTagResponse = Omit<
  TagResponse,
  'meals_count' | 'drinks_count' | 'created_at' | 'updated_at'
>

export type UpdateTagRequest = {
  name: string
}

export type UpdateTagResponse = Omit<TagResponse, 'created_at' | 'updated_at'>

export type DeleteBatchTagsRequest = {
  ids: string[]
}
