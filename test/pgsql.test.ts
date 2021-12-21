import * as chai from 'chai';
const expect = chai.expect

import { testTable, auditTable } from './data.test'
import model, { queryToObject } from '../src/model';
import { generateCreateColumn, generateSelect } from '../src/sql/pg';
import { IDatabase } from 'pg-promise';



describe('generateCreateColumn', () => {
    it('should return correct sql', () => {
        const sql = generateCreateColumn({name: 'test', type: 'string'});

        expect(sql).to.equal('    test TEXT');
    });
});


describe('generateSelect', () => {
    it('should return sql', () => {
        const obj = queryToObject('filters=name[100,101]');
        const sql = generateSelect(testTable, obj);

        expect(sql).equal(
`SELECT testTable.id, testTable.name
FROM testTable
WHERE name IN (100, 101)
;`);
    });

    it('should handle order by', () => {
        const obj = queryToObject('orderby=name desc;id asc');
        const sql = generateSelect(testTable, obj);

        expect(sql).equal(
`SELECT testTable.id, testTable.name
FROM testTable
ORDER BY name desc, id asc
;`);
    });
});

describe('generateCreate', () => {
    it('audit should add correct columns', () => {
        const sql = model({} as IDatabase<{}>, auditTable).createText;

        expect(sql).equal(
`CREATE TABLE audit (
    id SERIAL PRIMARY KEY,
    name TEXT,
    created_by_id INTEGER REFERENCES login(id),
    modified_by_id INTEGER REFERENCES login(id)
);
ALTER SEQUENCE audit_id_seq RESTART WITH 1000;
`);
    });
});

