
import { GeneratedModel } from "../..";
import { writeFileSync, readFileSync } from "fs";
import getCodeBuilder from "../codebuilder";
import { generateCode as generateInterfaceCode, modelTypeToTSType } from '../generate-typescript'
import { join } from "path";

export default function writeClientApi(models: GeneratedModel<any>[], path: string) {
    const interfacePath = join(path, 'model-interfaces.ts')
    writeFileSync(interfacePath, generateInterfaceCode(models))

    const apiPath = join(path, 'index.ts')
    writeFileSync(apiPath, generateApiCode(models).get())

    const templatePath = join(path, 'generated-api-lib.ts')
    const template = readFileSync(join(__dirname, '../../../src/integration/ts-client-api/ts-api-template.ts'))
    writeFileSync(templatePath, template)

    writeFileSync(
        join(path, 'generated-ws-api-lib.ts'),
        readFileSync(join(__dirname, '../../../src/integration/ts-client-api/ts-ws-api-template.ts'))
    )

    const modelJsonPath = join(path, 'models.json')
    const modelJson = generateModel(models)
    writeFileSync(modelJsonPath, modelJson)

    writeFileSync(join(path, 'interfaces.ts'), readFileSync(join(__dirname, '../../../src/interfaces.ts')))
    writeFileSync(join(path, 'query.ts'), readFileSync(join(__dirname, '../../../src/query.ts')))
    writeFileSync(join(path, 'query-interfaces.ts'), generateQueryBuilderInterfaces(models))
}

export function generateApiCode(models: GeneratedModel<any>[]) {
    const defs = models.map(model => model.definition)
    const code = getCodeBuilder()

    code.addln('import {').indent()
    for (let def of defs) {
        code.addln(`${def.name},`)
    }
    code.unindent().addln(`} from './model-interfaces'`)

    code.addln('import {').indent()
    for (let def of defs) {
        code.addln(`${def.name}QueryBuilder,`)
    }
    code.unindent().addln(`} from './query-interfaces'`)

    code.addln(`import generateApi, { ApiOptions } from './generated-api-lib'`).addln()

    code.addln('export default (options?: ApiOptions) => {').indent()
    code.addln('return {').indent()
    for (let def of defs) {
        code.addln(`${def.name}: generateApi<${def.name}, ${def.name}QueryBuilder<${def.name}>>('${def.name}', options),`)
    }
    code.unindent().addln('}')
    code.unindent().addln('}')

    code.addln()
    code.addln(`import generateSocketApi, { WSApiOptions } from './generated-ws-api-lib'`).addln()

    code.addln('export const socketApi = (options?: WSApiOptions) => {').indent()
    code.addln('return {').indent()
    for (let def of defs) {
        code.addln(`${def.name}: generateSocketApi<${def.name}, ${def.name}QueryBuilder<${def.name}>>('${def.name}', options),`)
    }
    code.unindent().addln('}')
    code.unindent().addln('}')

    return code
}

export function generateModel(models: GeneratedModel<any>[]) {
    const defs = models.map(model => model.definition)

    return JSON.stringify(defs, null, 2)
}

export function generateQueryBuilderInterfaces(models: GeneratedModel<any>[]) {
    const defs = models.map(model => model.definition)
    const code = getCodeBuilder()

    code.addln(`import { Filter, OrderBy } from './query'`)

    for (let def of defs) {
        const ifName = `${def.name}QueryBuilder<T>`
        code.addln(`export interface ${ifName} {`).indent()
        code.addln(`filter: {`).indent()
        for (let column of def.columns) {
            if (column.type === 'reference') {
                code.addln(`${column.name}_id?: Filter<number, ${ifName}>`)
            } else {
                code.addln(`${column.name}?: Filter<${modelTypeToTSType(column.type)}, ${ifName}>`)
            }
        }
        code.unindent().addln(`}`)

        code.addln(`orderby: {`).indent()
        for (let column of def.columns) {
            if (column.type === 'reference') {
                code.addln(`${column.name}_id?: OrderBy<${ifName}>`)
            } else {
                code.addln(`${column.name}?: OrderBy<${ifName}>`)
            }
        }

        code.unindent().addln('}')

        code.addln(`relations: () => ${ifName}`)
        code.addln(`toString: () => string`)
        code.addln(`get: () => Promise<T[]>`)

        code.unindent().addln('}')
    }


    return code.get()
}