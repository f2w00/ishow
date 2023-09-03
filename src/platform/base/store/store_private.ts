import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { appDataPath } from '../paths'
const FileSync = require('lowdb/adapters/FileSync')
const Low = require('lowdb')

export type storeOptions = {
    name: string
    encrypt?: boolean
}

//@ts-ignore
export class StorePrivate {
    static store: any

    constructor(options: storeOptions) {
        if (!existsSync(appDataPath + '/store')) {
            mkdirSync(appDataPath + '/store', { recursive: true })
        }
        if (!existsSync(appDataPath + '/store/' + options.name + '.json')) {
            writeFileSync(appDataPath + '/store/' + options.name + '.json', '')
        }
        let adapter = new FileSync(appDataPath + '/store/' + options.name + '.json') // 申明一个适配器
        StorePrivate.store = new Low(adapter)
    }

    static set(key: string, content: any): boolean {
        StorePrivate.store.set(key, content).write()
        return true
    }

    static get(key: string): any {
        try {
            //@ts-ignore
            let result = StorePrivate.store.get(key).value()
            return result ? result : undefined
        } catch (e: any) {
            throw e
        }
    }

    static del(key: string) {
        //@ts-ignore
        StorePrivate.store.get(key).remove().write()
        return true
    }
}

export class StoreProcessor {
    store!: any

    constructor(options: storeOptions) {
        if (!existsSync(appDataPath + '/store')) {
            mkdirSync(appDataPath + '/store', { recursive: true })
        }
        if (!existsSync(appDataPath + '/store/' + options.name + '.json')) {
            writeFileSync(appDataPath + '/store/' + options.name + '.json', '')
        }
        let adapter = new FileSync(appDataPath + '/store/' + options.name + '.json') // 申明一个适配器
        this.store = new Low(adapter)
    }

    set(key: string, content: any): boolean {
        this.store.set(key, content).write()
        return true
    }

    get(key: string): any {
        try {
            let result = this.store.get(key).value()
            return result ? result : undefined
        } catch (e: any) {
            throw e
        }
    }

    del(key: string) {
        this.store.get(key).remove().write()
        return true
    }
}

export const sharedData = new StoreProcessor({ name: 'share' })
