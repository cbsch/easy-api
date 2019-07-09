import * as chai from 'chai';
const expect = chai.expect

import * as model from '../src/model'
import * as queryModule from '../src/query';
import { testTable } from './data.test';


describe('query to object', () => {
    it('should handle lists', () => {
        const obj = model.queryToObject('filters=name[100,101]');

        expect(obj).to.haveOwnProperty('in');
    });

    it('should handle orderby with 1 element', () => {
        const obj = model.queryToObject('orderby=test desc');

        expect(obj).to.haveOwnProperty('orderby').length(1);
    });

    it('should handle orderby with 2 elements', () => {
        const obj = model.queryToObject('orderby=test desc;col2');

        expect(obj).to.haveOwnProperty('orderby').length(2);
    });
});


describe('queryBuilder', () => {
    it('filters should work', () => {

        let queryBuilder = queryModule.queryBuilderFactory(testTable);
        let query = queryBuilder().filter.name.eq('test').filter.id.eq(50).orderby.id.asc();

        expect(query.toString()).to.equal('?filters=name=test;id=50&orderby=id asc');
    });
    it('orderby should work', () => {
        let queryBuilder = queryModule.queryBuilderFactory(testTable);
        let query = queryBuilder().orderby.id.asc().orderby.name.desc();

        expect(query.toString()).to.equal('?orderby=id asc;name desc');
    })
});