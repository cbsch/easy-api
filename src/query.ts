import { Table } from "./model";

export interface QueryBuilder {
    filter: {
        [index: string]: Filter<string | number>
    }
    orderby: {
        [index: string]: OrderBy
    }
    relations: () => QueryBuilder
    get: () => string
}

export interface Filter<T> {
    eq: (value: T) => QueryBuilder
    in: (value: T[]) => QueryBuilder
}

export interface OrderBy {
    asc: () => QueryBuilder
    desc: () => QueryBuilder
}

type FilterFactory<T> = (chain: QueryBuilder, filters: string[], columnName: string) => Filter<T>
function filter<T>(chain: QueryBuilder, filters: string[], columnName: string): Filter<T> {

    return {
        eq: (value: T) => { filters.push(`${columnName}=${value}`); return chain },
        in: (value: T[]) => { filters.push(`${columnName}[${value.join(';')}]`); return chain }
    }
}

function orderby(chain: QueryBuilder, query: string[], column: string) {
    return {
        asc: () => { query.push(`${column} asc`); return chain },
        desc: () => { query.push(`${column} desc`); return chain }
    }
}

export function queryBuilderFactory<T> (table: Table<T>) {
    return (): QueryBuilder => {
        const filters: string[] = []
        let query: string[] = []

        let chain: QueryBuilder = {
            filter: {},
            orderby: {},
            relations: () => { query.push(`relations`); return chain },
            get: () => {
                query = [`filters=${filters.join(',')}`, ...query]
                return `?${query.join('&')}`
            }
        }

        for (let column of table.columns) {
            chain.orderby[column.name] = orderby(chain, query, column.name)

            switch(column.type) {
                case "string": {
                    chain.filter[column.name] = filter<string>(chain, filters, column.name)
                    break;
                }
                case "number": {
                    chain.filter[column.name] = filter<number>(chain, filters, column.name)
                    break;
                }
                default: {
                    chain.filter[column.name] = filter<any>(chain, filters, column.name)
                    break;
                }
            }
        }

        return chain
    }
}

interface TestTable {
    id?: number
    name?: string
}
const testTable: Table<TestTable> = {
    name: 'testTable',
    columns: [{
        name: 'id',
        type: 'number'
    }, {
        name: 'name',
        type: 'string'
    }]
};
let query = queryBuilderFactory(testTable)

let result = query().filter.name.eq('test').orderby.id.asc();