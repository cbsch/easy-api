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
function groupby(chain, groupby, column) {
    return function () {
        console.log("groupby: ".concat(column));
        groupby.push(column);
        return chain;
    };
}
function select(chain, select, column) {
    return function () {
        console.log("select: ".concat(column));
        select.push(column);
        return chain;
    };
}
function queryBuilderFactory(table, get) {
    return function () {
        var filters = [];
        var sorts = [];
        var groups = [];
        var selects = [];
        var query = [];
        var chain = {
            filter: {},
            orderby: {},
            groupby: {},
            select: {},
            relations: function () { query.push("relations"); return chain; },
            count: function () { query.push("count"); return chain; },
            toString: function () {
                if (selects.length > 0) {
                    query = __spreadArray(["select=".concat(selects.join(';'))], query, true);
                }
                if (filters.length > 0) {
                    query = __spreadArray(["filters=".concat(filters.join(';'))], query, true);
                }
                if (sorts.length > 0) {
                    query = __spreadArray(["orderby=".concat(sorts.join(';'))], query, true);
                }
                if (groups.length > 0) {
                    query = __spreadArray(["groupby=".concat(groups.join(';'))], query, true);
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
            chain.groupby[column.name] = groupby(chain, groups, column.name);
            chain.select[column.name] = select(chain, selects, column.name);
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