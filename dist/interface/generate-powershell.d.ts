import { Table, GeneratedModel } from "..";
import { CodeBuilder } from "./codebuilder";
export default function generateCode(models: GeneratedModel<any>[], path: string): void;
export declare function generateEndpointClass(table: Table<any>): CodeBuilder;
export declare function generateModelClass(table: Table<any>): CodeBuilder;
