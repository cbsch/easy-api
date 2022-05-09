import { Table, GeneratedModel } from "..";
import { CodeBuilder } from "./codebuilder";
export default function generateCode(models: GeneratedModel<any>[], path: string, namespace: string): void;
export declare function generateModelClass(table: Table<any>): CodeBuilder;
