const crypto = require('crypto');

const ALGORITHM = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  : crypto.randomBytes(32);

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted data with IV and auth tag
 */
const encrypt = (text) => {
  try {
    if (!text) return null;

    // Generate random initialization vector
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Combine IV, auth tag, and encrypted data
    const result = {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encrypted: encrypted
    };

    // Return as base64 encoded string
    return Buffer.from(JSON.stringify(result)).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt encrypted data
 * @param {string} encryptedData - Encrypted data with IV and auth tag
 * @returns {string} Decrypted plain text
 */
const decrypt = (encryptedData) => {
  try {
    if (!encryptedData) return null;

    // Parse the encrypted data
    const data = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
    const { iv, authTag, encrypted } = data;

    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      ENCRYPTION_KEY,
      Buffer.from(iv, 'hex')
    );

    // Set authentication tag
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash sensitive data using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} Hashed data
 */
const hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate a random token
 * @param {number} length - Token length in bytes
 * @returns {string} Random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Compare hashed data
 * @param {string} data - Plain data
 * @param {string} hashedData - Hashed data to compare
 * @returns {boolean} True if data matches
 */
const compareHash = (data, hashedData) => {
  return hash(data) === hashedData;
};

/**
 * Encrypt object fields
 * @param {Object} obj - Object with fields to encrypt
 * @param {Array} fields - Array of field names to encrypt
 * @returns {Object} Object with encrypted fields
 */
const encryptFields = (obj, fields) => {
  const encrypted = { ...obj };
  fields.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encrypt(String(encrypted[field]));
    }
  });
  return encrypted;
};

/**
 * Decrypt object fields
 * @param {Object} obj - Object with encrypted fields
 * @param {Array} fields - Array of field names to decrypt
 * @returns {Object} Object with decrypted fields
 */
const decryptFields = (obj, fields) => {
  const decrypted = { ...obj };
  fields.forEach(field => {
    if (decrypted[field]) {
      try {
        decrypted[field] = decrypt(decrypted[field]);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        decrypted[field] = null;
      }
    }
  });
  return decrypted;
};

/**
 * Generate encryption key
 * @returns {string} Hex encoded encryption key
 */
const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateToken,
  compareHash,
  encryptFields,
  decryptFields,
  generateEncryptionKey
};
