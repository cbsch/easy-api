import { Table } from ".";

interface TestQueryBuilder {
    filter: {
        name: Filter<string>
        id: Filter<number>
    }
    orderby: {
        name: OrderBy,
        id: OrderBy
    }
    relations: () => TestQueryBuilder
    get: () => string
}

interface Filter<T> {
    eq: (value: T) => TestQueryBuilder
    in: (value: T[]) => TestQueryBuilder
}

interface OrderBy {
    asc: () => TestQueryBuilder
    desc: () => TestQueryBuilder
}

//function customerFactory (model: GeneratedModel<any>): Filter {
const testFilter = (): TestQueryBuilder => {
    const filters: string[] = []
    const query: string[] = []

    function filter<T>(columnName: string): Filter<T> {
        return {
            eq: (value: T) => { filters.push(`${columnName}=${value}`); return chain },
            in: (value: T[]) => { filters.push(`${columnName}[${value.join(';')}]`); return chain }
        }
    }

    function orderby(column: string) {
        return {
            asc: () => { query.push(`${column} asc`); return chain },
            desc: () => { query.push(`${column} desc`); return chain }
        }
    }

    const chain: TestQueryBuilder = {
        filter: {
            name: filter<string>('name'),
            id: filter<number>('id'),
        },
        orderby: {
            name: orderby('name'),
            id: orderby('id')
        },
        relations: () => { query.push(`relations`); return chain},
        get: () => { 
            query.push(`filters=${filters.join(',')}`)
            return `?${query.join('&')}` 
        }
    }

    return chain
}
