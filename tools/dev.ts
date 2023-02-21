import * as pgpLib from 'pg-promise'
import modelWrapper, { GeneratedModel, Table } from '../src';
import { generatedModel as model, getModel, queryToObject } from '../src/model';
import { IConnectionParameters } from 'pg-promise/typescript/pg-subset';
import { Filter, OrderBy, QueryBuilder, queryBuilderFactory } from '../src/query'
import { generateQueryBuilderInterfaces } from '../src/integration/ts-client-api/generate-ts-client-api';
import generateSelect from '../src/sql/postgres/generateSelect';


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
    description?: string
    created_by_id?: number
    modified_by_id?: number
    value?: number
    enabled?: boolean
    timestamp?: Date
    uuid?: string
    default_false?: boolean
}

// Generated from console.log(generateQueryBuilderInterfaces([table]))
export interface ComplexQueryBuilder<T> {
    filter: {
        id: Filter<number, ComplexQueryBuilder<T>>
        name: Filter<string, ComplexQueryBuilder<T>>
        description: Filter<string, ComplexQueryBuilder<T>>
        value: Filter<number, ComplexQueryBuilder<T>>
        enabled: Filter<boolean, ComplexQueryBuilder<T>>
        timestamp: Filter<Date, ComplexQueryBuilder<T>>
        uuid: Filter<string, ComplexQueryBuilder<T>>
        default_false: Filter<boolean, ComplexQueryBuilder<T>>
        created_by_id: Filter<number, ComplexQueryBuilder<T>>
        modified_by_id: Filter<number, ComplexQueryBuilder<T>>
    }
    orderby: {
        id: OrderBy<ComplexQueryBuilder<T>>
        name: OrderBy<ComplexQueryBuilder<T>>
        description: OrderBy<ComplexQueryBuilder<T>>
        value: OrderBy<ComplexQueryBuilder<T>>
        enabled: OrderBy<ComplexQueryBuilder<T>>
        timestamp: OrderBy<ComplexQueryBuilder<T>>
        uuid: OrderBy<ComplexQueryBuilder<T>>
        default_false: OrderBy<ComplexQueryBuilder<T>>
        created_by_id: OrderBy<ComplexQueryBuilder<T>>
        modified_by_id: OrderBy<ComplexQueryBuilder<T>>
    }
    groupby: {
        id: () => ComplexQueryBuilder<T>
        name: () => ComplexQueryBuilder<T>
        description: () => ComplexQueryBuilder<T>
        value: () => ComplexQueryBuilder<T>
        enabled: () => ComplexQueryBuilder<T>
        timestamp: () => ComplexQueryBuilder<T>
        uuid: () => ComplexQueryBuilder<T>
        default_false: () => ComplexQueryBuilder<T>
        created_by_id: () => ComplexQueryBuilder<T>
        modified_by_id: () => ComplexQueryBuilder<T>
    }
    select: {
        id: () => ComplexQueryBuilder<T>
        name: () => ComplexQueryBuilder<T>
        description: () => ComplexQueryBuilder<T>
        value: () => ComplexQueryBuilder<T>
        enabled: () => ComplexQueryBuilder<T>
        timestamp: () => ComplexQueryBuilder<T>
        uuid: () => ComplexQueryBuilder<T>
        default_false: () => ComplexQueryBuilder<T>
        created_by_id: () => ComplexQueryBuilder<T>
        modified_by_id: () => ComplexQueryBuilder<T>
    }
    relations: () => ComplexQueryBuilder<T>
    count: () => ComplexQueryBuilder<T>
    toString: () => string
    get: () => Promise<T[]>
}

export const complexTable: Table<ComplexTable> = {
    name: 'complex',
    audit: 'login',
    columns: [{
        name: 'name',
        type: 'string'
    }, {
        name: 'description',
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
        host: '127.0.0.1',
        user: 'postgres',
        password: 'postgres'
    }

    const pgp = pgpLib();
    const db = pgp(config);

    await db.none(`DROP TABLE TestEntity`)
    await db.none(`
CREATE TABLE testentity (
    id SERIAL,
    name TEXT UNIQUE NOT NULL,
    created TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
    `)
    await db.none(`INSERT INTO Testentity(name) VALUES('hello!')`)

    await runAndPrint(db, `SELECT * FROM TestEntity`)

    await runAndPrint(db, `
SELECT
    table_schema || '.' || table_name as show_tables
FROM
    information_schema.tables
WHERE
    table_type = 'BASE TABLE'
AND
    table_schema NOT IN ('pg_catalog', 'information_schema');
    `)

    await runAndPrint(db, `
SELECT column_name, data_type, character_maximum_length
FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name ='testentity';
    `)

    await runAndPrint(db, `
SELECT pg_constraint.*
FROM pg_catalog.pg_constraint
INNER JOIN pg_catalog.pg_class ON pg_class.oid = pg_constraint.conrelid
WHERE pg_class.relname = 'testentity'
`)

    return db;
}

const startLoop = () => setTimeout(() => { startLoop() }, 10000); startLoop();

const runAndPrint = async (db: pgpLib.IDatabase<{}, any>, sql: string) => {
    console.log(JSON.stringify(await db.manyOrNone(sql), undefined, 2))
}

(async () => {
    console.log('Starting')
    const db = await setupDb()

    console.log('done')
})()