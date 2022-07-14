import * as pgpLib from 'pg-promise'
import modelWrapper, { GeneratedModel, Table } from '../src';
import { generatedModel as model, getModel } from '../src/model';
import { IConnectionParameters } from 'pg-promise/typescript/pg-subset';
import { Filter, OrderBy, QueryBuilder, queryBuilderFactory } from '../src/query'
import { generateQueryBuilderInterfaces } from '../src/integration/ts-client-api/generate-ts-client-api';


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

    return db;
}

const startLoop = () => setTimeout(() => { startLoop() }, 10000); startLoop();


const testTextSearch = async (db: pgpLib.IDatabase<{}, any>) => {
    console.log(JSON.stringify(await db.manyOrNone(`
SELECT *
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog' AND
    schemaname != 'information_schema';
`), undefined, 2))

//     await db.none(`
// ALTER TABLE complex ADD COLUMN ts tsvector
//     GENERATED ALWAYS AS (to_tsvector('english', name)) STORED;
// CREATE INDEX ts_idx ON complex USING GIN (ts);
// `)

// Search index on multiple columns
    await db.none(`
ALTER TABLE complex ADD COLUMN ts tsvector
    GENERATED ALWAYS AS
    (to_tsvector('english', coalesce(name, '')) ||
    to_tsvector('english', coalesce(description, '')))
    STORED;
CREATE INDEX ts_idx ON complex USING GIN (ts);
`)

// Weighted search index on multiple columns
    await db.none(`
ALTER TABLE complex ADD COLUMN ts_weighted tsvector
    GENERATED ALWAYS AS
    (setweight(to_tsvector('english', coalesce(name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'A'))
    STORED;
CREATE INDEX ts_weighted_idx ON complex USING GIN (ts);
`)

// Query search index
    await runAndPrint(db, `
SELECT id, name, description
FROM complex
WHERE ts_weighted @@ websearch_to_tsquery('english', 'run');
`)
}

const runAndPrint = async (db: pgpLib.IDatabase<{}, any>, sql: string) => {
    console.log(JSON.stringify(await db.manyOrNone(sql), undefined, 2))
}


(async () => {
    const db = await setupDb()


    const table = getModel<ComplexTable>('complex')

    await Promise.all([
        table.insert({ name: 'test' }),
        table.insert({ name: 'test' }),
        table.insert({ name: 'test' }),
        table.insert({ name: 'run' }),
        table.insert({ name: 'sprint', description: 'running very fast' }),
        table.insert({ name: 'test2' }),
        table.insert({ name: 'test3', created_by_id: 1000, modified_by_id: 1000 })
    ])

    // await testTextSearch(db)


    // console.log(JSON.stringify(
    //     await table.find("filters=name=test3;created_by_id=1000"),
    //     undefined,
    //     2
    // ))

    // console.log(JSON.stringify(
    //     await table.find("select=name&groupby=name&count"),
    //     undefined,
    //     2
    // ))
    // console.log(JSON.stringify(
    //     await table.find({
    //         filters: [{
    //             column: 'name',
    //             comparison: '=',
    //             value: 'test3'
    //         }],
    //         relations: true
    //     }),
    //     undefined,
    //     2
    // ))

    // console.log(JSON.stringify(
    //     await table.find({
    //         filters: [{
    //             column: 'name',
    //             comparison: '=',
    //             value: 'test'
    //         }],
    //         count: true,
    //         groupby: ['name'],
    //         select: ['name']
    //     }),
    //     undefined,
    //     2
    // ))

    // console.log(generateQueryBuilderInterfaces([table]))
    const query = queryBuilderFactory<ComplexTable, ComplexQueryBuilder<ComplexTable>>(table.definition)()
    // console.log(query.groupby.name().select.name().count().toString())

    console.log(JSON.stringify(
        await table.find("select=name&groupby=name&count&filters=name=test"),
        undefined,
        2
    ))

    console.log("select=name&filters=name=test&groupby=name&count")
    console.log(query.groupby.name().select.name().count().toString())
    console.log(JSON.stringify(
        await table.find(query.groupby.name().select.name().count().toString()),
        undefined,
        2
    ))

    // console.log(JSON.stringify(await table.find({
    //     orderby: ['id']
    // }), undefined, 2))

    console.log('done')
})()