import model, { Table, emitter, GeneratedModel, SelectArgs, modelWrapper } from './model';
import routeFactory, { useRoutes } from './routes';
import generateCode from './interface';
export default modelWrapper;
export { model, emitter, routeFactory, useRoutes, generateCode };
export { Table, GeneratedModel, SelectArgs };
