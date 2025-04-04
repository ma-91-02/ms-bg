// تصدير النماذج المشتركة
export * from './request';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  count?: number;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: Record<string, 1 | -1>;
} 