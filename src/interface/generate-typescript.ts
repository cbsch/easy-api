import { Table, GeneratedModel } from "..";
import { writeFileSync } from "fs";
import getCodeBuilder from "./codebuilder";

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
        switch (column.type) {
            case 'reference': {
                code.addln(`${column.name}_id?: number`)
                break
            }
            case 'date': {
                code.addln(`${column.name}?: Date`)
                break;
            }
            case 'serial': {
                code.addln(`${column.name}?: number`)
                break;
            }
            case 'float': {
                code.addln(`${column.name}?: number`)
                break;
            }
            default: {
                code.addln(`${column.name}?: ${column.type}`)
            }
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