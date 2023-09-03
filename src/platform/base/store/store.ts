// import Store from 'electron-store'
import { ipcClient } from '../../ipc/handlers/ipc.handler'
import { appDataPath } from '../paths'
import { LocalEvents, renderEvents } from '../../ipc/events/ipc.events'
import { StoreProcessor, storeOptions } from './store_private'

export class ClientStore {
    static stores: Map<string, StoreProcessor> = new Map<string, StoreProcessor>()
    static cwd: string
    static renderStore: StoreProcessor

    constructor(options?: { client?: boolean; cwd?: string }) {
        ClientStore.cwd = options?.cwd ? options.cwd : appDataPath + '/store'
        if (options?.client) {
            if (!ClientStore.renderStore) {
                ClientStore.renderStore = new StoreProcessor({
                    name: 'render',
                })
            }
            this.initBind()
        }
    }

    static set(storeName: string, key: string, content: any): boolean {
        let store = ClientStore.stores.get(storeName)
        if (store) {
            store.set(key, content)
            return true
        } else {
            return false
        }
    }

    static get(storeName: string, key: string): any {
        let store = ClientStore.stores.get(storeName)
        if (store) {
            return store.get(key)
        } else {
            return false
        }
    }

    static del(storeName: string, key: string) {
        let store = ClientStore.stores.get(storeName)
        if (store) {
            store.del(key)
            return true
        } else {
            return false
        }
    }

    // static has(storeName: string, key: string): boolean {
    //     let store = ClientStore.stores.get(storeName)
    //     if (store) {
    //         return store.has(key)
    //     } else {
    //         return false
    //     }
    // }

    static create(options: storeOptions) {
        let result = ClientStore.stores.get(options.name)
        if (!result) {
            let store = new StoreProcessor({ ...options })
            ClientStore.stores.set(options.name, store)
            return store
        } else {
            return result
        }
    }

    private initBind() {
        ipcClient.handleRender(renderEvents.storeEvents.store, (event, purpose: string, key: string, value?: any) => {
            let result: any = undefined
            switch (purpose) {
                case 'set':
                    {
                        ClientStore.renderStore.set(key, value)
                        result = true
                    }
                    break
                case 'get':
                    result = ClientStore.renderStore.get(key)
                    break
                case 'del':
                    {
                        ClientStore.renderStore.del(key)
                        result = true
                    }
                    break
                default:
                    break
            }
            return result
        })
    }
}

// export class StorePrivate {
//     static store: Store

//     constructor(options: storeOptions) {
//         StorePrivate.store = new Store({...options, cwd: appDataPath + '/store'})
//     }

//     static set(key: string, content: any): boolean {
//         StorePrivate.store.set(key, content)
//         return true
//     }

//     static get(key: string): any {
//         return StorePrivate.store.get(key)
//     }

//     static del(key: string) {
//         StorePrivate.store.delete(key)
//         return true
//     }

//     static has(key: string): boolean {
//         return StorePrivate.store.has(key)
//     }
// }

export class RunningRecord {
    static moduleNum = 5
    static startedServices: Map<string, string> = new Map()

    static completeLoading(module: string) {
        RunningRecord.startedServices.set(module, module)
        if (module == 'extension') ipcClient.emitLocal(LocalEvents.innerEvents.loadedExtension)
        if (RunningRecord.startedServices.size >= RunningRecord.moduleNum) {
            ipcClient.emitLocal(LocalEvents.innerEvents.completeLoading)
            ipcClient.emitToRender('clientLoaded')
        }
    }

    static completeClose(module: string) {
        RunningRecord.startedServices.delete(module)
        if (module == 'extension') ipcClient.emitLocal(LocalEvents.innerEvents.extensionClosed)
        if (RunningRecord.startedServices.size == 1) {
            ipcClient.emitLocal(LocalEvents.innerEvents.completeClose)
        }
    }
}
