const crypto = require('crypto');

// Constants for encryption
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const KEY_LENGTH = 32; // 256 bits
const AUTH_TAG_LENGTH = 16;

// Secret key for encryption (in production, use environment variables)
// This is just a fallback default key
const DEFAULT_ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'edusphere_message_encryption_key_2025';

// Generate a secure encryption key from the provided string
const generateEncryptionKey = (baseKey = DEFAULT_ENCRYPTION_KEY) => {
    return crypto.createHash('sha256').update(String(baseKey)).digest();
};

// Encrypt a message
const encryptMessage = (text, customKey = null) => {
    try {
        // Generate encryption key
        const key = customKey ? generateEncryptionKey(customKey) : generateEncryptionKey();
        
        // Generate a random initialization vector
        const iv = crypto.randomBytes(IV_LENGTH);
        
        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        // Encrypt the text
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Get auth tag
        const authTag = cipher.getAuthTag();
        
        // Return iv, encrypted text and auth tag as a single string
        // Format: iv:encryptedText:authTag
        return Buffer.concat([
            iv,
            Buffer.from(encrypted, 'hex'),
            authTag
        ]).toString('base64');
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

// Decrypt a message
const decryptMessage = (encryptedText, customKey = null) => {
    try {
        // Generate decryption key
        const key = customKey ? generateEncryptionKey(customKey) : generateEncryptionKey();
        
        // Convert from base64 to buffer
        const encryptedBuffer = Buffer.from(encryptedText, 'base64');
        
        // Extract IV, encrypted text and auth tag
        const iv = encryptedBuffer.slice(0, IV_LENGTH);
        const authTag = encryptedBuffer.slice(encryptedBuffer.length - AUTH_TAG_LENGTH);
        const encrypted = encryptedBuffer.slice(IV_LENGTH, encryptedBuffer.length - AUTH_TAG_LENGTH);
        
        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        // Decrypt the text
        let decrypted = decipher.update(encrypted, 'binary', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

module.exports = {
    encryptMessage,
    decryptMessage,
    generateEncryptionKey
};
