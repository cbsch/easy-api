
import { Table } from "../../interfaces";
import * as debugFactory from 'debug'
const debug = debugFactory('easy-api:sql:pg')

export default function generateUpdate<T>(def: Table<T>, data: T): string {
    const validColumns = def.columns.map(c => {
        if (c.type === "reference") { return `${c.name}_id`} else { return c.name }
    }).filter(s => { return s !== 'id'})

    const columns = Object.keys(data).filter(v => validColumns.indexOf(v) > -1)
    let setStatements: string[] = []

    debug('putting data:')
    debug(data)

    columns.forEach(c => {
        setStatements.push(`${c} = $[${c}]`)
    })

    let sqlText = `UPDATE ${def.name}\n`
    sqlText += 'SET\n'
    sqlText += '    ' + setStatements.join(',\n    ') + '\n'
    sqlText += 'WHERE id = $[id]\n'
    sqlText += 'RETURNING *;\n'

    debug(sqlText)

    return sqlText
}