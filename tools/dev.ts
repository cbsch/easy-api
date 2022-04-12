import * as pgpLib from 'pg-promise'
import modelWrapper, { GeneratedModel, Table } from '../src';
import { generatedModel as model, getModel } from '../src/model';
import { IConnectionParameters } from 'pg-promise/typescript/pg-subset';


export interface Login {
    id: number
    name: string
}
export const loginTable: Table<Partial<Login>> = {
    name: 'login',
    columns: [{
        name: 'name',
        type: 'string'
    }]
}

export interface Audit {
    id: number
    name: string
    created_by_id: number
    modified_by_id: number
}

export const auditTable: Table<Partial<Audit>> = {
    name: 'audit',
    audit: 'login',
    columns: [{
        name: 'name',
        type: 'string'
    }]
}

interface ComplexTable {
    id?: number
    name?: string
    created_by_id?: number
    modified_by_id?: number
    value?: number
    enabled?: boolean
    timestamp?: Date
    uuid?: string
    default_false?: boolean
}

export const complexTable: Table<ComplexTable> = {
    name: 'complex',
    audit: 'login',
    columns: [{
        name: 'name',
        type: 'string'
    }, {
        name: 'value',
        type: 'number'
    }, {
        name: 'enabled',
        type: 'boolean'
    }, {
        name: 'timestamp',
        type: 'date'
    }, {
        name: 'uuid',
        type: 'uuid'
    }, {
        name: 'default_false',
        type: 'boolean',
        default: 'false'
    }]

}


const setupDb = async () => {
    // const config = require('../config').config
    const config: IConnectionParameters = {
        host: 'localhost',
        user: 'postgres',
        password: 'postgres'
    }

    const pgp = pgpLib();
    const db = pgp(config);

    const modelFactory = modelWrapper(db as any)

    const login = modelFactory(loginTable)
    const audit = modelFactory(auditTable)
    const complex = modelFactory(complexTable)

    for (var i = 0, keys = Object.keys(model).reverse(); i < keys.length; i++) {
        await ((model as any)[keys[i]].drop())
    }

    for (var i = 0, keys = Object.keys(model); i < keys.length; i++) {
        await ((model as any)[keys[i]].create())
    }

    await login.insert({ name: 'Test User' })
}

const startLoop = () => setTimeout(() => { startLoop() }, 10000); startLoop();

(async () => {
    await setupDb()

    const table = getModel<ComplexTable>('complex')

    await Promise.all([
        table.insert({ name: 'test' }),
        table.insert({ name: 'test2' }),
        table.insert({ name: 'test3', created_by_id: 1000, modified_by_id: 1000 })
    ])

    // const result = await table.find({
    //     filters: [{
    //         column: 'name',
    //         op: '=',
    //         value: 'test3'
    //     }],
    //     relations: true
    // })

    const result = await table.find("filters=name=test3;created_by_id=1000")

    console.log(JSON.stringify(result, undefined, 2))

    console.log(JSON.stringify(await table.find({
        orderby: ['id']
    }), undefined, 2))

    console.log('done')
})()