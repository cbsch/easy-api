import { Table } from ".";

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

function filter<T>(chain: QueryBuilder, filters: string[], columnName: string): Filter<T> {
    return {
        eq: (value: T) => { filters.push(`${columnName}=${value}`); return chain },
        in: (value: T[]) => { filters.push(`${columnName}[${value.join(',')}]`); return chain }
    }
}

function orderby(chain: QueryBuilder, sorts: string[], column: string) {
    return {
        asc: () => { sorts.push(`${column} asc`); return chain },
        desc: () => { sorts.push(`${column} desc`); return chain }
    }
}

export function queryBuilderFactory<T> (table: Table<T>) {
    return (): QueryBuilder => {
        const filters: string[] = []
        const sorts: string[] = []
        let query: string[] = []

        let chain: QueryBuilder = {
            filter: {},
            orderby: {},
            relations: () => { query.push(`relations`); return chain },
            get: () => {
                if (sorts.length > 0) {
                    query = [`orderby=${sorts.join(';')}`, ...query]
                }
                if (filters.length > 0) {
                    query = [`filters=${filters.join(';')}`, ...query]
                }
                return `?${query.join('&')}`
            }
        }

        for (let column of table.columns) {
            chain.orderby[column.name] = orderby(chain, sorts, column.name)

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
