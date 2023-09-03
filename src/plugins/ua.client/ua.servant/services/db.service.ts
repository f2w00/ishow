const { Persistence } = require('D:\\works\\idea_projects\\ishow\\src\\platform\\ishow.js')
const { sharedData } = require('D:\\works\\idea_projects\\ishow\\src\\platform\\ishow.js')
import { TableCreateModes, UaErrors, UaSources } from '../../common/ua.enums'
import { Config } from '../../config/config.default'
import { CommunicateUtil, DbUtils } from '../utils/util'
import { IDbData, IFieldNames } from '../models/params.model'
import { UaMessage } from '../models/message.model'
import { ClientError } from '../middlewares/agent.middleware'
import { DataFrame, Series, concat, toJSON } from 'danfojs-node'

export module DbService {
    export let defaultTableName: string = Config.defaultTable
    export let defaultAttributes: any = Config.defaultAttributes
    export let persist!: any
    export let dbTemp: Map<string, any> = new Map()
    export let dbTempFrame: DataFrame = new DataFrame()

    /**
     * @description 用于初始化database,如果表名不存在则创建一个新表
     * @param createMode
     * @param tableName
     * @param fields
     */
    export async function init(createMode: TableCreateModes, tags: string[], tableName?: string, fields?: IFieldNames) {
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
                primaryKey: true,
            }
            tags.forEach((value) => {
                fieldSet[value] = {
                    type: 'DataTypes.STRING',
                    allowNull: true,
                    field: value,
                }
            })
            DbService.createTable(defaultTableName, fieldSet)
            // // 注意这里需要创建一个pipe然后再进行注册
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

    function storeTemp(data: IDbData) {
        let nowTime = new Date(data.sourceTimestamp).toISOString()
        let dbData = dbTemp.get(nowTime)
        if (dbData) {
            dbData[data.nodeId] = data.value
        } else {
            let tempString = `{"${data.nodeId}":"${data.value}"}`
            dbTemp.set(nowTime, JSON.parse(tempString))
        }
        if (dbTemp.size > 200) {
            updateFrame()
            frame2Db()
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
            frame2Db()
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
            frame2Db()
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
        DbService.dbTemp.forEach((value, key) => {
            let tempFrame = new DataFrame([{ ...value, sourceTimestamp: key }])
            DbService.dbTempFrame =
                DbService.dbTempFrame.index.length > 0
                    ? (concat({
                          dfList: [DbService.dbTempFrame, tempFrame],
                          axis: 0,
                      }) as DataFrame)
                    : tempFrame
        })
        DbService.dbTempFrame.setIndex({ column: 'sourceTimestamp', inplace: true })
        DbService.dbTempFrame.sortIndex({ inplace: true })
        DbService.dbTemp.clear()
    }

    function frame2Db() {
        DbService.dbTempFrame.fillNa('null')
        let data = toJSON(DbService.dbTempFrame)
        persist.insertMany(data)
        DbService.dbTempFrame.drop({ index: DbService.dbTempFrame.index, inplace: true })
    }
}

// DbService.init(0, ['yes', 'ye'])
// setTimeout(() => {
//     DbService.insertMany([
//         {
//             nodeId: 'yes',
//             value: 'ok',
//             sourceTimestamp: '2023/12/29',
//             server: 'string',
//             displayName: 'string',
//             dataType: 'string',
//             statusCode: 'string',
//         },
//         {
//             nodeId: 'ye',
//             value: 'ok',
//             sourceTimestamp: '2023/12/29',
//             server: 'string',
//             displayName: 'string',
//             dataType: 'string',
//             statusCode: 'string',
//         },
//         {
//             nodeId: 'yes',
//             value: 'ok',
//             sourceTimestamp: '2023/12/30',
//             server: 'string',
//             displayName: 'string',
//             dataType: 'string',
//             statusCode: 'string',
//         },
//         {
//             nodeId: 'ye',
//             value: 'ok',
//             sourceTimestamp: '2023/12/30',
//             server: 'string',
//             displayName: 'string',
//             dataType: 'string',
//             statusCode: 'string',
//         },
//     ])
// }, 2000)
