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
var model_1 = require("../../model");
var debugFactory = require("debug");
var constants_1 = require("./constants");
var debug = debugFactory('easy-api:sql:pg');
function generateSelect(def, args) {
    var columns = getSelectColumns(def, args);
    var sqlText = "SELECT ".concat(columns, "\nFROM ").concat(def.name, "\n");
    var joinText = '';
    if (args && args.relations) {
        for (var _i = 0, _a = def.columns.filter(function (c) { return c.type === "reference"; }); _i < _a.length; _i++) {
            var c = _a[_i];
            joinText += "LEFT JOIN ".concat(c.reference, " AS ").concat(c._reference_alias, " ON ").concat(c._reference_alias, ".id = ").concat(def.name, ".").concat(c.name, "_id\n");
        }
    }
    if (joinText) {
        sqlText += joinText;
    }
    var filterText;
    var filterLines = [];
    if (args && args.filters) {
        filterLines = __spreadArray([], args.filters.map(function (c) {
            if (!c.comparison.match(/[<>=]/g)) {
                throw new Error("Invalid operator ".concat(c.comparison));
            }
            return "".concat(def.name, ".").concat(c.column, " ").concat(c.comparison, " $[").concat(c.column, "]");
        }), true);
    }
    if (args && args.in) {
        filterLines = __spreadArray(__spreadArray([], filterLines, true), ["".concat(args.in.column, " IN (").concat(args.in.values.join(', '), ")")], false);
    }
    if (filterLines.length > 0) {
        filterText = filterLines.join(' AND ');
        sqlText += "WHERE ".concat(filterText, "\n");
    }
    if (args && args.orderby) {
        sqlText += "ORDER BY ".concat(args.orderby.join(', '), "\n");
    }
    if (args && args.groupby) {
        sqlText += "GROUP BY ".concat(args.groupby.join(', '), "\n");
    }
    sqlText += ';';
    return sqlText;
}
exports.default = generateSelect;
function getSelectColumns(def, args) {
    var columns;
    if (args && args.select) {
        columns = args.select
            .map(function (s) { return "".concat(def.name, ".").concat(s); })
            .join(', ');
    }
    else {
        columns = def.columns
            .map(function (s) { return "".concat(def.name, ".").concat(s.type !== "reference" ? s.name : s.name + '_id'); })
            .join(', ');
    }
    if (args && args.relations) {
        var joinedSelects_1 = [];
        def.columns.filter(function (c) { return c.type === "reference"; }).map(function (refTable) {
            debug(refTable);
            (0, model_1.getModel)(refTable.reference).definition
                .columns
                .map(function (refCol) {
                var columnName = refCol.type === "reference"
                    ? "".concat(refCol.name, "_id")
                    : refCol.name;
                joinedSelects_1.push("".concat(refTable._reference_alias, ".").concat(columnName, " AS ").concat(refTable.name).concat(constants_1.JOIN_TABLE_COLUMN_SPLIT).concat(columnName));
            });
        });
        if (joinedSelects_1) {
            columns += ', ';
            columns += joinedSelects_1.join(', ');
        }
    }
    if (args && args.count) {
        columns += ', COUNT(*) as count';
    }
    return columns;
}
//# sourceMappingURL=generateSelect.js.map