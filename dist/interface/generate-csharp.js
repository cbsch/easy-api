"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var codebuilder_1 = require("./codebuilder");
function generateCode(models, path, namespace) {
    var code = codebuilder_1.default();
    code.addln('using System;').addln('');
    code.addln("namespace " + namespace + " {").indent();
    code.addln('public class Api {').indent();
    models.map(function (model) {
        var name = model.definition.name;
        var prettyName = model.definition.prettyName ? model.definition.prettyName : model.definition.name;
        code.addln("public static GeneratedApi<" + name + "> " + prettyName + " = new GeneratedApi<" + name + ">();");
    });
    code.unindent().addln('}');
    models.forEach(function (model) {
        code.addcontainer(generateModelClass(model.definition));
    });
    code.unindent().addln('}');
    fs_1.writeFileSync(path, code.get());
}
exports.default = generateCode;
function generateModelClass(table) {
    var code = codebuilder_1.default();
    code.addln("public class " + table.name + " : BaseTable {").indent();
    table.columns.forEach(function (column) {
        switch (column.type) {
            case 'reference': {
                code.addln("public int? " + column.name + "_id;");
                break;
            }
            case 'date': {
                code.addln("public DateTime? " + column.name + ";");
                break;
            }
            case 'boolean': {
                code.addln("public bool? " + column.name + ";");
                break;
            }
            case 'serial': {
                break;
            }
            case 'number': {
                code.addln("public int? " + column.name + ";");
                break;
            }
            case 'string': {
                code.addln("public string " + column.name + ";");
                break;
            }
            case 'uuid': {
                code.addln("public Guid " + column.name + ";");
                break;
            }
            default: {
                code.addln("public " + column.type + "? " + column.name + ";");
            }
        }
    });
    code.unindent().addln('}');
    return code;
}
exports.generateModelClass = generateModelClass;
//# sourceMappingURL=generate-csharp.js.map