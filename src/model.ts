import { IDatabase as Database } from 'pg-promise'
import * as events from 'events'
import * as debugFactory from 'debug'

import * as querystring from 'querystring'
import { SelectArgs, Table, GeneratedModel } from './interfaces';
import { generateCreateTable, generateUpdate, generateInsert, generateSelect, mapRelations } from './sql/pg';

const debug = debugFactory('easy-api:model:generator')

let generatedModel: {[key:string]: any} = {}

export { generatedModel }

const emitter = new events.EventEmitter()
emitter.setMaxListeners(500)

export { emitter }

export function queryToObject(string?: string): SelectArgs {

    if (!string) { return undefined }

    const query: any = querystring.parse(string)

    let args: SelectArgs = {}
    if (query && query['filters']) {
        args.filters = []
        let filterList = query['filters'].split(';')
        for (const filter of filterList) {
            let op = filter.match('=') ? '=' : 
                filter.match('>') ? '>' : 
                filter.match('<') ? '<' : 
                filter.match(/\[/) ? '[' : undefined
            if (!op) { continue }

            if (op === '[') {
                let values = filter.split(op)[1].split(']')[0].split(',')
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
    if (query && undefined !== query['orderby']) {
        args.orderby = query['orderby'].split(';')
    }

    return args
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

    if (generatedModel[def.name]) {
        //console.log(`WARNING: model ${def.name} already added. Returning already generated model`)
        return generatedModel[def.name]
    }

    debug(`generating table ${def.name} on db ${db}`)

    //def.columns.unshift({name: 'id', type: 'serial', pk: true})
    def.columns = [{name: 'id', type: 'serial', pk: true}, ...def.columns]

    def.columns = def.columns.map(c => { return {
        ...c,
        reference: c.reference ? c.reference : c.type === "reference" ? c.name : null
    }})

    if (def.audit) {
        def.columns = [
            ...def.columns,
            {name: 'created_by', type: 'reference', reference: def.audit},
            {name: 'modified_by', type: 'reference', reference: def.audit}
        ]
    }

    let aliasNumber = 0

    def.columns = def.columns.map(c => {
        if (c.type === 'reference') {
            return {
                ...c,
                _reference_alias: `${c.reference}${aliasNumber++}`
            }
        } else {
            return c
        }
    })

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

