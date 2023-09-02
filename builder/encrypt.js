const {compileFile} = require('bytenode')
const path = require('path')
const fs = require('fs')

let father = path.resolve(__dirname, '..')

function encryptFile() {
    const {writeFileSync} = require('fs')
    compileFile({
        filename: __dirname + '/main.js',
        output: father + '/src/main.jsc',
        compileAsModule: true,
    })
    writeFileSync(father + '/src/starter.js', "require('bytenode');\nrequire('./main.jsc');")
}

encryptFile()
console.log('complete compile')

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath) {
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.warn(err)
        } else {
            //遍历读取到的文件列表
            files.forEach(function (filename) {
                //获取当前文件的绝对路径
                let filedir = path.join(filePath, filename)
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, function (eror, stats) {
                    if (eror) {
                        console.warn('获取文件stats失败')
                    } else {
                        let isFile = stats.isFile() //是文件
                        let isDir = stats.isDirectory() //是文件夹
                        if (isFile) {
                            console.log(filedir)
                        }
                        if (isDir) {
                            fileDisplay(filedir) //递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            })
        }
    })
}
