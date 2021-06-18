"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var model_1 = require("./model");
exports.model = model_1.default;
exports.emitter = model_1.emitter;
var routes_1 = require("./routes");
exports.routeFactory = routes_1.default;
exports.useRoutes = routes_1.useRoutes;
var socket_1 = require("./socket");
exports.createSocketServer = socket_1.default;
var interface_1 = require("./interface");
exports.generateCode = interface_1.default;
exports.generatePowershell = interface_1.generatePowershell;
exports.default = model_1.modelWrapper;
//# sourceMappingURL=index.js.map