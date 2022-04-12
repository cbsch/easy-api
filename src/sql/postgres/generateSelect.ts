import { Table, SelectArgs } from "../../interfaces";

import { getModel } from '../../model'
import * as debugFactory from 'debug'
import { JOIN_TABLE_COLUMN_SPLIT } from "./constants";
const debug = debugFactory('easy-api:sql:pg')

export default function generateSelect<T>(def: Table<T>, args?: SelectArgs): string {

    /*
        Creating SELECT .. FROM ..
    */
    const columns = getSelectColumns(def, args)
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
                throw new Error(`Invalid operator ${c.op}`)
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

function getSelectColumns<T>(def: Table<T>, args?: SelectArgs): string {
    let columns

    if (args && args.columns) {
        columns = args.columns
            .map(s => `${def.name}.${s}`)
            .join(', ')
    } else {
        columns = def.columns
            .map(s => `${def.name}.${s.type !== "reference" ? s.name : s.name + '_id'}`)
            .join(', ')
    }

    if (args && args.relations) {
        let joinedSelects: string[] = []
        def.columns.filter(c => c.type === "reference").map(refTable => {
            debug(refTable)
            getModel<any>(refTable.reference).definition
                .columns
                .map(refCol => {
                    const columnName = refCol.type === "reference"
                        ? `${refCol.name}_id`
                        : refCol.name
                    joinedSelects.push(
                        `${refTable._reference_alias}.${columnName} AS ${refTable.name}${JOIN_TABLE_COLUMN_SPLIT}${columnName}`
                    )
                })
        })

        if (joinedSelects) {
            columns += ', '
            columns += joinedSelects.join(', ')
        }
    }

    return columns
}