export interface PageResponse<T = any> {
  data: T[],
  totalElements: number
}
