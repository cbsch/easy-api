
import { Table, GeneratedModel } from "..";
import { writeFileSync } from "fs";
import getCodeBuilder from "./codebuilder";


export default function writePlantUml(models: GeneratedModel<any>[], path: string) {
    const code = getCodeBuilder()

    code.addln("@startuml database")

    models.forEach(model => {
        code.addcontainer(generateTable(model.definition))
    })

    code.addln("@enduml")

    writeFileSync(path, code.get())
}

function generateTable(table: Table<any>) {
    const code = getCodeBuilder()

    code.addln(`class ${table.name} {`).indent()

    code.addln(`.. primary key ..`)
    table.columns.filter(column => column.pk).forEach(column => {
        code.addln(`+${column.name}: ${column.type}`)
    })

    code.addln(`.. fields ..`)
    table.columns.filter(column => !column.pk && !column.reference).forEach(column => {
        code.addln(`+${column.name}: ${column.type}`)
    })

    code.addln(`.. foreign keys ..`)
    table.columns.filter(column => column.reference).forEach(column => {
        code.addln(`+${column.name}: ${column.reference}`)
    })

    code.unindent().addln("}")

    table.columns.filter(column => column.reference).forEach(column => {
        code.addln(`${table.name}::${column.name} --> ${column.reference}::id`)
    })

    return code

}