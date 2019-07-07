import { Table, GeneratedModel } from "..";
export default function writeCodeFile(models: GeneratedModel<any>[], path: string): void;
export declare function generateCode(models: GeneratedModel<any>[]): string;
export declare function generateInterfaceText(table: Table<any>): import("./codebuilder").CodeBuilder;
