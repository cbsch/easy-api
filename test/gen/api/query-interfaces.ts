import { Filter, OrderBy } from './query'
export interface loginQueryBuilder<T> {
    filter: {
        id?: Filter<number, loginQueryBuilder<T>>
        name?: Filter<string, loginQueryBuilder<T>>
    }
    orderby: {
        id?: OrderBy<loginQueryBuilder<T>>
        name?: OrderBy<loginQueryBuilder<T>>
    }
    relations: () => loginQueryBuilder<T>
    toString: () => string
    get: () => Promise<T[]>
}
export interface auditQueryBuilder<T> {
    filter: {
        id?: Filter<number, auditQueryBuilder<T>>
        name?: Filter<string, auditQueryBuilder<T>>
        created_by_id?: Filter<number, auditQueryBuilder<T>>
        modified_by_id?: Filter<number, auditQueryBuilder<T>>
    }
    orderby: {
        id?: OrderBy<auditQueryBuilder<T>>
        name?: OrderBy<auditQueryBuilder<T>>
        created_by_id?: OrderBy<auditQueryBuilder<T>>
        modified_by_id?: OrderBy<auditQueryBuilder<T>>
    }
    relations: () => auditQueryBuilder<T>
    toString: () => string
    get: () => Promise<T[]>
}
export interface complexQueryBuilder<T> {
    filter: {
        id?: Filter<number, complexQueryBuilder<T>>
        name?: Filter<string, complexQueryBuilder<T>>
        value?: Filter<number, complexQueryBuilder<T>>
        created_by_id?: Filter<number, complexQueryBuilder<T>>
        modified_by_id?: Filter<number, complexQueryBuilder<T>>
    }
    orderby: {
        id?: OrderBy<complexQueryBuilder<T>>
        name?: OrderBy<complexQueryBuilder<T>>
        value?: OrderBy<complexQueryBuilder<T>>
        created_by_id?: OrderBy<complexQueryBuilder<T>>
        modified_by_id?: OrderBy<complexQueryBuilder<T>>
    }
    relations: () => complexQueryBuilder<T>
    toString: () => string
    get: () => Promise<T[]>
}
