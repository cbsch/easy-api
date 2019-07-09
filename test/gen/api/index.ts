import {
    login,
    audit,
    complex,
} from './model-interfaces'
import {
    loginQueryBuilder,
    auditQueryBuilder,
    complexQueryBuilder,
} from './query-interfaces'
import generateApi, { ApiOptions } from './generated-api-lib'

export default (options?: ApiOptions) => {
    return {
        login: generateApi<login, loginQueryBuilder<login>>('login', options),
        audit: generateApi<audit, auditQueryBuilder<audit>>('audit', options),
        complex: generateApi<complex, complexQueryBuilder<complex>>('complex', options),
    }
}
