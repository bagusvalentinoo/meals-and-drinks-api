export type PaginationRequest = {
  page: number
  size: number
  order_by?: string
  order_dir?: string
  search?: string
}

export type Pagination = {
  total_items: number
  total_pages: number
  current_page: number
  prev_page: number | null
  next_page: number | null
  size: number
}
