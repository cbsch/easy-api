import { Method, AxiosResponse } from "axios";
export declare type Request = (url: string, method: Method, data?: any) => Promise<AxiosResponse<any>>;
export interface ApiOptions {
    url?: string;
    headers?: Headers;
    errorHandler?: (error: any) => void;
}
export declare const requestFactory: (options?: ApiOptions) => Request;
export default function generateApi<T>(modelName: string, options?: ApiOptions): {
    get: (query?: string) => Promise<T[]>;
    getById: (id: number) => Promise<T>;
    update: (data: T) => Promise<T>;
    insert: (data: T) => Promise<T>;
    remove: (data: T) => Promise<T>;
};
