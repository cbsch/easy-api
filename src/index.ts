import { Table, GeneratedModel, SelectArgs}  from './interfaces'
import model, { emitter, modelWrapper } from './model'
import routeFactory, { useRoutes } from './routes'

import generateCode from './interface'

export default modelWrapper
export { model, emitter, routeFactory, useRoutes, generateCode }
// interfaces
export { Table, GeneratedModel, SelectArgs }
