import { Table, SelectArgs, Column, GeneratedModel } from "../interfaces";

import { generatedModel } from '../model'
import * as debugFactory from 'debug'
const debug = debugFactory('easy-api:sql:pg')

const joinTableColumnSplit = '___'

export function generateCreateColumn(def: Column) {
    var sqlString = '    '
    if (def.type === "reference") {
        sqlString += `${def.name}_id`
    } else {
        sqlString += def.name
    }
    //var sqlString = `    ${def.name}`
    const type = 
        def.type === "number" ? 'INTEGER' :
        def.type === "string" ? 'TEXT' :
        def.type === "date" ? 'TIMESTAMP WITH TIME ZONE' :
        def.type === "serial" ? 'SERIAL' :
        def.type === "boolean" ? 'BOOLEAN' :
        def.type === "float" ? 'REAL' :
        def.type === "reference" ? `INTEGER REFERENCES ${def.reference}(id)` : ''

    if (type === '') throw `No type for column ${def.name}`

    sqlString += ` ${type}`

    if (def.type === "reference" && def.cascade) {
        sqlString += ' ON UPDATE CASCADE ON DELETE CASCADE'
    }

    if (def.unique) { sqlString += ' UNIQUE'}
    if (def.notnull) { sqlString += ' NOT NULL'}
    if (def.pk) { sqlString += ' PRIMARY KEY'}


    return sqlString
}

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

export function generateInsert<T>(def: Table<T>, data: T): string {
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

//update schedule set scheduled_time = scheduled_time + INTERVAL '1 sec' where id = 4987;


export function generateUpdate<T>(def: Table<T>, data: T): string {
    const validColumns = def.columns.map(c => { 
        if (c.type === "reference") { return `${c.name}_id`} else { return c.name }
    }).filter(s => { return s !== 'id'})

    const columns = Object.keys(data).filter(v => validColumns.indexOf(v) > -1)
    let setStatements: string[] = []

    columns.forEach(c => {
        setStatements.push(`${c} = $[${c}]`)
    })

    let sqlText = `UPDATE ${def.name}\n`
    sqlText += 'SET\n'
    sqlText += '    ' + setStatements.join(',\n    ') + '\n'
    sqlText += 'WHERE id = $[id]\n'
    sqlText += 'RETURNING *;\n'

    return sqlText
}

export function generateSelect<T>(def: Table<T>, args?: SelectArgs): string {
    let columns

    /*
        Creating SELECT .. FROM ..
    */
    if (args && args.columns) {
        columns = args.columns.map(s => `${def.name}.${s}`).join(', ')
        //columns = args.columns.join(', ')
    } else {
        columns = def.columns.map(s => `${def.name}.${s.type !== "reference" ? s.name : s.name + '_id'}`).join(', ')
    }

    if (args && args.relations) {
        let joinedSelects:string[] = []
        def.columns.filter(c => c.type === "reference").map(refTable => {
            debug(refTable)
            let refColumns = ((generatedModel as {[key:string]: any})[refTable.reference] as GeneratedModel<any>).definition.columns
            refColumns.map(refCol => {
                const columnName = refCol.type === "reference" ? `${refCol.name}_id` : refCol.name
                joinedSelects.push(`${refTable._reference_alias}.${columnName} AS ${refTable.name}${joinTableColumnSplit}${columnName}`)
            })
        })

        if(joinedSelects) {
            columns += ', '
            columns += joinedSelects.join(', ')
        }
    }
    let sqlText = `SELECT ${columns}\nFROM ${def.name}\n`

    /*
        Creating JOIN .. ON ..
    */
    let joinText = ''
    if (args && args.relations) {
        for (let c of def.columns.filter(c => c.type === "reference")) {
            joinText += `LEFT JOIN ${c.reference} AS ${c._reference_alias} ON ${c._reference_alias}.id = ${def.name}.${c.name}_id\n`

        }
    }

    if (joinText) {
        sqlText += joinText
    } 

    /*
        Creating WHERE .. AND ..
    */
    let filterText
    let filterLines: string[] = []
    if (args && args.filters) {
        filterLines = [...args.filters.map(c => {
            if (!c.op.match(/[<>=]/g)) {
                throw `Invalid operator ${c.op}`
            }
            return `${def.name}.${c.column} ${c.op} $[${c.column}]`
        })]
    }

    if (args && args.in) {
        filterLines = [...filterLines, 
            `${args.in.column} IN (${args.in.values.join(', ')})`
        ]
    }

    if (filterLines.length > 0) {
        filterText = filterLines.join(' AND ')
        sqlText += `WHERE ${filterText}\n`
    }

    /*
        Creating ORDER BY ..
    */

    if (args && args.orderby) {
        sqlText += `ORDER BY ${args.orderby.join(', ')}\n`
    }


    sqlText += ';'

    return sqlText
}

export function mapRelations(result: any[]): void {
    result.map((r: any) => { 
        r['relations'] = {}
        Object.keys(r).map((key: string) => {
            if (key.match(joinTableColumnSplit)) {
                const relationName = key.split(joinTableColumnSplit)[0]
                if (!r['relations'][relationName]) { r['relations'][relationName] = {}}
                r['relations'][relationName][key.split(joinTableColumnSplit)[1]] = r[key]
                delete r[key]
            }
        })
    })
}