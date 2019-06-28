import { Table } from "./model";
export interface QueryBuilder {
    filter: {
        [index: string]: Filter<string | number>;
    };
    orderby: {
        [index: string]: OrderBy;
    };
    relations: () => QueryBuilder;
    get: () => string;
}
export interface Filter<T> {
    eq: (value: T) => QueryBuilder;
    in: (value: T[]) => QueryBuilder;
}
export interface OrderBy {
    asc: () => QueryBuilder;
    desc: () => QueryBuilder;
}
export declare function queryBuilderFactory<T>(table: Table<T>): () => QueryBuilder;
