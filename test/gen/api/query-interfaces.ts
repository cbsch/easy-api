import { Filter, OrderBy } from './query'
export interface LoginQueryBuilder<T> {
    filter: {
        id: Filter<number, LoginQueryBuilder<T>>
        name: Filter<string, LoginQueryBuilder<T>>
    }
    orderby: {
        id: OrderBy<LoginQueryBuilder<T>>
        name: OrderBy<LoginQueryBuilder<T>>
    }
    groupby: {
        id: () => LoginQueryBuilder<T>
        name: () => LoginQueryBuilder<T>
    }
    select: {
        id: () => LoginQueryBuilder<T>
        name: () => LoginQueryBuilder<T>
    }
    relations: () => LoginQueryBuilder<T>
    count: () => LoginQueryBuilder<T>
    toString: () => string
    get: () => Promise<T[]>
}
export interface AuditQueryBuilder<T> {
    filter: {
        id: Filter<number, AuditQueryBuilder<T>>
        name: Filter<string, AuditQueryBuilder<T>>
        created_by_id: Filter<number, AuditQueryBuilder<T>>
        modified_by_id: Filter<number, AuditQueryBuilder<T>>
    }
    orderby: {
        id: OrderBy<AuditQueryBuilder<T>>
        name: OrderBy<AuditQueryBuilder<T>>
        created_by_id: OrderBy<AuditQueryBuilder<T>>
        modified_by_id: OrderBy<AuditQueryBuilder<T>>
    }
    groupby: {
        id: () => AuditQueryBuilder<T>
        name: () => AuditQueryBuilder<T>
        created_by_id: () => AuditQueryBuilder<T>
        modified_by_id: () => AuditQueryBuilder<T>
    }
    select: {
        id: () => AuditQueryBuilder<T>
        name: () => AuditQueryBuilder<T>
        created_by_id: () => AuditQueryBuilder<T>
        modified_by_id: () => AuditQueryBuilder<T>
    }
    relations: () => AuditQueryBuilder<T>
    count: () => AuditQueryBuilder<T>
    toString: () => string
    get: () => Promise<T[]>
}
export interface ComplexQueryBuilder<T> {
    filter: {
        id: Filter<number, ComplexQueryBuilder<T>>
        name: Filter<string, ComplexQueryBuilder<T>>
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
