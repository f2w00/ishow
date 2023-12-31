const { Persistence } = require('ishow')
const { sharedData } = require('ishow')
import { TableCreateModes, UaErrors, UaSources } from '../../common/ua.enums'
import { Config } from '../../config/config.default'
import { CommunicateUtil, DbUtils } from '../utils/util'
import { DbHead, IDbData, IFieldNames } from '../models/params.model'
import { UaMessage } from '../models/message.model'
import { ClientError } from '../middlewares/agent.middleware'
import { SessionService } from './session.service'
import { SubscriptService } from './subscript.service'
import { commonEvent } from '../../event.bus'

export module DbService {
    export let defaultTableName: string = Config.defaultTable
    export let defaultAttributes: any = Config.defaultAttributes
    export let attributes: any
    export let persist!: any
    export let dbTemp: Map<string, any> = new Map()
    export let tags: DbHead[] = []
    export let tagList: any = []
    export let mapCount = 0

    /**
     * @description 用于连接db
     */
    export async function connectDb() {
        try {
            let projectPath = sharedData.get('projectInfo')
            if (!persist) {
                persist = new Persistence(
                    { dialect: 'sqlite', storage: projectPath + '/database/data.db', logging: false }
                )
            }
            let tableList = persist.getAlltable()
            return tableList
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorCreateClient, e.message, e.stack)
        }
    }

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
                default:
                    throw new ClientError(UaSources.dbService, UaErrors.errorTableMode)
            }
            let fieldSet: any = {}
            fieldSet['sourceTimestamp'] = {
                type: 'DataTypes.STRING',
                allowNull: false,
                field: 'sourceTimestamp',
            }
            DbService.tagList.length = 0
            tags.forEach((value) => {
                fieldSet[(value.nodeid + '##' + value.displayName).toLowerCase()] = {
                    type: 'DataTypes.STRING',
                    allowNull: true,
                    field: (value.nodeid + '##' + value.displayName).toLowerCase(),
                }
                DbService.tagList.push((value.nodeid + '##' + value.displayName).toLowerCase())
            })
            DbService.tags = tags
            DbService.createTable(defaultTableName, fieldSet)
            // 注意这里需要创建一个pipe然后再进行注册
            CommunicateUtil.emitToClient('Broker.create', [{ name: Config.defaultPipeName }])
            CommunicateUtil.emitToClient('pipe:' + Config.defaultPipeName + '.registerIpc', [
                { module: 'extensionProcess:uaclient' },
            ])
            let stamp = new Date().toLocaleString()
            let tempArray: any[] = []
            SubscriptService.staticValues.forEach((data) => {
                tempArray.push({
                    value: data.value,
                    sourceTimestamp: stamp,
                    displayName: data.displayName,
                    nodeId: data.nodeId,
                })
            })
            storeTemp(tempArray)
            commonEvent.on('main:uaclient.close', () => {
                updateFrame()
            })
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorCreateClient, e.message, e.stack)
        }
    }

    /**
     * @description 用于切换表模型
     * @param tableName
     */
    export async function changeModle(tableName?: string) {
        try {
            let fieldSet = await persist.changeDataModel(tableName)
            DbService.tagList.length = 0
            let newTags: any = []
            for (let key in fieldSet) {
                if (key != 'sourceTimestamp') {
                    DbService.tagList.push(key)
                    let temp = key.split('##')
                    newTags.push({
                        nodeid: temp[0],
                        displayName: temp[1]
                    })
                }
            }
            DbService.tags = newTags
            CommunicateUtil.emitToClient('Broker.create', [{ name: Config.defaultPipeName }])
            CommunicateUtil.emitToClient('pipe:' + Config.defaultPipeName + '.registerIpc', [
                { module: 'extensionProcess:uaclient' },
            ])
            let stamp = new Date().toLocaleString()
            let tempArray: any[] = []
            SubscriptService.staticValues.forEach((data) => {
                tempArray.push({
                    value: data.value,
                    sourceTimestamp: stamp,
                    displayName: data.displayName,
                    nodeId: data.nodeId,
                })
            })
            storeTemp(tempArray)
            commonEvent.on('main:uaclient.close', () => {
                updateFrame()
            })
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorCreateClient, e.message, e.stack)
        }
    }

    export function storeTemp(data: any, isStore: boolean = false) {
        //TODO 周期写入,
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
        // DbService.mapCount = 0
        // DbService.dbTemp.forEach((value) => {
        //     Object.keys(value).length == DbService.tags.length ? DbService.mapCount++ : undefined
        // })
        if (isStore) {
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
            persist.initDataModel(attribute, table)
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorCreatTable, e.message, e.stack)
        }
    }

    async function updateFrame() {
        //TODO 在这里取DbService.dbTemp的第一个
        let tempArray = Array.from(DbService.dbTemp).sort()
        // let tempArray = Array.from(DbService.dbTemp)
        let result: any = []
        try {
            tempArray.forEach((value) => {
                let temp: any = {}
                for (let i = 0; i < DbService.tagList.length; i++) {
                    if (DbService.tagList[i] in value[1]) {
                        temp[DbService.tagList[i]] = value[1][DbService.tagList[i]]
                    }
                }
                if (Object.keys(temp).length == DbService.tagList.length) {
                    result.push({ sourceTimestamp: value[0], ...temp })
                    throw new Error("exit foreach");
                }
                //TODO 只取所有数据都发过来的情况
                // if (Object.keys(value[1]).length == DbService.tags.length) {
                //     result.push({ sourceTimestamp: value[0], ...value[1] })
                //     throw new Error("exit foreach");
                // }
            })
        } catch (e) { }
        DbService.dbTemp.clear()
        await persist.insertMany(result)
    }
}