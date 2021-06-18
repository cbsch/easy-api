export declare type Languages = "csharp" | "powershell" | "typescript" | "typescript_api" | "plantuml";
export default function generateCode(language: Languages, path: string, namespace?: string): void;
export declare function generatePowershell(path: string, requestFnName: string, cmdletPrefix: string): void;
