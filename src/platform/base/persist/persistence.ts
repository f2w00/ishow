import { DataTypes as DT, FindOptions, ModelAttributes, ModelCtor, Options, Sequelize, WhereOptions } from 'sequelize'

/**
 * @description 用来完成基础数据库的增删改查的功能,当初始化的时候必须指定modelAttributes即数据库模型数据,
 * 当不指定options时,那么默认以sqlite初始化
 */
export class Persistence {
    private sequelize: Sequelize
    private currentModel: any

    // constructor(attributes: ModelAttributes, options: Options, tableName?: string) {
    //     try {
    //         this.sequelize = new Sequelize(options)
    //         this.initDataModel(attributes, tableName)
    //     } catch (e: any) {
    //         throw e
    //     }
    // }
    constructor(options: Options) {
        try {
            this.sequelize = new Sequelize(options)
        } catch (e: any) {
            throw e
        }
    }

    async getAlltable() {
        let alltable = await this.sequelize.showAllSchemas({ logging: false });
        return { tables: alltable }
    }

    /**
     * @param record
     * @example
     */
    async insert(record: any) {
        try {
            await this.currentModel.create({ ...record })
        } catch (e: any) {
            throw e
        }
    }

    async insertMany(records: any[], sync?: boolean) {
        try {
            console.log('per', records)
            if (sync) {
                await this.currentModel.bulkCreate(records)
                this.currentModel.sync()
            } else {
                await this.currentModel.bulkCreate(records)
            }
        } catch (e: any) {
            throw e
        }
    }

    async read(options: FindOptions) {
        return await this.currentModel.findAll(options)
    }

    async update(values: Object, where: WhereOptions) {
        try {
            await this.currentModel.update(values, {
                where: where,
            })
        } catch (e: any) {
            throw e
        }
    }

    /**
     *
     * @param options 选择参数
     * - `tableName?: string`
     * - `attributes?: ModelAttributes`
     * - `conf?: Options`
     */
    async configureDb(options: { tableName?: string; attributes?: ModelAttributes; conf?: Options }) {
        try {
            if (options.conf) {
                this.sequelize = new Sequelize(options.conf)
            }
            if (options.tableName && options.attributes) {
                this.initDataModel(options.attributes, options.tableName)
            }
        } catch (e: any) {
            throw e
        }
    }

    /**
     * @description 传入attributes来定义sequelize的数据模型,
     * 只需要指定形如"DataTypes.string"即可,函数中自动转换了type让其能过在sequelize中正常使用
     * @param {ModelAttributes} attributes
     * @param {string} tableName
     * @returns {Promise<void>}
     */
    async initDataModel(attributes: ModelAttributes, tableName: string) {
        try {
            tableName = tableName ? tableName : 'ishow'
            const DataTypes = DT
            for (let key in attributes) {
                // @ts-ignore
                if (typeof attributes[key].type == 'string') {
                    // @ts-ignore
                    attributes[key].type = eval(attributes[key].type)
                }
            }
            this.sequelize.authenticate()
            this.currentModel = this.sequelize.define(tableName, attributes, {
                timestamps: false,
                tableName: tableName,
                freezeTableName: true,
            })
            await this.currentModel.sync()
        } catch (e: any) {
            throw e
        }
    }

    async changeDataModel(tableName: string) {
        try {
            let attributes: any = {}
            const [results] = await this.sequelize.query(`PRAGMA table_info(${tableName})`)
            results.forEach((value: any) => {
                if (value.name != 'id' && value.name != 'sourceTimestamp') {
                    attributes[value.name] = {
                        type: 'DataTypes.STRING',
                        allowNull: true,
                        field: value.name,
                    }
                } else if (value.name == 'sourceTimestamp') {
                    attributes[value.name] = {
                        type: 'DataTypes.STRING',
                        allowNull: false,
                        field: value.name,
                    }
                }
            })
            const DataTypes = DT
            for (let key in attributes) {
                // @ts-ignore
                if (typeof attributes[key].type == 'string') {
                    // @ts-ignore
                    attributes[key].type = eval(attributes[key].type)
                }
            }
            this.currentModel = this.sequelize.define(tableName, attributes, {
                timestamps: false,
                tableName: tableName,
                freezeTableName: true,
            })
            await this.currentModel.sync()
            return attributes
        } catch (e: any) {
            throw e
        }
    }
    // getInfo() {
    //     try {
    //         return { sequelize: this.sequelize }
    //     } catch (e: any) {
    //         throw e
    //     }
    // }
}
