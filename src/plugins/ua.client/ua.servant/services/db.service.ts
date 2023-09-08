const { Persistence } = require('ishow')
const { sharedData } = require('ishow')
import { TableCreateModes, UaErrors, UaSources } from '../../common/ua.enums'
import { Config } from '../../config/config.default'
import { CommunicateUtil, DbUtils } from '../utils/util'
import { DbHead, IDbData, IFieldNames } from '../models/params.model'
import { UaMessage } from '../models/message.model'
import { ClientError } from '../middlewares/agent.middleware'
// import { DataFrame, Series, concat, toJSON } from 'danfojs-node'

export module DbService {
    export let defaultTableName: string = Config.defaultTable
    export let defaultAttributes: any = Config.defaultAttributes
    export let persist!: any
    export let dbTemp: Map<string, any> = new Map()
    export let tags: DbHead[] = []
    export let mapCount = 0
    // export let dbTempFrame: DataFrame = new DataFrame()

    /**
     * @description 用于初始化database,如果表名不存在则创建一个新表
     * @param createMode
     * @param tableName
     * @param fields
     */
    export async function init(createMode: TableCreateModes, tags: DbHead[], tableName?: string, fields?: IFieldNames) {
        try {
            switch (createMode) {
                case TableCreateModes.default:
                case TableCreateModes.createPerWeek: {
                    defaultTableName = DbUtils.formatDateYMW(new Date())
                    break
                }
                case TableCreateModes.createPerDay: {
                    defaultTableName = DbUtils.formatDateYMD(new Date())
                    break
                }
                case TableCreateModes.createPerMonth: {
                    defaultTableName = DbUtils.formatDateYM(new Date())
                    break
                }
                case TableCreateModes.createPerYear: {
                    defaultTableName = DbUtils.formatDateY(new Date())
                    break
                }
                case TableCreateModes.customTableName: {
                    if (tableName) defaultTableName = tableName
                    break
                }
                // case TableCreateModes.customTableName:
                // case TableCreateModes.customField:
                // case TableCreateModes.customBoth: {
                //     if (tableName) defaultTableName = tableName
                //     if (fields) {
                //         defaultAttributes = Config.defaultAttributes
                //     }
                //     break
                // }
                default:
                    throw new ClientError(UaSources.dbService, UaErrors.errorTableMode)
            }
            let fieldSet: any = {}
            fieldSet['sourceTimestamp'] = {
                type: 'DataTypes.STRING',
                allowNull: false,
                field: 'sourceTimestamp',
            }
            tags.forEach((value) => {
                fieldSet[(value.nodeid + '##' + value.displayName).toLowerCase()] = {
                    type: 'DataTypes.STRING',
                    allowNull: true,
                    field: (value.nodeid + '##' + value.displayName).toLowerCase(),
                }
            })
            DbService.tags = tags
            DbService.createTable(defaultTableName, fieldSet)
            // 注意这里需要创建一个pipe然后再进行注册
            CommunicateUtil.emitToClient('Broker.create', [{ name: Config.defaultPipeName }])
            CommunicateUtil.emitToClient('pipe:' + Config.defaultPipeName + '.registerIpc', [
                { module: 'extensionProcess:uaclient' },
            ])
            CommunicateUtil.events.on('pipe:' + Config.defaultPipeName + '.pushed', (data: UaMessage) => {
                storeTemp(data)
            })
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorCreateClient, e.message, e.stack)
        }
    }

    export function storeTemp(data: any) {
        let messages = []
        messages = data instanceof Array ? data : (messages = [data])
        messages.forEach((message: IDbData) => {
            let nowTime = new Date(message.sourceTimestamp).toISOString()
            let dbData = DbService.dbTemp.get(nowTime)
            if (dbData) {
                dbData[(message.nodeId + '##' + message.displayName).toLowerCase()] = message.value
            } else {
                let tempString = `{"${(message.nodeId + '##' + message.displayName).toLowerCase()}":"${message.value}"}`
                DbService.dbTemp.set(nowTime, JSON.parse(tempString))
            }
        })
        DbService.mapCount = 0
        DbService.dbTemp.forEach((value) => {
            Object.keys(value).length == DbService.tags.length ? DbService.mapCount++ : undefined
        })
        if (DbService.mapCount > 20) {
            updateFrame()
        }
    }

    /**
     * @description 传入参数来插入数据,可以指定表名和字段名称
     * @param data
     */
    export function insert(data: IDbData) {
        try {
            let nowTime = new Date(data.sourceTimestamp).toISOString()
            let dbData = dbTemp.get(nowTime)
            if (dbData) {
                dbData[data.nodeId] = data.value
            } else {
                let tempString = `{"${data.nodeId}":"${data.value}"}`
                dbTemp.set(nowTime, JSON.parse(tempString))
            }
            updateFrame()
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorInsert, e.message, e.stack)
        }
    }

    /**
     * @description 连续写入多条数据
     * @param dataList
     */
    export function insertMany(dataList: IDbData[]) {
        try {
            dataList.forEach((data) => {
                let nowTime = new Date(data.sourceTimestamp).toISOString()
                let dbData = dbTemp.get(nowTime)
                if (dbData) {
                    dbData[data.nodeId] = data.value
                } else {
                    let tempString = `{"${data.nodeId}":"${data.value}"}`
                    dbTemp.set(nowTime, JSON.parse(tempString))
                }
            })
            updateFrame()
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorInsert, e.message, e.stack)
        }
    }

    /**
     * @description 用于创建一个表,可以定制表名和字段名,输入即可,但注意sqlite3表命名规范
     * @param tableName
     * @param attributes
     */
    export function createTable(tableName?: string, attributes?: any) {
        try {
            let table = tableName ? tableName : defaultTableName
            let attribute = attributes ? attributes : defaultAttributes
            let projectPath = sharedData.get('projectInfo')
            persist = new Persistence(
                attribute,
                { dialect: 'sqlite', storage: projectPath + '/database/data.db', logging: false },
                table
            )
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorCreatTable, e.message, e.stack)
        }
    }

    function updateFrame() {
        let tempArray = Array.from(DbService.dbTemp).sort()
        let result: any = []
        // let pointer = 0
        // let mode = true
        // for (let i = 0; i < tempArray.length; i++) {
        //     let tempLen = Object.keys(tempArray[i][1]).length
        //     if (tempLen != DbService.tags.length) {
        //         pointer = i
        //     }
        //     if (tempLen == DbService.tags.length || i == tempArray.length - 1) {
        //         if (Object.keys(tempArray[pointer][1]).length != DbService.tags.length) {
        //             while (pointer <= i) {
        //                 DbService.tags.forEach((value) => {
        //                     if (!tempArray[pointer][1][value.nodeid]) {
        //                         tempArray[pointer][1][value.nodeid] = mode
        //                             ? tempArray[i][1][value.nodeid]
        //                             : tempArray[pointer - 1][1][value.nodeid]
        //                     }
        //                 })
        //                 pointer++
        //             }
        //         }
        //         mode = false
        //     }
        // }
        tempArray.forEach((value) => {
            if (Object.keys(value[1]).length == DbService.tags.length) {
                result.push({ sourceTimestamp: value[0], ...value[1] })
            }
        })
        DbService.dbTemp.clear()
        persist.insertMany(result)
    }
}
// DbService.tags = [
//     { displayName: 'nice', nodeid: 'yes' },
//     { displayName: 'nice', nodeid: 'ye' },
// ]
// DbService.storeTemp([
//     {
//         nodeId: 'yes',
//         value: 'ok',
//         sourceTimestamp: '2023/12/29',
//         server: 'string',
//         displayName: 'string',
//         dataType: 'string',
//         statusCode: 'string',
//     },
//     {
//         nodeId: 'ye',
//         value: 'o',
//         sourceTimestamp: '2023/12/29',
//         server: 'string',
//         displayName: 'string',
//         dataType: 'string',
//         statusCode: 'string',
//     },
//     {
//         nodeId: 'yes',
//         value: '2',
//         sourceTimestamp: '2023/12/30',
//         server: 'string',
//         displayName: 'string',
//         dataType: 'string',
//         statusCode: 'string',
//     },
// ])
