import { Table, GeneratedModel } from "..";
import { writeFileSync } from "fs";
import getCodeBuilder, { CodeBuilder } from "./codebuilder";


export default function generateCode(models: GeneratedModel<any>[], path: string) {
    const code = getCodeBuilder()

    models.forEach(model => {
        code.addcontainer(generateEndpointClass(model.definition))
    })

    models.forEach(model => {
        code.addcontainer(generateModelClass(model.definition))
    })

    code.addln('class Api {').indent()
    models.map(model => {
        const name = model.definition.name
        code.addln(`[${name}_endpoint]$${name} = (New-Object ${name}_endpoint)`)
    })
    code.unindent().addln('}').addln('')

    code.addln('Function Get-TenantPortalApiEndpoint {').indent()
    code.addln('return [Api]::new()')
    code.unindent().addln('}')

    writeFileSync(path, code.get())
}

export function generateEndpointClass(table: Table<any>): CodeBuilder {
    const code = getCodeBuilder()
    const name = table.name
    code.addln(`class ${table.name}_endpoint {`).indent()

    code.addln(`[${name}]getById([int]$Id) {`).indent()
    code.addln(`return Invoke-Request -Path "/api/${name}?filters=id=$Id"`)
    code.unindent().addln('}')

    code.addln(`[${name}[]]get() {`).indent()
    code.addln(`return $this.get("")`)
    code.unindent().addln('}')

    code.addln(`[${name}[]]get([string]$Query) {`).indent()
    code.addln(`return Invoke-Request -Path "/api/${name}$Query"`)
    code.unindent().addln('}')

    code.addln(`[${name}]put([${name}]$${name}) {`).indent()
    code.addln(`return Invoke-Request -Path "/api/${name}" -Method PUT -Body $${name}`)
    code.unindent().addln('}')

    code.addln(`[${name}]post([${name}]$${name}) {`).indent()
    code.addln(`return Invoke-Request -Path "/api/${name}" -Method POST -Body $${name}`)
    code.unindent().addln('}')

    code.unindent().addln(`}`)

    return code
}

export function generateModelClass(table: Table<any>) {

    const code = getCodeBuilder()
    code.addln(`class ${table.name} {`).indent()

    table.columns.forEach(column => {
        switch (column.type) {
            case 'reference': {
                code.addln(`[int]$${column.name}_id`)
                break
            }
            case 'date': {
                code.addln(`[Nullable[DateTime]]$${column.name}`)
                break
            }
            case 'boolean': {
                code.addln(`[bool]$${column.name}`)
                break
            }
            case 'serial': {
                code.addln(`[int]$id`)
                break
            }
            case 'number': {
                code.addln(`[int]$${column.name}`)
                break
            }
            case 'string': {
                code.addln(`[string]$${column.name}`)
                break
            }
            default: {
                code.addln(`[${column.type}]$${column.name}`)
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