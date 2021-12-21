"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryBuilderFactory = void 0;
function filter(chain, filters, columnName) {
    return {
        eq: function (value) { filters.push("".concat(columnName, "=").concat(value)); return chain; },
        in: function (value) { filters.push("".concat(columnName, "[").concat(value.join(','), "]")); return chain; }
    };
}
function orderby(chain, sorts, column) {
    return {
        asc: function () { sorts.push("".concat(column, " asc")); return chain; },
        desc: function () { sorts.push("".concat(column, " desc")); return chain; }
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
                    query = __spreadArray(["orderby=".concat(sorts.join(';'))], query, true);
                }
                if (filters.length > 0) {
                    query = __spreadArray(["filters=".concat(filters.join(';'))], query, true);
                }
                return "?".concat(query.join('&'));
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
                    chain.filter["".concat(column.name, "_id")] = filter(chain, filters, "".concat(column.name, "_id"));
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