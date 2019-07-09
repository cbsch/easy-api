export type Languages = "csharp" | "powershell" | "typescript" | "typescript_api"

import { generatedModel } from '../model'
import { GeneratedModel } from '../';
import generate_csharp from './generate-csharp'
import generate_powershell from './generate-powershell'
import generate_typescript from './generate-typescript'
import writeClientApi from './ts-client-api/generate-ts-client-api';

export default function generateCode(language: Languages, path: string) {
    const models = Object.keys(generatedModel).map(key => (generatedModel as {[index: string]: GeneratedModel<any>})[key])
    switch(language) {
        case "csharp": {
            generate_csharp(models, path)
            break;
        }
        case "powershell": {
            generate_powershell(models, path)
            break;
        }
        case "typescript": {
            generate_typescript(models, path)
            break;
        }
        case "typescript_api": {
            writeClientApi(models, path)
        }
    }
}