import { Table } from "./interfaces";

export interface QueryBuilder<T> {
    filter: {
        [index: string]: Filter<any, QueryBuilder<T>>
    }
    orderby: {
        [index: string]: OrderBy<QueryBuilder<T>>
    }
    groupby: {
        [index: string]: () => QueryBuilder<T>
    }
    select: {
        [index: string]: () => QueryBuilder<T>
    }
    relations: () => QueryBuilder<T>
    count: () => QueryBuilder<T>
    toString: () => string
    get: () => Promise<T[]>
}

export interface Filter<T, R> {
    eq: (value: T) => R
    in: (value: T[]) => R
}

export interface OrderBy<R> {
    asc: () => R
    desc: () => R
}

function filter<T, R>(chain: R, filters: string[], columnName: string): Filter<T, R> {
    return {
        eq: (value: T) => { filters.push(`${columnName}=${value}`); return chain },
        in: (value: T[]) => { filters.push(`${columnName}[${value.join(',')}]`); return chain }
    }
}

function orderby<R>(chain: R, sorts: string[], column: string): OrderBy<R> {
    return {
        asc: () => { sorts.push(`${column} asc`); return chain },
        desc: () => { sorts.push(`${column} desc`); return chain }
    }
}

function groupby<R>(chain: R, groupby: string[], column: string): () => R {
    return () => {
        console.log(`groupby: ${column}`)
        groupby.push(column)
        return chain
    }
}

function select<R>(chain: R, select: string[], column: string): () => R {
    return () => {
        console.log(`select: ${column}`)
        select.push(column)
        return chain
    }
}

export function queryBuilderFactory<T, QB extends QueryBuilder<T>> (
        table: Table<T>,
        get?: (query: string) => Promise<T[]>) {
    return (): QB => {
        const filters: string[] = []
        const sorts: string[] = []
        const groups: string[] = []
        const selects: string[] = []
        let query: string[] = []

        let chain: QB = {
            filter: {},
            orderby: {},
            groupby: {},
            select: {},
            relations: () => { query.push(`relations`); return chain },
            count: () => { query.push(`count`); return chain },
            toString: () => {
                if (selects.length > 0) {
                    query = [`select=${selects.join(';')}`, ...query]
                }
                if (filters.length > 0) {
                    query = [`filters=${filters.join(';')}`, ...query]
                }
                if (sorts.length > 0) {
                    query = [`orderby=${sorts.join(';')}`, ...query]
                }
                if (groups.length > 0) {
                    query = [`groupby=${groups.join(';')}`, ...query]
                }
                return `?${query.join('&')}`
            }
        } as unknown as QB

        if (get) {
            chain.get = () => { return get(chain.toString()) }
        }

        for (let column of table.columns) {
            chain.orderby[column.name] = orderby<QB>(chain, sorts, column.name)
            chain.groupby[column.name] = groupby<QB>(chain, groups, column.name)
            chain.select[column.name] = select<QB>(chain, selects, column.name)

            switch(column.type) {
                case "string": {
                    chain.filter[column.name] = filter<string, QB>(chain, filters, column.name)
                    break;
                }
                case "serial":
                case "float":
                case "number": {
                    chain.filter[column.name] = filter<number, QB>(chain, filters, column.name)
                    break;
                }
                case "reference": {
                    chain.filter[`${column.name}_id`] = filter<number, QB>(chain, filters, `${column.name}_id`)
                    break;
                }
                case "boolean": {
                    chain.filter[column.name] = filter<boolean, QB>(chain, filters, column.name)
                    break;
                }
                case "date": {
                    chain.filter[column.name] = filter<Date, QB>(chain, filters, column.name)
                    break;
                }
                default: {
                    chain.filter[column.name] = filter<any, QB>(chain, filters, column.name)
                    break;
                }
            }
        }

        return chain
    }
}
