"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModelClass = void 0;
var fs_1 = require("fs");
var codebuilder_1 = require("./codebuilder");
function generateCode(models, path, namespace) {
    var code = (0, codebuilder_1.default)();
    code.addln('using System;').addln('');
    code.addln("namespace ".concat(namespace, " {")).indent();
    code.addln('public class Api {').indent();
    models.map(function (model) {
        var name = model.definition.name;
        var prettyName = model.definition.prettyName ? model.definition.prettyName : model.definition.name;
        code.addln("public static GeneratedApi<".concat(name, "> ").concat(prettyName, " = new GeneratedApi<").concat(name, ">();"));
    });
    code.unindent().addln('}');
    models.forEach(function (model) {
        code.addcontainer(generateModelClass(model.definition));
    });
    code.unindent().addln('}');
    (0, fs_1.writeFileSync)(path, code.get());
}
exports.default = generateCode;
function generateModelClass(table) {
    var code = (0, codebuilder_1.default)();
    code.addln("public class ".concat(table.name, " : BaseTable {")).indent();
    table.columns.forEach(function (column) {
        switch (column.type) {
            case 'reference': {
                code.addln("public int? ".concat(column.name, "_id;"));
                break;
            }
            case 'date': {
                code.addln("public DateTime? ".concat(column.name, ";"));
                break;
            }
            case 'boolean': {
                code.addln("public bool? ".concat(column.name, ";"));
                break;
            }
            case 'serial': {
                break;
            }
            case 'number': {
                code.addln("public int? ".concat(column.name, ";"));
                break;
            }
            case 'string': {
                code.addln("public string ".concat(column.name, ";"));
                break;
            }
            case 'uuid': {
                code.addln("public Guid ".concat(column.name, ";"));
                break;
            }
            default: {
                code.addln("public ".concat(column.type, "? ").concat(column.name, ";"));
            }
        }
    });
    code.unindent().addln('}');
    return code;
}
exports.generateModelClass = generateModelClass;
//# sourceMappingURL=generate-csharp.js.map