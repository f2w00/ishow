import {ChildProcess, fork, ForkOptions} from 'child_process'
import {ipcClient} from '../../platform/ipc/handlers/ipc.handler'
import {ErrorHandler} from '../error/error'
import {RunningRecord} from '../../platform/base/store/store'
import {LocalEvents} from '../../platform/ipc/events/ipc.events'

export type IpcCommunicateModel = {
    purpose: string
    event: string
    args?: any[]
    handler?: (...args: any[]) => void
}

export class ProcessManager {
    static processes: Map<string, ChildProcess>

    constructor() {
        ProcessManager.processes = new Map()
        ipcClient.onClient(LocalEvents.innerEvents.sendIpc, (module: string, message: any) => {
            ProcessManager.sendToProcess(module, message)
        })
        // ipcClient.onLocal('project:fileName', (fileName: string) => {
        //     ProcessManager.processes.forEach(value => {
        //         value.send({event: 'project:fileName', message: fileName})
        //     })
        // })
        RunningRecord.completeLoading('process')
    }

    /**
     * @description 创建一个子线程,指定path和moduleName,其中moduleName应当是一个工作的子进程所属模块
     * @param fileName
     * @param module
     * @param message
     * @param options
     */
    static async createChildProcess(fileName: string, module: string, message?: any, options?: ForkOptions) {
        let child = await fork(fileName, options)
        if (child.pid) {
            ProcessManager.bindEvent(child)
            ProcessManager.processes.set(module, child)
            if (message) child.send(message)
        }
        return child
    }

    static bindEvent(child: ChildProcess) {
        child.on('message', (message: IpcCommunicateModel) => {
            switch (message.purpose) {
                case 'sendToClient': {
                    message.args
                        ? ipcClient.emitClient(message.event, ...message.args)
                        : ipcClient.emitClient(message.event)
                    break
                }
                case 'addListenerToClient': {
                    if (message.handler) ipcClient.onClient(message.event, message.handler)
                    break
                }
            }
        })
        child.on('uncaughtException', ErrorHandler.currentHandler)
        child.on('unhandledRejection', ErrorHandler.rejectionHandler)
    }

    static killProcess(module: string) {
        let child = ProcessManager.processes.get(module)
        if (child) {
            child.kill()
        }
    }

    static sendToProcess(module: string, message: any) {
        let child = ProcessManager.processes.get(module)
        if (child) {
            child.send(message)
        }
    }

    static beforeClose() {
        ProcessManager.processes.forEach((process, module) => {
            if (module.startsWith('extensionProcess')) {
                process.send({event: 'extension:close'})
            } else {
                process.send('close')
                process.kill()
            }
        })
        RunningRecord.completeClose('process')
    }
}
