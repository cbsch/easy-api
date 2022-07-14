import {
    login,
    audit,
    complex,
} from './model-interfaces'
import {
    LoginQueryBuilder,
    AuditQueryBuilder,
    ComplexQueryBuilder,
} from './query-interfaces'
import generateApi, { ApiOptions } from './generated-api-lib'

export default (options?: ApiOptions) => {
    return {
        login: generateApi<login, LoginQueryBuilder<login>>('login', options),
        audit: generateApi<audit, AuditQueryBuilder<audit>>('audit', options),
        complex: generateApi<complex, ComplexQueryBuilder<complex>>('complex', options),
    }
}

import generateSocketApi, { WSApiOptions } from './generated-ws-api-lib'

export const socketApi = (options?: WSApiOptions) => {
    return {
        login: generateSocketApi<login, LoginQueryBuilder<login>>('login', options),
        audit: generateSocketApi<audit, AuditQueryBuilder<audit>>('audit', options),
        complex: generateSocketApi<complex, ComplexQueryBuilder<complex>>('complex', options),
    }
}
