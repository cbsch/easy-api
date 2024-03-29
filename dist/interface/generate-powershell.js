"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModelClass = exports.generateEndpointClass = exports.generateFunction = void 0;
var fs_1 = require("fs");
var codebuilder_1 = require("./codebuilder");
function generateCode(models, path, requestFnName, cmdletPrefix) {
    var code = (0, codebuilder_1.default)();
    requestFnName = requestFnName ? requestFnName : "Invoke-Request";
    cmdletPrefix = cmdletPrefix ? cmdletPrefix : "GEN";
    models.forEach(function (model) {
        code.addcontainer(generateFunction(model.definition, requestFnName, cmdletPrefix));
    });
    models.forEach(function (model) {
        code.addcontainer(generateEndpointClass(model.definition, requestFnName));
    });
    models.forEach(function (model) {
        code.addcontainer(generateModelClass(model.definition));
    });
    code.addln('class Api {').indent();
    models.map(function (model) {
        var name = model.definition.name;
        code.addln("[".concat(name, "_endpoint]$").concat(name, " = (New-Object ").concat(name, "_endpoint)"));
    });
    code.unindent().addln('}').addln('');
    code.addln('Function Get-TenantPortalApiEndpoint {').indent();
    code.addln('return [Api]::new()');
    code.unindent().addln('}');
    (0, fs_1.writeFileSync)(path, code.get());
}
exports.default = generateCode;
function generateFunction(table, requestFnName, cmdletPrefix) {
    var code = (0, codebuilder_1.default)();
    var name = table.name;
    var prettyName = table.prettyName ? table.prettyName : table.name;
    code.addln("Function Get-".concat(cmdletPrefix).concat(prettyName, " {")).indent();
    code.addln("[OutputType([".concat(name, "])]"));
    code.addln("Param(").indent();
    code.addln("[Parameter()][int]$Id,");
    code.addln("[Parameter()][string]$Query").unindent();
    code.addln(")");
    code.addln("$path = \"/api/".concat(name, "\""));
    code.addln("if ($Id) { $Query = \"?filters=id=$Id\" }");
    code.addln("if ($Query) { $path += $Query }");
    code.addln("return ".concat(requestFnName, " -Path $Path")).unindent();
    code.addln("}");
    code.addln('');
    code.addln("Function New-".concat(cmdletPrefix).concat(prettyName, " {")).indent();
    code.addln("[OutputType([".concat(name, "])]"));
    code.addln("Param(").indent();
    code.addln("[Parameter()][PSObject]$Object").unindent();
    code.addln(")");
    code.addln("return ".concat(requestFnName, " -Path \"/api/").concat(name, "\" -Method POST -Body $Object")).unindent();
    code.addln("}");
    code.addln('');
    code.addln("Function Set-".concat(cmdletPrefix).concat(prettyName, " {")).indent();
    code.addln("[OutputType([".concat(name, "])]"));
    code.addln("Param(").indent();
    code.addln("[Parameter()][PSObject]$Object").unindent();
    code.addln(")");
    code.addln("return ".concat(requestFnName, " -Path \"/api/").concat(name, "\" -Method PUT -Body $Object")).unindent();
    code.addln("}");
    code.addln('');
    code.addln("Function Remove-".concat(cmdletPrefix).concat(prettyName, " {")).indent();
    code.addln("[OutputType([".concat(name, "])]"));
    code.addln("Param(").indent();
    code.addln("[Parameter()][PSObject]$Object").unindent();
    code.addln(")");
    code.addln("return ".concat(requestFnName, " -Path \"/api/").concat(name, "\" -Method DELETE -Body $Object")).unindent();
    code.addln("}");
    code.addln('');
    return code;
}
exports.generateFunction = generateFunction;
function generateEndpointClass(table, requestFnName) {
    var code = (0, codebuilder_1.default)();
    var name = table.name;
    code.addln("class ".concat(table.name, "_endpoint {")).indent();
    code.addln("[PSObject]getById([int]$Id) {").indent();
    code.addln("return ".concat(requestFnName, " -Path \"/api/").concat(name, "?filters=id=$Id\""));
    code.unindent().addln('}');
    code.addln("[PSObject[]]get() {").indent();
    code.addln("return $this.get(\"\")");
    code.unindent().addln('}');
    code.addln("[PSObject[]]get([string]$Query) {").indent();
    code.addln("return ".concat(requestFnName, " -Path \"/api/").concat(name, "$Query\""));
    code.unindent().addln('}');
    code.addln("[PSObject]put([".concat(name, "]$").concat(name, ") {")).indent();
    code.addln("return ".concat(requestFnName, " -Path \"/api/").concat(name, "\" -Method PUT -Body $").concat(name));
    code.unindent().addln('}');
    code.addln("[PSObject]post([".concat(name, "]$").concat(name, ") {")).indent();
    code.addln("return ".concat(requestFnName, " -Path \"/api/").concat(name, "\" -Method POST -Body $").concat(name));
    code.unindent().addln('}');
    code.addln("[PSObject]delete([".concat(name, "]$").concat(name, ") {")).indent();
    code.addln("return ".concat(requestFnName, " -Path \"/api/").concat(name, "\" -Method DELETE -Body $").concat(name));
    code.unindent().addln('}');
    code.unindent().addln("}");
    return code;
}
exports.generateEndpointClass = generateEndpointClass;
function generateModelClass(table) {
    var code = (0, codebuilder_1.default)();
    code.addln("class ".concat(table.name, " {")).indent();
    table.columns.forEach(function (column) {
        switch (column.type) {
            case 'reference': {
                code.addln("[int]$".concat(column.name, "_id"));
                break;
            }
            case 'date': {
                code.addln("[nullable[DateTime]]$".concat(column.name));
                break;
            }
            case 'boolean': {
                code.addln("[bool]$".concat(column.name));
                break;
            }
            case 'serial': {
                code.addln("[int]$id");
                break;
            }
            case 'number': {
                code.addln("[nullable[int]]$".concat(column.name));
                break;
            }
            case 'string': {
                code.addln("[string]$".concat(column.name));
                break;
            }
            case 'uuid': {
                code.addln("[string]$".concat(column.name));
                break;
            }
            default: {
                code.addln("[".concat(column.type, "]$").concat(column.name));
            }
        }
    });
    code.unindent().addln('}');
    return code;
}
exports.generateModelClass = generateModelClass;
//# sourceMappingURL=generate-powershell.js.map