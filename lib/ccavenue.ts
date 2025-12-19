import crypto from 'crypto';

// Encryption/Decryption logic for CCAvenue
// AES-128-CBC is the standard used by CCAvenue

export const encrypt = (text: string, key: string): string => {
    const method = 'aes-128-cbc';
    const iv = Buffer.from('\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f'); // Static IV as per CCAvenue examples

    // Create md5 hash of the key
    const keyHash = crypto.createHash('md5').update(key).digest();

    const cipher = crypto.createCipheriv(method, keyHash, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
};

export const decrypt = (encryptedText: string, key: string): string => {
    const method = 'aes-128-cbc';
    const iv = Buffer.from('\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f');

    const keyHash = crypto.createHash('md5').update(key).digest();

    const decipher = crypto.createDecipheriv(method, keyHash, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

// Helper to convert object to query string for CCAvenue
export const transformToCCAvenuePayload = (data: Record<string, string | number>) => {
    return Object.keys(data)
        .map(key => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');
};

// Helper to parse CCAvenue response string to object
export const parseCCAvenueResponse = (responseStr: string): Record<string, string> => {
    const params: Record<string, string> = {};
    responseStr.split('&').forEach(pair => {
        const idx = pair.indexOf('=');
        if (idx > -1) {
            const key = pair.substring(0, idx);
            const value = pair.substring(idx + 1);
            if (key) params[key] = decodeURIComponent(value || '');
        }
    });
    return params;
};
