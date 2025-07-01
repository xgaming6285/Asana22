import crypto from 'crypto';

const ENCRYPT_KEY = process.env.ENCRYPT_KEY;
const ALGORITHM = 'aes-256-cbc';

// Only check for ENCRYPT_KEY on server-side (when crypto is available)
if (typeof window === 'undefined' && !ENCRYPT_KEY) {
  throw new Error('ENCRYPT_KEY environment variable is required');
}

// Create a consistent key from the environment variable
const createKey = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Encryption functions should only be used on server-side');
  }
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

/**
 * Encrypt project data fields
 * @param {Object} projectData - The project data object
 * @returns {Object} - Project data with encrypted sensitive fields
 */
export function encryptProjectData(projectData) {
  if (!projectData || typeof projectData !== 'object') {
    return projectData;
  }

  const encrypted = { ...projectData };

  // Encrypt sensitive fields
  if (encrypted.name) {
    encrypted.name = encrypt(encrypted.name);
  }
  if (encrypted.description) {
    encrypted.description = encrypt(encrypted.description);
  }

  return encrypted;
}

/**
 * Decrypt project data fields
 * @param {Object} projectData - The project data object with encrypted fields
 * @returns {Object} - Project data with decrypted sensitive fields
 */
export function decryptProjectData(projectData) {
  if (!projectData || typeof projectData !== 'object') {
    return projectData;
  }

  const decrypted = { ...projectData };

  // Decrypt sensitive fields
  if (decrypted.name) {
    decrypted.name = decrypt(decrypted.name);
  }
  if (decrypted.description) {
    decrypted.description = decrypt(decrypted.description);
  }

  return decrypted;
}

/**
 * Decrypt an array of project objects
 * @param {Array} projects - Array of project objects
 * @returns {Array} - Array of projects with decrypted data
 */
export function decryptProjectsArray(projects) {
  if (!Array.isArray(projects)) {
    return projects;
  }

  return projects.map(project => decryptProjectData(project));
}

/**
 * Encrypt user data fields
 * @param {Object} userData - The user data object
 * @returns {Object} - User data with encrypted sensitive fields
 */
export function encryptUserData(userData) {
  if (!userData || typeof userData !== 'object') {
    return userData;
  }

  const encrypted = { ...userData };

  // Encrypt sensitive fields
  if (encrypted.email) {
    encrypted.email = encrypt(encrypted.email);
  }
  if (encrypted.firstName) {
    encrypted.firstName = encrypt(encrypted.firstName);
  }
  if (encrypted.lastName) {
    encrypted.lastName = encrypt(encrypted.lastName);
  }

  return encrypted;
}

/**
 * Decrypt user data fields
 * @param {Object} userData - The user data object with encrypted fields
 * @returns {Object} - User data with decrypted sensitive fields
 */
export function decryptUserData(userData) {
  if (!userData || typeof userData !== 'object') {
    return userData;
  }

  const decrypted = { ...userData };

  // Decrypt sensitive fields
  if (decrypted.email) {
    decrypted.email = decrypt(decrypted.email);
  }
  if (decrypted.firstName) {
    decrypted.firstName = decrypt(decrypted.firstName);
  }
  if (decrypted.lastName) {
    decrypted.lastName = decrypt(decrypted.lastName);
  }

  return decrypted;
}

/**
 * Decrypt an array of user objects
 * @param {Array} users - Array of user objects
 * @returns {Array} - Array of users with decrypted data
 */
export function decryptUsersArray(users) {
  if (!Array.isArray(users)) {
    return users;
  }

  return users.map(user => decryptUserData(user));
} 