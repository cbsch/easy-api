import { Table, GeneratedModel } from "..";
import { writeFileSync } from "fs";
import getCodeBuilder, { CodeBuilder } from "./codebuilder";
import { join } from "path"


export default function generateCode(models: GeneratedModel<any>[], path: string, requestFnName?: string, cmdletPrefix?: string) {
    const code = getCodeBuilder()

    const blobPath = join(path, "generated.ps1")

    requestFnName = requestFnName ? requestFnName : "Invoke-Request"
    cmdletPrefix = cmdletPrefix ? cmdletPrefix : "GEN"

    models.forEach(model => {
        const name = model.definition.name
        const prettyName = model.definition.prettyName
        writeFileSync(
            join(path, `Get-${cmdletPrefix}${prettyName}.ps1`),
            generateGetFunction(name, prettyName, requestFnName, cmdletPrefix).get()
        )
        writeFileSync(
            join(path, `Set-${cmdletPrefix}${prettyName}.ps1`),
            generateSetFunction(name, prettyName, requestFnName, cmdletPrefix).get()
        )
        writeFileSync(
            join(path, `New-${cmdletPrefix}${prettyName}.ps1`),
            generateNewFunction(name, prettyName, requestFnName, cmdletPrefix).get()
        )
        writeFileSync(
            join(path, `Remove-${cmdletPrefix}${prettyName}.ps1`),
            generateRemoveFunction(name, prettyName, requestFnName, cmdletPrefix).get()
        )
    })

    models.forEach(model => {
        code.addcontainer(generateEndpointClass(model.definition, requestFnName))
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

    writeFileSync(blobPath, code.get())
}

function generateGetFunction(
    name: string,
    prettyName: string,
    requestFnName: string,
    cmdletPrefix: string
): CodeBuilder {
    const code = getCodeBuilder()

    code.addln(`Function Get-${cmdletPrefix}${prettyName} {`).indent()
    code.addln(`[OutputType([${name}])]`)
    code.addln(`Param(`).indent()
    code.addln(`[Parameter()][int]$Id,`)
    code.addln(`[Parameter()][string]$Query`).unindent()
    code.addln(`)`)
    code.addln(`$path = "/api/${name}"`)
    code.addln(`if ($Id) { $Query = "?filters=id=$Id" }`)
    code.addln(`if ($Query) { $path += $Query }`)
    code.addln(`return ${requestFnName} -Path $Path`).unindent()
    code.addln(`}`)
    code.addln('')

    return code
}

function generateNewFunction(
    name: string,
    prettyName: string,
    requestFnName: string,
    cmdletPrefix: string
): CodeBuilder {
    const code = getCodeBuilder()

    code.addln(`Function New-${cmdletPrefix}${prettyName} {`).indent()
    code.addln(`[OutputType([${name}])]`)
    code.addln('[CmdletBinding(SupportsShouldProcess)]')
    code.addln(`Param(`).indent()
    code.addln(`[Parameter()][PSObject]$Object`).unindent()
    code.addln(`)`)
    code.addln('if (!$PSCmdlet.ShouldProcess($Object)) { return }')
    code.addln(`return ${requestFnName} -Path "/api/${name}" -Method POST -Body $Object`).unindent()
    code.addln(`}`)
    code.addln('')

    return code
}

function generateSetFunction(
    name: string,
    prettyName: string,
    requestFnName: string,
    cmdletPrefix: string
): CodeBuilder {
    const code = getCodeBuilder()

    code.addln(`Function Set-${cmdletPrefix}${prettyName} {`).indent()
    code.addln(`[OutputType([${name}])]`)
    code.addln('[CmdletBinding(SupportsShouldProcess)]')
    code.addln(`Param(`).indent()
    code.addln(`[Parameter()][PSObject]$Object`).unindent()
    code.addln(`)`)
    code.addln('if (!$PSCmdlet.ShouldProcess($Object)) { return }')
    code.addln(`return ${requestFnName} -Path "/api/${name}" -Method PUT -Body $Object`).unindent()
    code.addln(`}`)
    code.addln('')

    return code
}

function generateRemoveFunction(
    name: string,
    prettyName: string,
    requestFnName: string,
    cmdletPrefix: string
): CodeBuilder {
    const code = getCodeBuilder()

    code.addln(`Function Remove-${cmdletPrefix}${prettyName} {`).indent()
    code.addln(`[OutputType([${name}])]`)
    code.addln('[CmdletBinding(SupportsShouldProcess)]')
    code.addln(`Param(`).indent()
    code.addln(`[Parameter()][PSObject]$Object`).unindent()
    code.addln(`)`)
    code.addln('if (!$PSCmdlet.ShouldProcess($Object)) { return }')
    code.addln(`return ${requestFnName} -Path "/api/${name}" -Method DELETE -Body $Object`).unindent()
    code.addln(`}`)
    code.addln('')

    return code
}

export function generateEndpointClass(table: Table<any>, requestFnName: string): CodeBuilder {
    const code = getCodeBuilder()
    const name = table.name
    code.addln(`class ${table.name}_endpoint {`).indent()

    code.addln(`[PSObject]getById([int]$Id) {`).indent()
    code.addln(`return ${requestFnName} -Path "/api/${name}?filters=id=$Id"`)
    code.unindent().addln('}')

    code.addln(`[PSObject[]]get() {`).indent()
    code.addln(`return $this.get("")`)
    code.unindent().addln('}')

    code.addln(`[PSObject[]]get([string]$Query) {`).indent()
    code.addln(`return ${requestFnName} -Path "/api/${name}$Query"`)
    code.unindent().addln('}')

    code.addln(`[PSObject]put([${name}]$${name}) {`).indent()
    code.addln(`return ${requestFnName} -Path "/api/${name}" -Method PUT -Body $${name}`)
    code.unindent().addln('}')

    code.addln(`[PSObject]post([${name}]$${name}) {`).indent()
    code.addln(`return ${requestFnName} -Path "/api/${name}" -Method POST -Body $${name}`)
    code.unindent().addln('}')

    code.addln(`[PSObject]delete([${name}]$${name}) {`).indent()
    code.addln(`return ${requestFnName} -Path "/api/${name}" -Method DELETE -Body $${name}`)
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