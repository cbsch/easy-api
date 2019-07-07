
import { GeneratedModel } from "../..";
import { writeFileSync, readFileSync } from "fs";
import getCodeBuilder from "../codebuilder";
import { generateCode as generateInterfaceCode } from '../generate-typescript'
import { join } from "path";

export default function writeCodeFile(models: GeneratedModel<any>[], path: string) {
    const interfacePath = join(path, 'interfaces.ts')
    writeFileSync(interfacePath, generateInterfaceCode(models))

    const apiPath = join(path, 'index.ts')
    writeFileSync(apiPath, generateApiCode(models).get())

    const templatePath = join(path, 'generated-api-lib.ts')
    const template = readFileSync(join(__dirname, 'ts-api-template.ts'))
    writeFileSync(templatePath, template)

    const modelJsonPath = join(path, 'models.json')
    const modelJson = generateModel(models)
    writeFileSync(modelJsonPath, modelJson)
}

export function generateApiCode(models: GeneratedModel<any>[]) {
    const defs = models.map(model => model.definition)
    const code = getCodeBuilder()

    code.addln('import {').indent()
    for (let def of defs) {
        code.addln(`${def.name},`)
    }
    code.unindent().addln(`} from './interfaces'`)
    code.addln(`import generateApi, { ApiOptions } from './generated-api-lib'`).addln()

    code.addln('export default (options?: ApiOptions) => {').indent()
    code.addln('return {').indent()
    for (let def of defs) {
        code.addln(`${def.name}: generateApi<${def.name}>('${def.name}', options),`)
    }
    code.unindent().addln('}')
    code.unindent().addln('}')

    return code
}

export function generateModel(models: GeneratedModel<any>[]) {
    const defs = models.map(model => model.definition)

    return JSON.stringify(defs, null, 2)
}