import { Table, GeneratedModel, SelectArgs } from './interfaces';
import model, { emitter, modelWrapper } from './model';
import routeFactory, { useRoutes } from './routes';
import createSocketServer from './socket';
import generateCode, { generatePowershell } from './integration';
export default modelWrapper;
export { model, emitter, routeFactory, useRoutes, generateCode, generatePowershell, createSocketServer };
export { Table, GeneratedModel, SelectArgs };
