/*
 * @Author: wangqi2002 1722009706@qq.com
 * @Date: 2023-09-03 23:12:17
 * @LastEditors: wangqi2002 1722009706@qq.com
 * @LastEditTime: 2023-12-26 17:24:40
 * @FilePath: \ishow\src\plugins\ua.client\ua.servant\controllers\db.controller.ts
 * @Description: 
 * 
 */
import { IRouterParamContext } from 'koa-router'
import { Next, ParameterizedContext } from 'koa'
import { DbService } from '../services/db.service'
import { ResponseModel } from '../models/response.model'
import { TableCreateModes } from '../../common/ua.enums'
import 'koa-body/lib/index'
import { CommunicateUtil } from '../utils/util'
import { Config } from '../../config/config.default'
import { UaMessage } from '../models/message.model'

export module DbController {
    export async function connectDb(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            let tableList = await DbService.connectDb()
            ctx.body = new ResponseModel(tableList)
        } catch (e: any) {
            throw e
        }
    }
    export async function init(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            let { createMode, tags, tableName } = ctx.request.body
            DbService.init(createMode, tags, tableName)
            ctx.body = new ResponseModel(TableCreateModes[createMode])
        } catch (e: any) {
            throw e
        }
    }

    export async function changeModle(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            CommunicateUtil.events.removeAllListeners('pipe:' + Config.defaultPipeName + '.pushed')
            let { tableName } = ctx.request.body
            DbService.changeModle(tableName)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function insert(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            DbService.insert(ctx.request.body)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function insertMany(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            DbService.insertMany(ctx.request.body)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function createTable(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            DbService.createTable(ctx.request.body['tableName'], ctx.request.body['fieldNames'])
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function resume(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            let { memoryCycle } = ctx.request.body
            //TODO 重启事件监听
            let startTime = Date.now()
            CommunicateUtil.events.on('pipe:' + Config.defaultPipeName + '.pushed', (data: UaMessage) => {
                // console.log('++++++',data)
                if (Date.now() - startTime >= memoryCycle) {
                    startTime = Date.now()
                    DbService.storeTemp(data, true)
                } else {
                    DbService.storeTemp(data, false)
                }
            })
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function stopInsert(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            //TODO 终止事件监听
            CommunicateUtil.events.removeAllListeners('pipe:' + Config.defaultPipeName + '.pushed')
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }
}
