export interface PaginatedResponseDto<T> {
    items: T[];
    totalCount: number;
    page:number;
    pageSize:number;
    totalPages:number;
    hasNextPage:boolean;
    hasPreviousPage:boolean;
}