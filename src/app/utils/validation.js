/**
 * Password validation utility functions
 */

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {Array} - Array of error messages, empty if valid
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return errors;
}

/**
 * Get password strength level
 * @param {string} password - The password to evaluate
 * @returns {Object} - Object with strength level and color
 */
export function getPasswordStrength(password) {
  const errors = validatePassword(password);
  
  if (!password || password.length === 0) {
    return { strength: 'none', color: 'gray', score: 0 };
  }
  
  if (errors.length === 0) {
    return { strength: 'Strong', color: 'green', score: 4 };
  }
  
  if (errors.length <= 2) {
    return { strength: 'Medium', color: 'yellow', score: 2 };
  }
  
  return { strength: 'Weak', color: 'red', score: 1 };
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input
 * @param {string} input - The string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
} 