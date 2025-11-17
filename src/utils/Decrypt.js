// import crypto from 'crypto';

const PASSWORD = 'ByoSyncPayWithFace';
const SALT = 'ByoSync'

// function generateKey() {
//     return crypto.pbkdf2Sync(PASSWORD, SALT, 65536, 32, 'sha256');
// }

// export default function decrypt(encryptedData) {
//     console.log(encryptedData)
//     const [ivHex, dataHex] = encryptedData.split(':');
//     const key = generateKey();
//     const iv = Buffer.from(ivHex, 'hex');
//     const encryptedText = Buffer.from(dataHex, 'hex');
//     const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
//     let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');
//     console.log(decrypted)
//     return decrypted;
// }


import CryptoJS from "crypto-js";



// Browser version of PBKDF2
const KEY = CryptoJS.PBKDF2(PASSWORD, CryptoJS.enc.Utf8.parse(SALT), {
    keySize: 32 / 4, // 32 bytes = 256 bits
    iterations: 65536,
    hasher: CryptoJS.algo.SHA256,
});


export default function decrypt(encryptedData) {
    try {
        const start = new Date();
        console.log("Encrypted:", encryptedData);

        const [ivHex, dataHex] = encryptedData.split(":");
        const iv = CryptoJS.enc.Hex.parse(ivHex);

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: CryptoJS.enc.Hex.parse(dataHex) },
            KEY,
            { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );

        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        console.log("Decrypted:", plaintext);
        const end = new Date();
        console.log(`Decryption took ${end - start} ms`);
        return plaintext;
    } catch (err) {
        console.error("Decryption error:", err);
        return null;
    }
}



