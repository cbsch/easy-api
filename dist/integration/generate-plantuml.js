"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var codebuilder_1 = require("./codebuilder");
function writePlantUml(models, path) {
    var code = (0, codebuilder_1.default)();
    code.addln("@startuml database");
    models.forEach(function (model) {
        code.addcontainer(generateTable(model.definition));
    });
    code.addln("@enduml");
    (0, fs_1.writeFileSync)(path, code.get());
}
exports.default = writePlantUml;
function generateTable(table) {
    var code = (0, codebuilder_1.default)();
    code.addln("class ".concat(table.name, " {")).indent();
    code.addln(".. primary key ..");
    table.columns.filter(function (column) { return column.pk; }).forEach(function (column) {
        code.addln("+".concat(column.name, ": ").concat(column.type));
    });
    code.addln(".. fields ..");
    table.columns.filter(function (column) { return !column.pk && !column.reference; }).forEach(function (column) {
        code.addln("+".concat(column.name, ": ").concat(column.type));
    });
    code.addln(".. foreign keys ..");
    table.columns.filter(function (column) { return column.reference; }).forEach(function (column) {
        code.addln("+".concat(column.name, ": ").concat(column.reference));
    });
    code.unindent().addln("}");
    table.columns.filter(function (column) { return column.reference; }).forEach(function (column) {
        code.addln("".concat(table.name, "::").concat(column.name, " --> ").concat(column.reference, "::id"));
    });
    return code;
}
//# sourceMappingURL=generate-plantuml.js.map