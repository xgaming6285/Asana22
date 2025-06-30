import crypto from 'crypto';

const ENCRYPT_KEY = process.env.ENCRYPT_KEY;
const ALGORITHM = 'aes-256-cbc';

if (!ENCRYPT_KEY) {
  throw new Error('ENCRYPT_KEY environment variable is required');
}

// Create a consistent key from the environment variable
const createKey = () => {
  return crypto.createHash('sha256').update(ENCRYPT_KEY).digest();
};

/**
 * Encrypt a string value
 * @param {string} text - The text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData
 */
export function encrypt(text) {
  if (!text || typeof text !== 'string') {
    return text; // Return as-is if not a string or empty
  }

  const key = createKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return format: iv:encryptedData
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a string value
 * @param {string} encryptedText - The encrypted text in format: iv:encryptedData
 * @returns {string} - Decrypted text
 */
export function decrypt(encryptedText) {
  if (!encryptedText || typeof encryptedText !== 'string') {
    return encryptedText; // Return as-is if not a string or empty
  }

  // Check if the text is actually encrypted (contains our format)
  if (!encryptedText.includes(':') || encryptedText.split(':').length !== 2) {
    return encryptedText; // Return as-is if not in encrypted format
  }

  try {
    const key = createKey();
    const [ivHex, encryptedData] = encryptedText.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return original if decryption fails
  }
}

/**
 * Encrypt goal data fields
 * @param {Object} goalData - The goal data object
 * @returns {Object} - Goal data with encrypted sensitive fields
 */
export function encryptGoalData(goalData) {
  if (!goalData || typeof goalData !== 'object') {
    return goalData;
  }

  const encrypted = { ...goalData };

  // Encrypt sensitive fields
  if (encrypted.title) {
    encrypted.title = encrypt(encrypted.title);
  }
  if (encrypted.description) {
    encrypted.description = encrypt(encrypted.description);
  }

  return encrypted;
}

/**
 * Decrypt goal data fields
 * @param {Object} goalData - The goal data object with encrypted fields
 * @returns {Object} - Goal data with decrypted sensitive fields
 */
export function decryptGoalData(goalData) {
  if (!goalData || typeof goalData !== 'object') {
    return goalData;
  }

  const decrypted = { ...goalData };

  // Decrypt sensitive fields
  if (decrypted.title) {
    decrypted.title = decrypt(decrypted.title);
  }
  if (decrypted.description) {
    decrypted.description = decrypt(decrypted.description);
  }

  return decrypted;
}

/**
 * Decrypt an array of goal objects
 * @param {Array} goals - Array of goal objects
 * @returns {Array} - Array of goals with decrypted data
 */
export function decryptGoalsArray(goals) {
  if (!Array.isArray(goals)) {
    return goals;
  }

  return goals.map(goal => decryptGoalData(goal));
}

/**
 * Encrypt task data fields
 * @param {Object} taskData - The task data object
 * @returns {Object} - Task data with encrypted sensitive fields
 */
export function encryptTaskData(taskData) {
  if (!taskData || typeof taskData !== 'object') {
    return taskData;
  }

  const encrypted = { ...taskData };

  // Encrypt sensitive fields
  if (encrypted.title) {
    encrypted.title = encrypt(encrypted.title);
  }
  if (encrypted.description) {
    encrypted.description = encrypt(encrypted.description);
  }

  return encrypted;
}

/**
 * Decrypt task data fields
 * @param {Object} taskData - The task data object with encrypted fields
 * @returns {Object} - Task data with decrypted sensitive fields
 */
export function decryptTaskData(taskData) {
  if (!taskData || typeof taskData !== 'object') {
    return taskData;
  }

  const decrypted = { ...taskData };

  // Decrypt sensitive fields
  if (decrypted.title) {
    decrypted.title = decrypt(decrypted.title);
  }
  if (decrypted.description) {
    decrypted.description = decrypt(decrypted.description);
  }

  return decrypted;
}

/**
 * Decrypt an array of task objects
 * @param {Array} tasks - Array of task objects
 * @returns {Array} - Array of tasks with decrypted data
 */
export function decryptTasksArray(tasks) {
  if (!Array.isArray(tasks)) {
    return tasks;
  }

  return tasks.map(task => decryptTaskData(task));
} 