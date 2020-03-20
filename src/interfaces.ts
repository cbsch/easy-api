export type Types = "string" | "number" | "date" | "reference" | "serial" | "boolean" | "float" | "uuid"

export interface Column {
    name: string
    prettyName?: string
    type: Types
    extraColumnSql?: string
    default?: string
    reference?: string
    _reference_alias?: string
    unique?: boolean
    notnull?: boolean
    cascade?: boolean
    pk?: boolean
}

export interface Table<T> {
    name: string
    prettyName?: string
    isLinkTable: boolean
    columns: Column[]
    autoId?: boolean
    timetravel?: boolean
    audit?: string
}

export interface SqlHooks<T> {
    postBefore?: (data: T) => void
    postAfter?: (data: T) => void
}

export interface GeneratedModel<T> {
    definition: Table<T>,
    createText: string,
    create: () => void,
    drop: () => void,

    insert: (data: T) => Promise<T>,
    delete: (id: number) => Promise<T>,
    find: (query?: string) => Promise<T[]>,
    update: (data: T) => Promise<T>
}


export interface SelectArgs {
    columns?: string[],
    relations?: boolean,
    filters?: {
        column: string, 
        op: string, 
        value: string | number | Date }[]
    in?: { column: string, values: string[] | number[] | Date[] },
    orderby?: string[]
}