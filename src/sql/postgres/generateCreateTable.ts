import { Table } from "../../interfaces"
import { generateCreateColumn } from "./generateCreateColumn"

export function generateCreateTable<T>(def: Table<T>): string {
    var sqlText = `CREATE TABLE ${def.name} (\n`
    //sqlText += '    id SERIAL PRIMARY KEY,\n'
    const columnStrings = def.columns.map(c => generateCreateColumn(c))
    var columnText = columnStrings.join(',\n')
    columnText += '\n'
    sqlText += columnText
    sqlText += ');\n'
    sqlText += `ALTER SEQUENCE ${def.name}_id_seq RESTART WITH 1000;\n`

    return sqlText
}