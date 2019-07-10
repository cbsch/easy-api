"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function filter(chain, filters, columnName) {
    return {
        eq: function (value) { filters.push(columnName + "=" + value); return chain; },
        in: function (value) { filters.push(columnName + "[" + value.join(',') + "]"); return chain; }
    };
}
function orderby(chain, sorts, column) {
    return {
        asc: function () { sorts.push(column + " asc"); return chain; },
        desc: function () { sorts.push(column + " desc"); return chain; }
    };
}
function queryBuilderFactory(table, get) {
    return function () {
        var filters = [];
        var sorts = [];
        var query = [];
        var chain = {
            filter: {},
            orderby: {},
            relations: function () { query.push("relations"); return chain; },
            toString: function () {
                if (sorts.length > 0) {
                    query = ["orderby=" + sorts.join(';')].concat(query);
                }
                if (filters.length > 0) {
                    query = ["filters=" + filters.join(';')].concat(query);
                }
                return "?" + query.join('&');
            }
        };
        if (get) {
            chain.get = function () { return get(chain.toString()); };
        }
        for (var _i = 0, _a = table.columns; _i < _a.length; _i++) {
            var column = _a[_i];
            chain.orderby[column.name] = orderby(chain, sorts, column.name);
            switch (column.type) {
                case "string": {
                    chain.filter[column.name] = filter(chain, filters, column.name);
                    break;
                }
                case "serial":
                case "float":
                case "number": {
                    chain.filter[column.name] = filter(chain, filters, column.name);
                    break;
                }
                case "reference": {
                    chain.filter[column.name + "_id"] = filter(chain, filters, column.name + "_id");
                    break;
                }
                case "boolean": {
                    chain.filter[column.name] = filter(chain, filters, column.name);
                    break;
                }
                case "date": {
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
//# sourceMappingURL=query.js.map