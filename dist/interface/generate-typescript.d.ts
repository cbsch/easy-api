import { Table, GeneratedModel } from "..";
import { Types } from "../interfaces";
export default function writeCodeFile(models: GeneratedModel<any>[], path: string): void;
export declare function generateCode(models: GeneratedModel<any>[]): string;
export declare function generateInterfaceText(table: Table<any>): import("./codebuilder").CodeBuilder;
export declare function modelTypeToTSType(type: Types): string;
