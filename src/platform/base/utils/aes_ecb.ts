const CryptoJS = require("crypto-js");
const getMac = require('getmac').default;

let keystr: string = "ISHOW2SXXZIY4kBTJzlU";

// 字符串转hex
let string_to_hex = function (str: string): string {
    let tempstr: string = "";
    for (let i: number = 0; i < str.length; i++) {
        if (tempstr === "") tempstr = str.charCodeAt(i).toString(16);
        else tempstr += str.charCodeAt(i).toString(16);
    }
    return tempstr;
};

function encStr(src: string): string {
    let key: string = string_to_hex(keystr);

    key = CryptoJS.enc.Hex.parse(key);
    const enc = CryptoJS.AES.encrypt(src, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    return enc.ciphertext.toString();
}

function decryptStr(enced: string): string {
    let key: string = string_to_hex(keystr);

    key = CryptoJS.enc.Hex.parse(key);
    const dec = CryptoJS.AES.decrypt(CryptoJS.format.Hex.parse(enced), key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    return CryptoJS.enc.Utf8.stringify(dec);
}

export { encStr, decryptStr, getMac };