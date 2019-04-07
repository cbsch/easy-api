const expect = require('chai').expect;
const index = require('../dist/index');

const model = require('../dist/model');

describe('Dummy Test', () => {
    it('should return correctl sql', () => {
        const columnSql = model.generateCreateColumn({name: 'test', type: 'string'})

        expect(columnSql).to.equal('    test TEXT')
    });
});

describe('query to object', () => {
    it('should handle lists', () => {
        const obj = model.queryToObject('filters=name[100;101]')

        expect(obj).to.haveOwnProperty('in')
    })
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
        const obj = model.queryToObject('filters=name[100;101]')
        const sql = model.generateSelect(testTable, obj)
        console.log(sql)
    })
})