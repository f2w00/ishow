/*
 * @Author: wangqi2002 1722009706@qq.com
 * @Date: 2023-09-03 23:12:16
 * @LastEditors: wangqi2002 1722009706@qq.com
 * @LastEditTime: 2024-03-24 12:40:47
 * @FilePath: \ishow\src\platform\ipc\handlers\ipc.handler.ts
 * @Description: 
 * 
 */
import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, dialog } from 'electron'
import EventEmitter from 'events'
import fs from 'fs'

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

    static onFileDialog(options?: any) {
        console.log('[cs]')
        ipcMain.on('selectFile-host', (event) => {
            dialog.showOpenDialog({
                title: "测试",
                defaultPath: "D:/Code",
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
