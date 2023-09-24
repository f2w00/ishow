import { IProject, ProjectManagerFactory } from '../../platform/base/project/project'
import { ClientStore, RunningRecord } from '../../platform/base/store/store.js'
import { sharedData } from '../../platform/base/store/store_private'
import { ipcClient } from '../../platform/ipc/handlers/ipc.handler.js'
import { FileUtils } from '../../platform/base/utils/utils.js'
import { LocalEvents, renderEvents } from '../../platform/ipc/events/ipc.events'
import { appDataPath } from '../../platform/base/paths'

enum storeNames {
    workspaceManager = 'recentManagers',
    currentManager = 'currentManager',
    projectExtend = 'projectExtend',
    moduleStoreName = 'workspace',
}

export type workspaceAttribute = {
    workspaceName: string
    storagePath: string
}

export interface IWorkspaceManager {
    workspace: workspaceAttribute
    folders: string[]
    onStart: string | null
}

export interface IGlobalWorkSpaceInfo {
    workspaces: IWorkspaceManager[]
    currentManager: IWorkspaceManager
    projectExtend: string[]
}

export interface IClientInfo {
    currentProject?: IProject | null
    currentWorkspace: workspaceAttribute
    recentWorkspaces: workspaceAttribute[]
}

export class WorkspaceManager implements IWorkspaceManager {
    workspace: workspaceAttribute
    folders: string[]
    onStart: string | null
    loadedProjects: Map<string, IProject>

    constructor(ws: IWorkspaceManager) {
        this.workspace = ws.workspace
        this.loadedProjects = new Map<string, IProject>()
        this.folders = ws.folders
        this.onStart = ws.onStart
        this.initBind()
        this.toStart()
    }

    initBind() {
        ipcClient.handleRender(renderEvents.workspaceEvents.projectLoad, (event, projectName, fileName: string) => {
            console.log(fileName)
            if (this.loadedProjects.has(projectName)) {
                return this.loadedProjects.get(projectName)
            }
            return this.loadProject(fileName)
        })
        ipcClient.handleRender(
            renderEvents.workspaceEvents.projectCreate,
            (event, projectName: string, projectType: string) => {
                return this.createProject(projectName, projectType)
            }
        )
        ipcClient.handleRender(renderEvents.benchEvents.clientInfo, (_, ...args) => {
            return {
                currentProject: ProjectManagerFactory.currentProject,
                currentWorkspace: this.workspace,
                recentWorkspaces: GlobalWorkspaceManager.recent,
            }
        })
    }

    toStart() {
        if (this.onStart && this.onStart.length > 0 && !this.loadedProjects.has(this.onStart)) {
            ipcClient.emitLocal(LocalEvents.innerEvents.loadProject, this.workspace.storagePath + '/' + this.onStart)
            this.loadProject(this.workspace.storagePath + '/' + this.onStart)
        }
        sharedData.set('appDataPath', appDataPath)
        RunningRecord.completeLoading('workspace')
    }

    createProject(projectName: string, projectType: string) {
        let fileName = this.workspace.storagePath + `\\${projectName}` + `\\.${projectType}`
        ProjectManagerFactory.createProject(fileName, {
            workspace: {
                workspaceName: this.workspace.workspaceName,
                storagePath: this.workspace.storagePath,
            },
            storagePath: fileName,
            projectName: projectName + `.${projectType}`,
            projectType: projectType,
        })
        return this.loadProject(this.workspace.storagePath + `\\${projectName}` + `\\.${projectType}`)
    }

    deleteProject() {}

    loadProject(fileName: string) {
        GlobalWorkspaceManager.projectExtend.forEach((projectType: string) => {
            if (fileName.endsWith(projectType)) {
                ipcClient.emitToRender('project:activate.' + projectType)
                ipcClient.emitLocal('project:activate.' + projectType)
            }
        })
        let project: IProject = require(fileName + '/.project/project.json')
        let project2 = sharedData.get('projectInfo')
        ProjectManagerFactory.produceProjectManager(project)
        sharedData.set(
            'projectInfo',
            project ? project : project2 ? project2 : this.workspace.storagePath + '/your_project'
        )
        return {
            project: ProjectManagerFactory.currentProject,
            subFiles: FileUtils.openFolder(fileName),
        }
    }
}

export class GlobalWorkspaceManager {
    static recent: Map<string, IWorkspaceManager>
    static currentManager: IWorkspaceManager
    static projectExtend: string[]

    constructor() {
        GlobalWorkspaceManager.recent = new Map()
        GlobalWorkspaceManager.projectExtend = []
        ClientStore.create({
            name: storeNames.moduleStoreName,
        })
        this.initBind()
        GlobalWorkspaceManager.loadWorkspace()
    }

    initBind() {
        ipcClient.handleRender(renderEvents.workspaceEvents.openFolder, (_, fileName: string) => {
            let files = FileUtils.openFolder(fileName)
            if (files.includes('.project')) {
                ipcClient.emitLocal(renderEvents.workspaceEvents.projectLoad, fileName, files)
            }
            return FileUtils.detectFile(files, fileName)
        })
        ipcClient.handleRender(renderEvents.workspaceEvents.load, (_, workspace: workspaceAttribute) => {
            GlobalWorkspaceManager.loadWorkspace(workspace)
            let recent: workspaceAttribute[] = []
            GlobalWorkspaceManager.recent.forEach((value) => {
                recent.push(value.workspace)
            })
            let info: IClientInfo = {
                currentWorkspace: GlobalWorkspaceManager.currentManager.workspace,
                recentWorkspaces: recent,
                currentProject: null,
            }
            return info
        })
    }

    static loadWorkspace(workspace?: workspaceAttribute) {
        if (workspace) {
            let current: IWorkspaceManager = {
                workspace: {
                    workspaceName: workspace.workspaceName,
                    storagePath: workspace.storagePath,
                },
                folders: FileUtils.getSubfolders(workspace.storagePath),
                onStart: null,
            }
            GlobalWorkspaceManager.recent.set(workspace.workspaceName, current)
            GlobalWorkspaceManager.currentManager = new WorkspaceManager(current)
        } else {
            let recent: IWorkspaceManager[] = ClientStore.get(storeNames.moduleStoreName, storeNames.workspaceManager)
            let current: IWorkspaceManager = ClientStore.get(storeNames.moduleStoreName, storeNames.currentManager)
            GlobalWorkspaceManager.projectExtend = ClientStore.get(storeNames.moduleStoreName, storeNames.projectExtend)
            if (current) {
                GlobalWorkspaceManager.currentManager = new WorkspaceManager(current)
                sharedData.set('currentWorkspace', current.workspace.storagePath)
                // sharedData.set('projectInfo', current.workspace.storagePath + '/your_project')
            }
            if (recent) {
                recent.forEach((value) => {
                    GlobalWorkspaceManager.recent.set(value.workspace.workspaceName, value)
                })
            }
        }
    }

    // createDirAsWorkspace(dirPath: string, workspaceName: string) {
    //     if (!this.workspaces.has(workspaceName)) {
    //         mkdir(dirPath + `//${workspaceName}`, () => {
    //             mkdir(dirPath + '//.ws', () => {
    //             })
    //         })
    //         let w = {
    //             workspace: {
    //                 workspaceName: workspaceName,
    //                 storagePath: dirPath + workspaceName,
    //             },
    //             projects: [],
    //             onStart: null,
    //         }
    //         this.workspaces.set(workspaceName, w)
    //         GlobalFIleManager.currentManager = new WorkspaceManager(w)
    //     }
    // }

    // switchWorkspace(workspaceName:string, folderPath:string) {
    //     GlobalWorkspaceManager.loadWorkspace(workspaceName, folderPath)
    // }

    static addProjectExtend(projects: string[]) {
        GlobalWorkspaceManager.projectExtend.push(...projects)
    }

    static getProjectExtend() {
        return GlobalWorkspaceManager.projectExtend
    }

    static getCurrentWSNames() {
        return GlobalWorkspaceManager.currentManager.workspace
    }

    static changeWorkspace() {}

    static updateStore() {
        ClientStore.set(storeNames.moduleStoreName, 'recentManagers', [...GlobalWorkspaceManager.recent.values()])
        ClientStore.set(storeNames.moduleStoreName, 'currentManager', {
            workspace: GlobalWorkspaceManager.currentManager.workspace,
            folders: GlobalWorkspaceManager.currentManager.folders,
            onStart: GlobalWorkspaceManager.currentManager.onStart,
        })
    }

    static beforeClose() {
        GlobalWorkspaceManager.updateStore()
        RunningRecord.completeClose('workspace')
    }
}
