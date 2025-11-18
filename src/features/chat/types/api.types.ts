// API response types

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

