import { TOKEN_KEY } from '@/constants';
import axios, {
    AxiosError,
    AxiosProgressEvent,
    InternalAxiosRequestConfig,
    RawAxiosRequestHeaders,
} from 'axios';
import { ResponseData, PagingResponse, ResponseList } from './models/ResponseType';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Credentials': 'true',
        // 'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT',
        // 'Access-Control-Allow-Headers':
        //     'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    },
    timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        console.log(error.response);

        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const message =
                (error.response.data as { message?: string })?.message || 'An error occurred';
            return Promise.reject(new Error(message));
        } else if (error.request) {
            // Request made but no response received
            return Promise.reject(
                new Error('No response from server. Please check your connection.')
            );
        } else {
            // Something else happened
            return Promise.reject(new Error('An unexpected error occurred'));
        }
    }
);
type GetRequestType = {
    url: string;
    params?: any;
    timeout?: number;
};

type RequestBodyType<T> = {
    url: string;
    data?: T;
    timeout?: number;
    headers?: RawAxiosRequestHeaders;
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
};
export async function getData<U>({
    url,
    params,
    timeout,
}: GetRequestType): Promise<ResponseData<U>> {
    return get<ResponseData<U>>({ url, params, timeout });
}

export async function getList<U>({
    url,
    params,
    timeout,
}: GetRequestType): Promise<ResponseList<U>> {
    return get<ResponseList<U>>({ url, params, timeout });
}

export async function getPaging<U>({
    url,
    params,
    timeout,
}: GetRequestType): Promise<PagingResponse<U>> {
    return get<PagingResponse<U>>({ url, params, timeout });
}

export async function postData<D, R>({
    url,
    data,
    timeout,
}: RequestBodyType<D>): Promise<ResponseData<R>> {
    return post<D, ResponseData<R>>({ url, data, timeout });
}

export async function postText<D, R>({
    url,
    data,
    timeout,
}: RequestBodyType<D>): Promise<ResponseData<R>> {
    const reponse = await api.post(url, data, {
        timeout,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
    return reponse.data as ResponseData<R>;
}

function postDownloadFile({ url, data, timeout }: any): Promise<any> {
    return api.post(url, data, { timeout, responseType: 'blob' });
}

export async function postFormList<D, R>({
    url,
    data,
    timeout,
    onUploadProgress,
}: RequestBodyType<D>): Promise<ResponseList<R>> {
    console.log('response', url, data);

    const reponse = await api.postForm(url, data, { timeout, onUploadProgress });
    console.log('response', reponse, url, data);

    return reponse.data as ResponseList<R>;
}

export async function postForm<D, R>({
    url,
    data,
    timeout,
    onUploadProgress,
}: RequestBodyType<D>): Promise<ResponseData<R>> {
    const reponse = await api.postForm(url, data, { timeout, onUploadProgress });
    return reponse.data as ResponseData<R>;
}

export async function putData<D, R>({
    url,
    data,
    timeout,
}: RequestBodyType<D>): Promise<ResponseData<R>> {
    return put<D, ResponseData<R>>({ url, data, timeout });
}

export async function delData<D, R>({ url, data }: RequestBodyType<D>): Promise<ResponseData<R>> {
    return del<D, ResponseData<R>>({ url, data });
}

async function get<R>({ url, params, timeout }: GetRequestType): Promise<R> {
    const reponse = await api.get(url, { params, timeout });
    return reponse.data as R;
}

async function post<D, R>({ url, data, timeout }: RequestBodyType<D>): Promise<R> {
    const reponse = await api.post(url, data, { timeout });
    return reponse.data as R;
}

export async function del<T, R>({ url, data }: RequestBodyType<T>): Promise<R> {
    const reponse = await api.delete(url, { data });
    return reponse.data as R;
}

export async function put<T, R>({ url, data }: RequestBodyType<T>): Promise<R> {
    const reponse = await api.put(url, data);
    return reponse.data as R;
}

export async function doSaveFile({ url, data, timeout }: any): Promise<any> {
    const res = await postDownloadFile({ url, data, timeout });
    const filename = res.headers['content-disposition']
        .split(';')
        .find((n: string) => n.includes('filename='))
        .replace('filename=', '')
        .trim();
    const orgFileName = decodeURIComponent(filename);
    const downloadUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'octet/stream' }));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', orgFileName);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(downloadUrl);
    link.remove();
}

export default api;
