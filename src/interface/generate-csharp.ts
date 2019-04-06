import { Table, GeneratedModel } from "..";
import { writeFileSync } from "fs";
import getCodeBuilder from "./codebuilder";


export default function generateCode(models: GeneratedModel<any>[], path: string) {
    const code = getCodeBuilder()

    code.addln('using System;').addln('')

    code.addln('namespace TenantPortal {').indent()
    code.addln('public class Api {').indent()
    models.map(model => {
        const name = model.definition.name
        code.addln(`public static GeneratedApi<${name}> ${name} = new GeneratedApi<${name}>();`)
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
            default: {
                code.addln(`public ${column.type}? ${column.name};`)
            }
        }
    })

    /*
    let references = table.columns.filter(c => c.type === 'reference')
    if (references.length > 0) {
        code.addln(`relations?: {`).indent()

        references.forEach(column => {
            code.addln(`${column.name}?: ${column.name}`)
        })

        code.unindent().addln('}')
    }
    */

    code.unindent().addln('}')

    return code
}