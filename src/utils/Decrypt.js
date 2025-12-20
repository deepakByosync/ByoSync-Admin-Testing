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
        // Check if encryptedData is valid
        if (!encryptedData || typeof encryptedData !== 'string' || encryptedData.trim() === '') {
            console.log("Encrypted data is empty or invalid:", encryptedData);
            return '';
        }

        const start = new Date();
        console.log("Encrypted:", encryptedData);

        // Check if data contains the required separator
        if (!encryptedData.includes(':')) {
            console.log("Invalid encrypted data format - missing separator");
            return encryptedData; // Return as is if not encrypted
        }

        const [ivHex, dataHex] = encryptedData.split(":");
        
        // Validate both parts exist
        if (!ivHex || !dataHex) {
            console.log("Invalid encrypted data format - missing IV or data");
            return encryptedData; // Return as is if invalid format
        }

        const iv = CryptoJS.enc.Hex.parse(ivHex);

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: CryptoJS.enc.Hex.parse(dataHex) },
            KEY,
            { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );

        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        
        // If decryption resulted in empty string, return original
        if (!plaintext || plaintext.trim() === '') {
            console.log("Decryption resulted in empty string, returning original");
            return encryptedData;
        }
        
        console.log("Decrypted:", plaintext);
        const end = new Date();
        console.log(`Decryption took ${end - start} ms`);
        return plaintext;
    } catch (err) {
        console.error("Decryption error:", err);
        // Return original data if decryption fails
        return encryptedData || '';
    }
}



