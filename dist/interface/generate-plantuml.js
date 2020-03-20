"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var codebuilder_1 = require("./codebuilder");
function writePlantUml(models, path) {
    var code = codebuilder_1.default();
    code.addln("@startuml database");
    models.forEach(function (model) {
        code.addcontainer(generateTable(model.definition));
    });
    code.addln("@enduml");
    fs_1.writeFileSync(path, code.get());
}
exports.default = writePlantUml;
function generateTable(table) {
    var code = codebuilder_1.default();
    code.addln("class " + table.name + " {").indent();
    code.addln(".. primary key ..");
    table.columns.filter(function (column) { return column.pk; }).forEach(function (column) {
        code.addln("+" + column.name + ": " + column.type);
    });
    code.addln(".. fields ..");
    table.columns.filter(function (column) { return !column.pk && !column.reference; }).forEach(function (column) {
        code.addln("+" + column.name + ": " + column.type);
    });
    code.addln(".. foreign keys ..");
    table.columns.filter(function (column) { return column.reference; }).forEach(function (column) {
        code.addln("+" + column.name + ": " + column.reference);
    });
    code.unindent().addln("}");
    table.columns.filter(function (column) { return column.reference; }).forEach(function (column) {
        code.addln(table.name + "::" + column.name + " --> " + column.reference + "::id");
    });
    return code;
}
//# sourceMappingURL=generate-plantuml.js.map