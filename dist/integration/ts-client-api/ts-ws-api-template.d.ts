import { QueryBuilder } from "./query";
declare type Method = "GET" | "PUT" | "POST" | "DELETE";
export declare type Request = (item: string, query: string, method: Method, data?: any) => Promise<any>;
export interface WSApiOptions {
    url: string;
    errorHandler?: (error: any) => void;
}
export declare const requestFactory: (options?: WSApiOptions) => Request;
export default function generateApi<T, QB extends QueryBuilder<T>>(modelName: string, options?: WSApiOptions): {
    get: (query?: string) => Promise<T[]>;
    getById: (id: number) => Promise<T>;
    update: (data: T) => Promise<T>;
    insert: (data: T) => Promise<T>;
    remove: (data: T) => Promise<T>;
    query: () => QB;
};
export {};
