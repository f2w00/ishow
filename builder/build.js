const config = {
    productName: 'ishow', // 应用程序名称
    appId: 'ishow.everything', // 应用程序唯一标识
    publish: false, // 是否发布到 GitHub 上
    asar: false, // 是否将应用程序打包为asar文件
    afterPack: async function delPacks(context) {
        const fs = require('fs')
        const localeDir = context.appOutDir + '/locales/'
        fs.readdir(localeDir, function (err, files) {
            if (!(files && files.length)) return
            for (let i = 0, len = files.length; i < len; i++) {
                const match = files[i].match(/zh-CN\.pak/) //只保留中文
                const match2 = files[i].match(/en-US\.pak/)
                if (match === null || match2 === null) {
                    fs.unlinkSync(localeDir + files[i])
                }
            }
        })
    },
    files: ['production', 'node_modules'], // 将要打包的文件或目录
    directories: {
        output: 'release', // 打包输出目录
        buildResources: 'builder', // 构建资源目录
    },
    win: {
        icon: './icons/icon.ico', // 可执行文件的图标
        target: 'nsis', // 打包的目标类型
        // requestedExecutionLevel: 'requireAdministrator', // 请求管理员权限时用的系统口令
        verifyUpdateCodeSignature: false, // 是否验证更新时的签名，默认为false
        signingHashAlgorithms: [
            // 当签署时，使用的摘要算法列表，支持 sha256 和 sha1。默认使用 sha256。
            'sha256',
            'sha1',
        ],
        rfc3161TimeStampServer: 'http://timestamp.digicert.com', // 向 RFC 3161 时间戳服务器注册时使用的 URL。默认情况下，不占用服务。
    },
    nsis: {
        oneClick: false, // 是否一键安装
        language: '2052', // 安装向导语言
        perMachine: false, // 是否在每台机器上安装，需要管理员权限
        createDesktopShortcut: true, // 是否在桌面上创建快捷方式
        createStartMenuShortcut: false, // 是否在开始菜单上创建快捷方式
        guid: 'ishow', // 安装程序的 GUID
        shortcutName: 'ishow', // 创建快捷方式的名称
        artifactName: 'ishow-win32-${version}-installer.${ext}', // 生成安装文件时的文件名
        allowToChangeInstallationDirectory: true,
        installerIcon: 'icons/icon.ico',
        uninstallerIcon: 'icons/icon.ico',
        menuCategory: 'ishow',
    },
}

const builder = require('electron-builder')
builder.build({
    targets: builder.Platform.WINDOWS.createTarget(),
    config: config,
})
