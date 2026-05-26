export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const DEFAULT_PAGE_SIZE = 15;

export interface PaginationParams {
  page?: number;
  page_size?: number;
}
