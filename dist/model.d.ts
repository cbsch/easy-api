/// <reference types="node" />
import { IDatabase as Database } from 'pg-promise';
import * as events from 'events';
import { SelectArgs, Table, GeneratedModel } from './interfaces';
declare let generatedModel: {
    [key: string]: any;
};
export { generatedModel };
export declare function getModel<T>(name: string): GeneratedModel<T>;
declare const emitter: events;
export { emitter };
export declare function modelWrapper(db: Database<{}>): <T>(def: Table<T>) => GeneratedModel<T>;
export default function model<T>(db: Database<{}>, def: Table<T>): GeneratedModel<T>;
export declare function queryToObject(string?: string): SelectArgs;
