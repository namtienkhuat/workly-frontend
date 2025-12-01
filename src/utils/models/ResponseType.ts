export interface Response {
	code: string;
}

export interface PagingResponse<T> extends Response {
	totalResult: number;
	recordsFiltered: number;
	totalPage: number;
	pagination: any;
	page: number;
	data: T[];
	statistic?: T;
}
export interface ResponseData<T> extends Response {
	data: T;
	results?: T;
}

export interface ResponseList<T> extends Response {
	results?: T[];
	data: T[];
}
