import { Table } from "./interfaces";
export interface QueryBuilder<T> {
    filter: {
        [index: string]: Filter<any, QueryBuilder<T>>;
    };
    orderby: {
        [index: string]: OrderBy<QueryBuilder<T>>;
    };
    relations: () => QueryBuilder<T>;
    toString: () => string;
    get: () => Promise<T[]>;
}
export interface Filter<T, R> {
    eq: (value: T) => R;
    in: (value: T[]) => R;
}
export interface OrderBy<R> {
    asc: () => R;
    desc: () => R;
}
export declare function queryBuilderFactory<T, QB extends QueryBuilder<T>>(table: Table<T>, get?: (query: string) => Promise<T[]>): () => QB;
