export interface login {
    id?: number
    name?: string
}

export interface audit {
    id?: number
    name?: string
    created_by_id?: number
    modified_by_id?: number
    relations?: {
        created_by?: login
        modified_by?: login
    }
}

export interface complex {
    id?: number
    name?: string
    value?: number
    enabled?: boolean
    timestamp?: Date
    default_false?: boolean
    created_by_id?: number
    modified_by_id?: number
    relations?: {
        created_by?: login
        modified_by?: login
    }
}

