"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePowershellv2 = exports.generatePowershell = exports.generateCode = exports.useRoutes = exports.routeFactory = exports.model = exports.emitter = exports.createSocketServer = void 0;
var model_1 = require("./model");
exports.model = model_1.default;
Object.defineProperty(exports, "emitter", { enumerable: true, get: function () { return model_1.emitter; } });
var routes_1 = require("./routes");
exports.routeFactory = routes_1.default;
Object.defineProperty(exports, "useRoutes", { enumerable: true, get: function () { return routes_1.useRoutes; } });
var socket_1 = require("./socket");
exports.createSocketServer = socket_1.default;
var integration_1 = require("./integration");
exports.generateCode = integration_1.default;
Object.defineProperty(exports, "generatePowershell", { enumerable: true, get: function () { return integration_1.generatePowershell; } });
Object.defineProperty(exports, "generatePowershellv2", { enumerable: true, get: function () { return integration_1.generatePowershellv2; } });
exports.default = model_1.modelWrapper;
//# sourceMappingURL=index.js.map