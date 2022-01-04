import { Table, GeneratedModel } from "..";
import { writeFileSync } from "fs";
import getCodeBuilder from "./codebuilder";
import { Types } from "../interfaces";

export default function writeCodeFile(models: GeneratedModel<any>[], path: string) {
    writeFileSync(path, generateCode(models))
}

export function generateCode(models: GeneratedModel<any>[]) {
    const code = getCodeBuilder()

    models.forEach(model => {
        code.addcontainer(generateInterfaceText(model.definition))
    })

    return code.get()
}

export function generateInterfaceText(table: Table<any>) {

    const code = getCodeBuilder()
    code.addln(`export interface ${table.name} {`).indent()

    table.columns.forEach(column => {
        if (column.type === 'reference') {
            code.addln(`${column.name}_id?: number`)
        } else {
            code.addln(`${column.name}?: ${modelTypeToTSType(column.type)}`)
        }
    })

    let references = table.columns.filter(c => c.type === 'reference')
    if (references.length > 0) {
        code.addln(`relations?: {`).indent()

        references.forEach(column => {
            code.addln(`${column.name}?: ${column.reference}`)
        })

        code.unindent().addln('}')
    }

    code.unindent().addln('}')

    return code
}

export function modelTypeToTSType(type: Types): string {
    switch (type) {
        case 'reference': {
            return 'number'
        }
        case 'date': {
            return 'Date'
        }
        case 'serial': {
            return 'number'
        }
        case 'float': {
            return 'number'
        }
        case 'uuid': {
            return 'string'
        }
        default: {
            return type
        }
    }
}