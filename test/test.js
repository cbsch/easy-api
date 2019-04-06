const expect = require('chai').expect;
const index = require('../dist/index');

const model = require('../dist/model');

describe('Dummy Test', () => {
    it('should return correctl sql', () => {
        const columnSql = model.generateCreateColumn({name: 'test', type: 'string'})

        expect(columnSql).to.equal('    test TEXT')
    })

});