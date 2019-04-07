var testFilter = function () {
    var filters = [];
    function columnFilterFactory(columnName) {
        return {
            eq: function (value) { filters.push(columnName + "=" + value); return chain; },
            in: function (value) { filters.push(columnName + "[" + value.join(';') + "]"); return chain; }
        };
    }
    var chain = {
        name: columnFilterFactory('name'),
        id: columnFilterFactory('id'),
        get: function () { return "filters=" + filters.join(','); }
    };
    return chain;
};
//# sourceMappingURL=query.js.map