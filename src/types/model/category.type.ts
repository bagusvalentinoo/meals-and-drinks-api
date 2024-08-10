import type { UserCreatorOrUpdater } from '@type/model/user.type'
import type { Pagination } from '@type/model/page.type'

export type CategoryResponse = {
  id: string
  name: string
  slug: string
  photo_url: string | null
  meals_count: number
  drinks_count: number
  created_at: Date
  updated_at: Date
  creator: UserCreatorOrUpdater
  updater: UserCreatorOrUpdater
}

export type CategoryIncludeCreatorUpdaterAndCount = {
  id: string
  name: string
  slug: string
  photo_path: string | null
  photo_url: string | null
  created_at?: Date
  updated_at?: Date
  creator?: UserCreatorOrUpdater
  updater?: UserCreatorOrUpdater
  _count?: {
    meals: number
    drinks: number
  }
}

export type GetCategoriesResponse = {
  categories: CategoryResponse[]
  pagination: Pagination
}

export type CreateOrUpdateCategoryRequest = {
  name: string
}

export type CreateCategoryResponse = Omit<
  CategoryResponse,
  'meals_count' | 'drinks_count' | 'created_at' | 'updated_at'
>

export type UpdateCategoryResponse = Omit<
  CategoryResponse,
  'created_at' | 'updated_at'
>

export type DeleteBatchCategoriesRequest = {
  ids: string[]
}
