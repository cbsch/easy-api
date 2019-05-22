import { IDatabase as Database } from 'pg-promise'
import * as events from 'events'
import * as debugFactory from 'debug'

import * as querystring from 'querystring'

const debug = debugFactory('easy-api:model:generator')

let generatedModel: {[key:string]: any} = {}

export { generatedModel }

const emitter = new events.EventEmitter()
emitter.setMaxListeners(500)

export { emitter }

export interface Table<T> {
    name: string
    columns: Column[]
    autoId?: boolean
    sqlhooks?: SqlHooks<T>
}

export interface SqlHooks<T> {
    postBefore?: (data: T) => void
    postAfter?: (data: T) => void
}

const joinTableColumnSplit = '___'

export type Types = "string" | "number" | "date" | "reference" | "serial" | "boolean" | "float"

export interface Column {
    name: string
    type: Types
    reference?: string
    unique?: boolean
    notnull?: boolean
    cascade?: boolean
    pk?: boolean
}

export interface GeneratedModel<T> {
    definition: Table<T>,
    createText: string,
    create: () => void,
    drop: () => void,

    insert: (data: T) => Promise<T>,
    delete: (id: number) => Promise<T>,
    find: (query?: string) => Promise<T[]>,
    update: (data: T) => Promise<T>
}

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
        def.type === "date" ? 'TIMESTAMP' :
        def.type === "serial" ? 'SERIAL' :
        def.type === "boolean" ? 'BOOLEAN' :
        def.type === "float" ? 'REAL' :
        def.type === "reference" ? `INTEGER REFERENCES ${def.reference}(id)` : ''

    if (type === '') throw `No type for column ${def.name}`

    sqlString += ` ${type}`

    if (def.unique) { sqlString += ' UNIQUE'}
    if (def.notnull) { sqlString += ' NOT NULL'}
    if (def.pk) { sqlString += ' PRIMARY KEY'}

    if (def.type === "reference" && def.cascade) {
        sqlString += ' ON UPDATE CASCADE ON DELETE CASCADE'
    }

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

export interface SelectArgs {
    columns?: string[],
    relations?: boolean,
    filters?: {
        column: string, 
        op: string, 
        value: string | number | Date }[]
    in?: { column: string, values: string[] | number[] | Date[] }
}

export function queryToObject(string?: string): SelectArgs {

    if (!string) { return undefined }

    const query: any = querystring.parse(string)

    let args: SelectArgs = {}
    if (query && query['filters']) {
        args.filters = []
        let filterList = query['filters'].split(',')
        for (const filter of filterList) {
            let op = filter.match('=') ? '=' : 
                filter.match('>') ? '>' : 
                filter.match('<') ? '<' : 
                filter.match(/\[/) ? '[' : undefined
            if (!op) { continue }

            if (op === '[') {
                let values = filter.split(op)[1].split(']')[0].split(';')
                args.in = {
                    column: filter.split(op)[0],
                    values: values
                }
            } else {
                let column = filter.split(op)[0]
                let value = filter.split(op)[1]

                args.filters.push({
                    column: column,
                    op: op,
                    value: value
                })

            }
        }
    }

    if (query && undefined !== query['relations']) {
        args.relations = true
    }

    return args
}

export function generateSelect<T>(def: Table<T>, args?: SelectArgs): string {
    var columns

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
        var joinedSelects:string[] = []
        def.columns.filter(c => c.type === "reference").map(refTable => {
            debug(refTable)
            var refColumns = ((generatedModel as {[key:string]: any})[refTable.reference] as GeneratedModel<any>).definition.columns
            refColumns.map(refCol => {
                const columnName = refCol.type === "reference" ? `${refCol.name}_id` : refCol.name
                joinedSelects.push(`${refTable.reference}.${columnName} AS ${refTable.name}${joinTableColumnSplit}${columnName}`)
            })
        })

        if(joinedSelects) {
            columns += ', '
            columns += joinedSelects.join(', ')
        }
    }
    var sqlText = `SELECT ${columns}\nFROM ${def.name}\n`

    /*
        Creating JOIN .. ON ..
    */
    var joinText = ''
    if (args && args.relations) {
        def.columns.filter(c => c.type === "reference").map(c => {
            joinText += `JOIN ${c.reference} ON ${c.reference}.id = ${c.name}_id\n`
        })
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
        sqlText += `WHERE ${filterText}`
    }
    sqlText += ';'

    return sqlText
}

export function modelWrapper(db: Database<{}>) {
    if (!db) {
        throw "db object not initialized"
    }

    return function<T>(def: Table<T>): GeneratedModel<T> {
        return model<T>(db, def)
    }
}


export default function model<T>(db: Database<{}>, def: Table<T>): GeneratedModel<T> {
    if (!db) {
        throw "db object not initialized"
    }
    if (!def) {
        throw "definition object not initialized"
    }

    debug(`generating table ${def.name} on db ${db}`)

    def.columns.unshift({name: 'id', type: "serial", pk: true})

    def.columns = def.columns.map(c => { return {
        ...c,
        reference: c.reference ? c.reference : c.type === "reference" ? c.name : null
    }})

    const model = {
        definition: def,
        createText: generateCreateTable(def),
        create: createFactory<T>(db, def),
        drop: dropFactory<T>(db, def),

        insert: insertFactory<T>(db, def),
        delete: deleteFactory<T>(db, def),
        find: findFactory<T>(db, def),
        update: updateFactory<T>(db, def)
    }

    generatedModel[def.name] = model

    return model
}

function deleteFactory<T>(db: Database<{}>, def: Table<T>): (id: number) => Promise<T> {
    return (id: number): Promise<T> => {
        return new Promise<T>(async (resolve, reject) => {
            try {
                const result = await db.oneOrNone<T>(`DELETE FROM ${def.name} WHERE id = $[id] RETURNING *;`, {id: id})
                resolve(result)
            } catch (err) {
                reject(err)
            }
        })
    }
}

function updateFactory<T>(db: Database<{}>, def: Table<T>): (data: T) => Promise<T> {
    return (data: T): Promise<T> => {
        const sqlText = generateUpdate(def, data)
        return new Promise<T>(async (resolve, reject) => {
            try {
                const result = await db.oneOrNone<T>(sqlText, data)
                emitter.emit(`${def.name}_update` , result)
                resolve(result)
            } catch(err) {
                reject(err)
            }
        })
    }
}

function insertFactory<T>(db: Database<{}>, def: Table<T>): (data: T) => Promise<T> {
    return (data: T): Promise<T> => {
        return new Promise<T>(async (resolve, reject) => {
            try {
                const sqlText = generateInsert(def, data)

                const result = await db.oneOrNone<T>(sqlText, data)
                emitter.emit(`${def.name}_insert` , result)
                resolve(result)
            } catch (err) {
                reject(err)
            }
        })
    }
}

function dropFactory<T>(db: Database<{}>, def: Table<T>): () => Promise<void> {
    return () => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await db.none(`DROP TABLE IF EXISTS ${def.name};`)
                resolve()
            } catch (err) {
                debug(`unable to drop table ${def.name}`)
                reject(err)
            }
        })
    }
}

function createFactory<T>(db: Database<{}>, def: Table<T>): () => Promise<void> {
    const sqlText = generateCreateTable(def)
    return () => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await db.none(sqlText)
                resolve()
            } catch (err) {
                debug(`failed to create table ${def.name}`)
                reject(err)
            }
        })
    }
}

function findFactory<T>(db: Database<{}>, def: Table<T>): (query?: string) => Promise<T[]> {
    return (query?: string) => {
        return new Promise<T[]>(async (resolve, reject) => {
            try {
                debug(`find called on ${def.name}`)

                const args = queryToObject(query)

                const sqlText = generateSelect(def, args)
                var obj: any = {}
                if (args && args.filters) {
                    args.filters.forEach(a => { obj[a.column] = a.value})
                }
                const result = await db.manyOrNone(sqlText, obj)
                debug(`found ${result.length} ${def.name}`)

                if (args && args.relations) {
                    mapRelations(result)
                }

                resolve(result)
            } catch (err) {
                reject(err)
            }
        })
    }
}


function mapRelations(result: any[]): void {

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