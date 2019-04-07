/// <reference types="node" />
import { IDatabase as Database } from 'pg-promise';
import * as events from 'events';
export declare function useModel(model: {
    [key: string]: any;
}): {
    [key: string]: any;
};
declare const emitter: events.EventEmitter;
export { emitter };
export interface Table<T> {
    name: string;
    columns: Column[];
    autoId?: boolean;
    sqlhooks?: SqlHooks<T>;
}
export interface SqlHooks<T> {
    postBefore?: (data: T) => void;
    postAfter?: (data: T) => void;
}
export declare type Types = "string" | "number" | "date" | "reference" | "serial" | "boolean";
export interface Column {
    name: string;
    type: Types;
    reference?: string;
    unique?: boolean;
    notnull?: boolean;
    cascade?: boolean;
    pk?: boolean;
}
export interface GeneratedModel<T> {
    definition: Table<T>;
    createText: string;
    create: () => void;
    drop: () => void;
    insert: (data: T) => Promise<T>;
    delete: (id: number) => Promise<T>;
    find: (query?: string) => Promise<T[]>;
    update: (data: T) => Promise<T>;
}
export declare function generateCreateColumn(def: Column): string;
export declare function generateCreateTable<T>(def: Table<T>): string;
export declare function generateInsert<T>(def: Table<T>, data: T): string;
export declare function generateUpdate<T>(def: Table<T>, data: T): string;
export interface SelectArgs {
    columns?: string[];
    relations?: boolean;
    filters?: {
        column: string;
        op: string;
        value: string | number | Date;
    }[];
    in?: {
        column: string;
        values: string[] | number[] | Date[];
    };
}
export declare function queryToObject(string?: string): SelectArgs;
export declare function generateSelect<T>(def: Table<T>, args?: SelectArgs): string;
export declare function modelWrapper(db: Database<{}>): <T>(def: Table<T>) => GeneratedModel<T>;
export default function model<T>(db: Database<{}>, def: Table<T>): GeneratedModel<T>;
