import { Table } from "../src";

export const testTable: Table<any> = {
    name: 'testTable',
    columns: [{
        name: 'id',
        type: 'number'
    }, {
        name: 'name',
        type: 'string'
    }]
};

type Partial <T> = { [P in keyof T]?: T[P] }

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

export const complexTable: Table<any> = {
    name: 'complex',
    audit: 'login',
    columns: [{
        name: 'name',
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
    }]

}