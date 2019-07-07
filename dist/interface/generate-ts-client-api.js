"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var generate_typescript_1 = require("./generate-typescript");
var path_1 = require("path");
function writeCodeFile(models, path) {
    var interfacePath = path_1.join(path, 'interfaces.ts');
    fs_1.writeFileSync(interfacePath, generate_typescript_1.generateCode(models));
}
exports.default = writeCodeFile;
//# sourceMappingURL=generate-ts-client-api.js.map