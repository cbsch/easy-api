"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testFilter = function () {
    var filters = [];
    var query = [];
    function filter(columnName) {
        return {
            eq: function (value) { filters.push("".concat(columnName, "=").concat(value)); return chain; },
            in: function (value) { filters.push("".concat(columnName, "[").concat(value.join(';'), "]")); return chain; }
        };
    }
    function orderby(column) {
        return {
            asc: function () { query.push("".concat(column, " asc")); return chain; },
            desc: function () { query.push("".concat(column, " desc")); return chain; }
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
            query.push("filters=".concat(filters.join(',')));
            return "?".concat(query.join('&'));
        }
    };
    return chain;
};
//# sourceMappingURL=query-old.js.map