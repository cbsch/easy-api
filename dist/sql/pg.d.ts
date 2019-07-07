import { Table, SelectArgs, Column } from "../interfaces";
export declare function generateCreateColumn(def: Column): string;
export declare function generateCreateTable<T>(def: Table<T>): string;
export declare function generateInsert<T>(def: Table<T>, data: T): string;
export declare function generateUpdate<T>(def: Table<T>, data: T): string;
export declare function generateSelect<T>(def: Table<T>, args?: SelectArgs): string;
export declare function mapRelations(result: any[]): void;
