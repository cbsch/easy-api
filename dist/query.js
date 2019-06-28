"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function filter(chain, filters, columnName) {
    return {
        eq: function (value) { filters.push(columnName + "=" + value); return chain; },
        in: function (value) { filters.push(columnName + "[" + value.join(';') + "]"); return chain; }
    };
}
function orderby(chain, query, column) {
    return {
        asc: function () { query.push(column + " asc"); return chain; },
        desc: function () { query.push(column + " desc"); return chain; }
    };
}
function queryBuilderFactory(table) {
    return function () {
        var filters = [];
        var query = [];
        var chain = {
            filter: {},
            orderby: {},
            relations: function () { query.push("relations"); return chain; },
            get: function () {
                query = ["filters=" + filters.join(',')].concat(query);
                return "?" + query.join('&');
            }
        };
        for (var _i = 0, _a = table.columns; _i < _a.length; _i++) {
            var column = _a[_i];
            chain.orderby[column.name] = orderby(chain, query, column.name);
            switch (column.type) {
                case "string": {
                    chain.filter[column.name] = filter(chain, filters, column.name);
                    break;
                }
                case "number": {
                    chain.filter[column.name] = filter(chain, filters, column.name);
                    break;
                }
                default: {
                    chain.filter[column.name] = filter(chain, filters, column.name);
                    break;
                }
            }
        }
        return chain;
    };
}
exports.queryBuilderFactory = queryBuilderFactory;
var testTable = {
    name: 'testTable',
    columns: [{
            name: 'id',
            type: 'number'
        }, {
            name: 'name',
            type: 'string'
        }]
};
var query = queryBuilderFactory(testTable);
var result = query().filter.name.eq('test').orderby.id.asc();
//# sourceMappingURL=query.js.map