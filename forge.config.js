module.exports = {
    packagerConfig: {
        name: 'ishow',
        executableName: 'ishow',
        // extraResource: ['./assets/Readme.txt', './assets/img/a.png'], // 静态文件
        icon: './builder/icons/icon', // 不用加后缀，但是需要准备3个文件，win: icon.ico, mac: icon.icns, linux: icon.png，打包时自动识别，linux 在BrowserWindow构造参数中设置
        asar: false,
        dir: './src',
    },

    rebuildConfig: {},
    makers: [
        // {
        //     name: '@electron-forge/maker-squirrel',
        //     config: {
        //         // authors: 'f2w00',
        //         // iconUrl: './builder/icons/icon.ico',
        //         // setupIcon: './builder/icons/icon.ico',
        //         // certificateFile: './cert.pfx',
        //         // certificatePassword: 'this-is-a-secret',
        //     },
        // },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['win32'],
        },
        // {
        //     name: '@electron-forge/maker-deb',
        //     config: {},
        // },
        // {
        //     name: '@electron-forge/maker-rpm',
        //     config: {},
        // },
    ],
}
