const path = require('path')
const fse = require('fs-extra')

let files = [
    {
        s: '../src',
        e: '../production',
        ex: [String.raw`ua.client\common`, String.raw`ua.client\config`, String.raw`ua.client\ua.servant`],
    },
]

files.forEach((file) => {
    fse.copySync(path.join(__dirname, file.s), path.join(__dirname, file.e), {
        overwrite: true,
        filter: (src, dest) => {
            if (
                src.endsWith('.ts') ||
                src.endsWith('package-lock.json') ||
                src.endsWith('.txt') ||
                src.endsWith('.config.js') ||
                src.endsWith('tsconfig.json') ||
                /node_module/.test(src)
            ) {
                return false
            }
            if (file.ex) {
                for (let index = 0; index < file.ex.length; index++) {
                    if (src.includes(file.ex[index])) return false
                }
            }
            return true
        },
    })
})
