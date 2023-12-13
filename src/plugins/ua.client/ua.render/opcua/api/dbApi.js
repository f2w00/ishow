import {
    request,
    post,
    get,
    put,
    deleteJson
} from '../utils/request.js'

/**
 * @params p 参数 
 */
let dbApi = {
    connect_db: (p) => get('/db/connect_db', p),
    init: (p) => post('/db/init', p),
    change_modle: (p) => post('/db/change_modle', p),
    insert: (p) => post('/db/insert', p),
    insert_many: (p) => post('/db/insert_many', p),
    create_table: (p) => post('/db/create_table', p),
    stop: (p) => post('/db/stop', p),
    resume: (p) => post('/db/resume', p),
}

export default dbApi
