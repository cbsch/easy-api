import { Table, GeneratedModel } from "..";
import { writeFileSync } from "fs";
import getCodeBuilder, { CodeBuilder } from "./codebuilder";


export default function generateCode(models: GeneratedModel<any>[], path: string, namespace: string) {
    const code = getCodeBuilder()

    code.addln('using System;').addln('')

    code.addln(`namespace ${namespace} {`).indent()
    code.addln('public class Api {').indent()
    models.map(model => {
        const name = model.definition.name
        const prettyName = model.definition.prettyName ? model.definition.prettyName : model.definition.name
        code.addln(`public static GeneratedApi<${name}> ${prettyName} = new GeneratedApi<${name}>();`)
    })
    code.unindent().addln('}')

    models.forEach(model => {
        code.addcontainer(generateModelClass(model.definition))
    })

    code.unindent().addln('}')

    writeFileSync(path, code.get())
}

export function generateModelClass(table: Table<any>) {

    const code = getCodeBuilder()
    code.addln(`public class ${table.name} : BaseTable {`).indent()

    table.columns.forEach(column => {
        switch (column.type) {
            case 'reference': {
                code.addln(`public int? ${column.name}_id;`)
                break
            }
            case 'date': {
                code.addln(`public DateTime? ${column.name};`)
                break
            }
            case 'boolean': {
                code.addln(`public bool? ${column.name};`)
                break
            }
            case 'serial': {
                break
            }
            case 'number': {
                code.addln(`public int? ${column.name};`)
                break
            }
            case 'string': {
                code.addln(`public string ${column.name};`)
                break
            }
            case 'uuid': {
                code.addln(`public Guid ${column.name};`)
                break
            }
            default: {
                code.addln(`public ${column.type}? ${column.name};`)
            }
        }
    })

    code.unindent().addln('}')

    return code
}