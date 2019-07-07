import {
    login,
    audit,
    complex,
} from './interfaces'
import generateApi, { ApiOptions } from './generated-api-lib'

export default (options?: ApiOptions) => {
    return {
        login: generateApi<login>('login', options),
        audit: generateApi<audit>('audit', options),
        complex: generateApi<complex>('complex', options),
    }
}
