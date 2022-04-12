import { Table } from "../../interfaces"

export default function generateInsert<T>(def: Table<T>, data: T): string {
    const validColumns = def.columns.map(c => {
        if (c.type === "reference") { return `${c.name}_id`} else { return c.name }
    }).filter(s => { return s !== 'id'})

    const columns = Object.keys(data).filter(v => validColumns.indexOf(v) > -1)
    const valueColums = columns.map(c => `$[${c}]`)

    var sqlText = `INSERT INTO ${def.name}(\n`
    sqlText += '    ' + columns.join(',\n    ') + '\n'
    sqlText += ') VALUES (\n'
    sqlText += '    ' + valueColums.join(',\n    ') + '\n'
    sqlText += ')\n'
    sqlText += 'RETURNING *;\n'

    return sqlText
}