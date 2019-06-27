const expect = require('chai').expect;
const index = require('../dist/index');

const model = require('../dist/model');

describe('Dummy Test', () => {
    it('should return correctl sql', () => {
        const columnSql = model.generateCreateColumn({name: 'test', type: 'string'});

        expect(columnSql).to.equal('    test TEXT');
    });
});

describe('query to object', () => {
    it('should handle lists', () => {
        const obj = model.queryToObject('filters=name[100;101]');

        expect(obj).to.haveOwnProperty('in');
    });

    it('should handle orderby with 1 element', () => {
        const obj = model.queryToObject('orderby=test desc');

        expect(obj).to.haveOwnProperty('orderby').length(1);
    });

    it('should handle orderby with 2 elements', () => {
        const obj = model.queryToObject('orderby=test desc,col2');

        expect(obj).to.haveOwnProperty('orderby').length(2);
    });
});

const testTable = {
    name: 'testTable',
    columns: [{
        name: 'id',
        type: 'number'
    }, {
        name: 'name',
        type: 'string'
    }]
}

describe('generateSelect', () => {
    it('should return sql', () => {
        const obj = model.queryToObject('filters=name[100;101]');
        const sql = model.generateSelect(testTable, obj);
        
        expect(sql).equal(
`SELECT testTable.id, testTable.name
FROM testTable
WHERE name IN (100, 101)
;`);
    });

    it('should handle order by', () => {
        const obj = model.queryToObject('orderby=name desc,id asc');
        const sql = model.generateSelect(testTable, obj);
        expect(sql).equal(
`SELECT testTable.id, testTable.name
FROM testTable
ORDER BY name desc, id asc
;`);
    });
});
