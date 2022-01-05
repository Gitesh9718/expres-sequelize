
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = Buffer.from(_config.encryption.key, 'hex');
const iv = Buffer.from(_config.encryption.iv, 'hex');

module.exports = {
    encryptText: encrypt,
    decryptText: decrypt
};

function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

function decrypt(text) {
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
