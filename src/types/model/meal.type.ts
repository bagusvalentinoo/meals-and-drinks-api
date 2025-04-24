import { Prisma } from '@prisma/client'
import type { Meal, MealTag, MealCategory } from '@prisma/client'
import type { UserCreatorOrUpdater } from '@type/model/user.type'
import type { Pagination, PaginationRequest } from '@type/model/page.type'
import type { FileRequest } from '@type/model/file.type'

export type MealResponse = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  price_usd: string
  stock: number
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN'
  rating: number
  rating_status: 'NOT_RATED' | 'RATED'
  photo_url: string | null
  tags: string[]
  categories: string[]
  creator: UserCreatorOrUpdater
  updater: UserCreatorOrUpdater
  created_at: Date
  updated_at: Date
}

export type MealIncludeCreatorUpdaterTagsAndCategories = Meal & {
  creator: UserCreatorOrUpdater
  updater: UserCreatorOrUpdater
  tags: ({
    tag: {
      id: string
      name: string
      slug: string
    }
  } & MealTag)[]
  categories: ({
    category: {
      id: string
      name: string
      slug: string
      photo_url: string | null
    }
  } & MealCategory)[]
}

export type GetMealsRequest = PaginationRequest & {
  status?: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN'
}

export type GetMealsResponse = {
  meals: MealResponse[]
  pagination: Pagination
}

export type GetMealsPayload = {
  filters?: Prisma.MealWhereInput
  skip?: number
  take?: number
  order_by?: Record<string, 'asc' | 'desc'>
}

export type CreateMealRequest = {
  tag_ids?: string[] | string
  tag_names?: string[] | string
  category_ids?: string[] | string
  name: string
  description: string
  price: number
  stock: number
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN'
}

export type CreateMealResponse = Omit<MealResponse, 'created_at' | 'updated_at'>

export type CreateMealPayload = {
  user_id: string
  tag_ids: string[]
  category_ids: string[]
  name: string
  slug: string
  description: string
  price: number
  stock: number
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN'
} & FileRequest
