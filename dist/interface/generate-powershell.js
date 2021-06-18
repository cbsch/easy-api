"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var codebuilder_1 = require("./codebuilder");
function generateCode(models, path) {
    var code = codebuilder_1.default();
    models.forEach(function (model) {
        code.addcontainer(generateFunction(model.definition));
    });
    models.forEach(function (model) {
        code.addcontainer(generateEndpointClass(model.definition));
    });
    models.forEach(function (model) {
        code.addcontainer(generateModelClass(model.definition));
    });
    code.addln('class Api {').indent();
    models.map(function (model) {
        var name = model.definition.name;
        code.addln("[" + name + "_endpoint]$" + name + " = (New-Object " + name + "_endpoint)");
    });
    code.unindent().addln('}').addln('');
    code.addln('Function Get-TenantPortalApiEndpoint {').indent();
    code.addln('return [Api]::new()');
    code.unindent().addln('}');
    fs_1.writeFileSync(path, code.get());
}
exports.default = generateCode;
function generateFunction(table) {
    var code = codebuilder_1.default();
    var name = table.name;
    var prettyName = table.prettyName ? table.prettyName : table.name;
    code.addln("Function Get-AP" + prettyName + " {").indent();
    code.addln("[OutputType([" + name + "])]");
    code.addln("Param(").indent();
    code.addln("[Parameter()][int]$Id,");
    code.addln("[Parameter()][string]$Query").unindent();
    code.addln(")");
    code.addln("$path = \"/api/" + name + "\"");
    code.addln("if ($Id) {").indent();
    code.addln("$Query = \"?filters=id=$Id\"").unindent();
    code.addln("}");
    code.addln("if ($Query) {").indent();
    code.addln("$path += $Query").unindent();
    code.addln("}");
    code.addln("return Invoke-Request -Path $Path").unindent();
    code.addln("}");
    return code;
}
exports.generateFunction = generateFunction;
function generateEndpointClass(table) {
    var code = codebuilder_1.default();
    var name = table.name;
    code.addln("class " + table.name + "_endpoint {").indent();
    code.addln("[PSObject]getById([int]$Id) {").indent();
    code.addln("return Invoke-Request -Path \"/api/" + name + "?filters=id=$Id\"");
    code.unindent().addln('}');
    code.addln("[PSObject[]]get() {").indent();
    code.addln("return $this.get(\"\")");
    code.unindent().addln('}');
    code.addln("[PSObject[]]get([string]$Query) {").indent();
    code.addln("return Invoke-Request -Path \"/api/" + name + "$Query\"");
    code.unindent().addln('}');
    code.addln("[PSObject]put([" + name + "]$" + name + ") {").indent();
    code.addln("return Invoke-Request -Path \"/api/" + name + "\" -Method PUT -Body $" + name);
    code.unindent().addln('}');
    code.addln("[PSObject]post([" + name + "]$" + name + ") {").indent();
    code.addln("return Invoke-Request -Path \"/api/" + name + "\" -Method POST -Body $" + name);
    code.unindent().addln('}');
    code.addln("[PSObject]delete([" + name + "]$" + name + ") {").indent();
    code.addln("return Invoke-Request -Path \"/api/" + name + "\" -Method DELETE -Body $" + name);
    code.unindent().addln('}');
    code.unindent().addln("}");
    return code;
}
exports.generateEndpointClass = generateEndpointClass;
function generateModelClass(table) {
    var code = codebuilder_1.default();
    code.addln("class " + table.name + " {").indent();
    table.columns.forEach(function (column) {
        switch (column.type) {
            case 'reference': {
                code.addln("[int]$" + column.name + "_id");
                break;
            }
            case 'date': {
                code.addln("[nullable[DateTime]]$" + column.name);
                break;
            }
            case 'boolean': {
                code.addln("[bool]$" + column.name);
                break;
            }
            case 'serial': {
                code.addln("[int]$id");
                break;
            }
            case 'number': {
                code.addln("[nullable[int]]$" + column.name);
                break;
            }
            case 'string': {
                code.addln("[string]$" + column.name);
                break;
            }
            case 'uuid': {
                code.addln("[string]$" + column.name);
                break;
            }
            default: {
                code.addln("[" + column.type + "]$" + column.name);
            }
        }
    });
    code.unindent().addln('}');
    return code;
}
exports.generateModelClass = generateModelClass;
//# sourceMappingURL=generate-powershell.js.map