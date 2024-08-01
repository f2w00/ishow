/*
 * @Author: wangqi2002 1722009706@qq.com
 * @Date: 2023-09-03 23:12:16
 * @LastEditors: wangqi2002 1722009706@qq.com
 * @LastEditTime: 2024-03-25 19:51:51
 * @FilePath: \ishow\src\platform\ipc\handlers\ipc.handler.ts
 * @Description: 
 * 
 */
import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, dialog } from 'electron'
import EventEmitter from 'events'
import fs from 'fs'
import { encStr, decryptStr, getMac } from '../../base/utils/aes_ecb.js'
import { get } from 'http'
import { Json } from 'sequelize/types/utils.js'

export class ipcClient {
    static localEvents: EventEmitter = new EventEmitter()
    static clientEvents: EventEmitter = new EventEmitter()

    static onRender(event: string, eventHandler: (event: IpcMainEvent, ...args: any[]) => void) {
        ipcMain.on(event, eventHandler)
    }

    static onceRender(event: string, eventHandler: (event: IpcMainEvent, ...args: any[]) => void) {
        ipcMain.once(event, eventHandler)
    }

    static handleRender(event: string, eventHandler: (event: IpcMainInvokeEvent, ...args: any[]) => void) {
        ipcMain.handle(event, eventHandler)
    }

    // todo: 文件默认路径选择
    static onFileDialog(options?: any) {
        ipcMain.on('selectFile-host', (event) => {
            dialog.showOpenDialog({
                title: "测试",
                defaultPath: "D:/",
                properties: ['openFile', 'dontAddToRecent']
            }).then(result => {
                fs.readFile(result.filePaths[0], { encoding: 'utf-8' }, (err: any, res: any) => {
                    if (err) {
                        console.log(err)
                    } else {
                        event.sender.send('selectFile-render', res)
                    }
                })
            }).catch(err => {
                console.log(err)
            })
        })
    }


    // 预激活码获取
    static getPreCode(options?: any) {
        ipcMain.on('get-pre-code', (event) => {
            let clientId = getMac();
            let str_enc = encStr(JSON.stringify(clientId));
            event.reply("get_pre_code_result", str_enc);
            // ipcClient.clientEvents.emit("get_pre_code_result", str_enc)
        })
    }

    // 激活
    static activateRender(options?: any) {
        ipcMain.on('activation-code', (event, arg) => {
            try {
                let str_dec = decryptStr(arg);
                let obj = JSON.parse(str_dec)
                if (obj.isActivate) {
                    event.reply("activation_result", true);
                } else {
                    event.reply("error_msg", "激活码无效！");
                }
                // event.reply("activation_result", true);
            } catch (e) {
                event.reply("error_msg", "激活码无效！");
            }
        })
    }

    /**
     * @description 通过mainwindow进行广播,并且发送消息到mainwindow.webContents
     * @param event
     * @param args
     */
    static emitToRender(event: string, ...args: any[]) {
        // ipcClient.currentWindow(event, ...args)
        // ipcMain.emit(event, ...args)
        ipcClient.localEvents.emit('emitToRender', event, ...args)
    }

    // static registerToEmitLocal(event: string, eventHandler: (subEvent: string, ...args: any[]) => void) {
    //     ipcClient.localEvents.on(event, eventHandler)
    // }

    static emitLocal(event: string, ...args: any[]) {
        ipcClient.localEvents.emit(event, ...args)
    }

    static onLocal(event: string, handler: (...args: any[]) => void) {
        ipcClient.localEvents.on(event, handler)
    }

    static onceLocal(event: string, handler: (...args: any[]) => void) {
        ipcClient.localEvents.once(event, handler)
    }

    static onClient(event: string, handler: (...args: any[]) => void) {
        ipcClient.clientEvents.on(event, handler)
    }

    static emitClient(event: string, ...args: any[]) {
        ipcClient.clientEvents.emit(event, ...args)
    }

    static emitToChild(event: string, module: string, arg: any) {
        ipcClient.clientEvents.emit('sendToIpc', 'extensionProcess:' + module, { event: event, message: arg })
    }
}
