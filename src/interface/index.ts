export type Languages = "csharp" | "powershell" | "typescript"


import { generatedModel, GeneratedModel } from '../model';
import generate_csharp from './generate-csharp'
import generate_powershell from './generate-powershell'
import generate_typescript from './generate-typescript'

export default function generateCode(language: Languages, path: string) {
    const models = Object.keys(generatedModel).map(key => (generatedModel as {[index: string]: GeneratedModel<any>})[key])
    switch(language) {
        case "csharp": {
            generate_csharp(models, path)
        }
        case "powershell": {
            generate_powershell(models, path)
        }
        case "typescript": {
            generate_typescript(models, path)
        }
    }
}