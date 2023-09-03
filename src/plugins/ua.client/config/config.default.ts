import { MessageSecurityMode, SecurityPolicy } from 'node-opcua'
import { DbUtils } from '../ua.servant/utils/util.js'
import path from 'path'

export module Config {
    export let port = 3030

    export let mqLength = 200
    export let defaultTable = DbUtils.formatDateYMW(new Date())
    export let certRoot = path.join(__dirname, '..', '..', 'ua.client', 'certificates', 'PKI')

    export let defaultAttributes = {
        server: {
            type: 'DataTypes.STRING',
            allowNull: false,
            field: 'server',
        },
        nodeId: {
            type: 'DataTypes.STRING',
            allowNull: false,
            field: 'nodeId',
        },
        displayName: {
            type: 'DataTypes.STRING',
            allowNull: false,
            field: 'displayName',
        },
        value: {
            type: 'DataTypes.STRING',
            allowNull: false,
            field: 'value',
        },
        dataType: {
            type: 'DataTypes.STRING',
            allowNull: false,
            field: 'dataType',
        },
        sourceTimestamp: {
            type: 'DataTypes.STRING',
            allowNull: false,
            field: 'sourceTimestamp',
        },
        // serverTimestamp: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     field: 'serverTimestamp',
        // },
        statusCode: {
            type: 'DataTypes.STRING',
            allowNull: false,
            field: 'statusCode',
        },
    }

    export let defaultClient = {
        applicationName: 'NodeOPCUA-Client',
        connectionStrategy: {
            initialDelay: 1000,
            maxRetry: 10,
        },
        keepSessionAlive: true,
        securityMode: MessageSecurityMode.None,
        securityPolicy: SecurityPolicy.None,
        endpointMustExist: false,
        requestedSessionTimeout: 3600,
    }

    export let defaultSubscript = {
        requestedLifetimeCount: 2400,
        requestedPublishingInterval: 500,
        requestedMaxKeepAliveCount: 10,
        publishingEnabled: true,
        maxNotificationsPerPublish: 100,
        priority: 0,
    }

    export function createLogConfigure(path: string) {
        return {
            appenders: {
                client: {
                    type: 'file',
                    filename: path,
                    maxLogSize: 50000, //文件最大存储空间，当文件内容超过文件存储空间会自动生成一个文件test.log.1的序列自增长的文件
                },
            },
            categories: { default: { appenders: ['uaclient'], level: 'info' } },
        }
    }

    export let defaultPipeName = 'uaclient'

    export function beforeClose() {}
}
