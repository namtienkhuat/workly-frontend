export interface Response {
	code: string;
}

export interface PagingResponse<T> extends Response {
	totalResult: number;
	recordsFiltered: number;
	totalPage: number;
	page: number;
	results: T[];
	statistic?: T;
	data?: any;
}
export interface ResponseData<T> extends Response {
	result: T;
}

export interface ResponseList<T> extends Response {
	results: T[];
}
