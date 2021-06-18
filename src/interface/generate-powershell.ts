import { Table, GeneratedModel } from "..";
import { writeFileSync } from "fs";
import getCodeBuilder, { CodeBuilder } from "./codebuilder";


export default function generateCode(models: GeneratedModel<any>[], path: string) {
    const code = getCodeBuilder()

    models.forEach(model => {
        code.addcontainer(generateFunction(model.definition))
    })

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

export function generateFunction(table: Table<any>): CodeBuilder {
    const code = getCodeBuilder()
    const name = table.name
    const prettyName = table.prettyName ? table.prettyName : table.name

    code.addln(`Function Get-AP${prettyName} {`).indent()
    code.addln(`[OutputType([${name}])]`)
    code.addln(`Param(`).indent()
    code.addln(`[Parameter()][int]$Id,`)
    code.addln(`[Parameter()][string]$Query`).unindent()
    code.addln(`)`)
    code.addln(`$path = "/api/${name}"`)
    code.addln(`if ($Id) {`).indent()
    code.addln(`$Query = "?filters=id=$Id"`).unindent()
    code.addln(`}`)
    code.addln(`if ($Query) {`).indent()
    code.addln(`$path += $Query`).unindent()
    code.addln(`}`)
    code.addln(`return Invoke-Request -Path $Path`)

    return code
}

export function generateEndpointClass(table: Table<any>): CodeBuilder {
    const code = getCodeBuilder()
    const name = table.name
    code.addln(`class ${table.name}_endpoint {`).indent()

    code.addln(`[PSObject]getById([int]$Id) {`).indent()
    code.addln(`return Invoke-Request -Path "/api/${name}?filters=id=$Id"`)
    code.unindent().addln('}')

    code.addln(`[PSObject[]]get() {`).indent()
    code.addln(`return $this.get("")`)
    code.unindent().addln('}')

    code.addln(`[PSObject[]]get([string]$Query) {`).indent()
    code.addln(`return Invoke-Request -Path "/api/${name}$Query"`)
    code.unindent().addln('}')

    code.addln(`[PSObject]put([${name}]$${name}) {`).indent()
    code.addln(`return Invoke-Request -Path "/api/${name}" -Method PUT -Body $${name}`)
    code.unindent().addln('}')

    code.addln(`[PSObject]post([${name}]$${name}) {`).indent()
    code.addln(`return Invoke-Request -Path "/api/${name}" -Method POST -Body $${name}`)
    code.unindent().addln('}')

    code.addln(`[PSObject]delete([${name}]$${name}) {`).indent()
    code.addln(`return Invoke-Request -Path "/api/${name}" -Method DELETE -Body $${name}`)
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
                code.addln(`[nullable[DateTime]]$${column.name}`)
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
                code.addln(`[nullable[int]]$${column.name}`)
                break
            }
            case 'string': {
                code.addln(`[string]$${column.name}`)
                break
            }
            case 'uuid': {
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