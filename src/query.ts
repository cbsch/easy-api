interface QueryBuilder {
    name: QueryBuilderValue<string>
    id: QueryBuilderValue<number>
    get: () => string
}

interface QueryBuilderValue<T> {
    eq: (value: T) => QueryBuilder
    in: (value: T[]) => QueryBuilder
}

//function customerFactory (model: GeneratedModel<any>): Filter {
const testFilter = (): QueryBuilder => {
    const filters: any = []

    function columnFilterFactory<T>(columnName: string): QueryBuilderValue<T> {
        return {
            eq: (value: T) => { filters.push(`${columnName}=${value}`); return chain },
            in: (value: T[]) => { filters.push(`${columnName}[${value.join(';')}]`); return chain }
        }
    }

    const chain: QueryBuilder = {
        name: columnFilterFactory<string>('name'),
        id: columnFilterFactory<number>('id'),
        get: () => { return `filters=${filters.join(',')}` }
    }

    return chain
}