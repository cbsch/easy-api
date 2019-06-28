"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testFilter = function () {
    var filters = [];
    var query = [];
    function filter(columnName) {
        return {
            eq: function (value) { filters.push(columnName + "=" + value); return chain; },
            in: function (value) { filters.push(columnName + "[" + value.join(';') + "]"); return chain; }
        };
    }
    function orderby(column) {
        return {
            asc: function () { query.push(column + " asc"); return chain; },
            desc: function () { query.push(column + " desc"); return chain; }
        };
    }
    var chain = {
        filter: {
            name: filter('name'),
            id: filter('id'),
        },
        orderby: {
            name: orderby('name'),
            id: orderby('id')
        },
        relations: function () { query.push("relations"); return chain; },
        get: function () {
            query.push("filters=" + filters.join(','));
            return "?" + query.join('&');
        }
    };
    return chain;
};
//# sourceMappingURL=query-old.js.map