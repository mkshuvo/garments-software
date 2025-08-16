/**
 * Security utilities for frontend input validation and sanitization
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // HTML encode dangerous characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: Date, endDate: Date): { isValid: boolean; error?: string } {
  if (!startDate || !endDate) {
    return { isValid: false, error: 'Both start and end dates are required' };
  }
  
  if (startDate > endDate) {
    return { isValid: false, error: 'Start date cannot be later than end date' };
  }
  
  // Check for reasonable date bounds
  const minDate = new Date('1900-01-01');
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 1); // Allow tomorrow
  
  if (startDate < minDate || endDate < minDate) {
    return { isValid: false, error: 'Dates cannot be earlier than 1900' };
  }
  
  if (startDate > maxDate || endDate > maxDate) {
    return { isValid: false, error: 'Dates cannot be in the future' };
  }
  
  return { isValid: true };
}

/**
 * Validate numeric input
 */
export function validateNumeric(value: string): { isValid: boolean; number?: number; error?: string } {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Value is required' };
  }
  
  const sanitized = value.replace(/[^\d.-]/g, '');
  const number = parseFloat(sanitized);
  
  if (isNaN(number)) {
    return { isValid: false, error: 'Invalid numeric value' };
  }
  
  return { isValid: true, number };
}

/**
 * Check if input contains potentially malicious content
 */
export function containsMaliciousContent(input: string): boolean {
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload=/gi,
    /onerror=/gi,
    /onclick=/gi,
    /onmouseover=/gi,
    /eval\(/gi,
    /expression\(/gi,
    /document\.cookie/gi,
    /document\.write/gi,
    /window\.location/gi
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Mask sensitive data for display
 */
export function maskSensitiveData(data: string, visibleChars: number = 2): string {
  if (!data || data.length <= visibleChars * 2) {
    return '*'.repeat(data?.length || 0);
  }
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const middle = '*'.repeat(Math.max(0, data.length - (visibleChars * 2)));
  
  return `${start}${middle}${end}`;
}

/**
 * Generate a secure random string for client-side use
 */
export function generateSecureToken(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validate file name for uploads
 */
export function validateFileName(fileName: string): { isValid: boolean; error?: string } {
  if (!fileName) {
    return { isValid: false, error: 'File name is required' };
  }
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /\.\./,
    /[<>:"|?*]/,
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(fileName))) {
    return { isValid: false, error: 'File name contains invalid characters' };
  }
  
  // Check length
  if (fileName.length > 255) {
    return { isValid: false, error: 'File name is too long' };
  }
  
  return { isValid: true };
}

/**
 * Rate limiting helper for client-side
 */
export class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const keyRequests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = keyRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  getRemainingRequests(key: string, maxRequests: number = 10, windowMs: number = 60000): number {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      return maxRequests;
    }
    
    const keyRequests = this.requests.get(key)!;
    const validRequests = keyRequests.filter(time => time > windowStart);
    
    return Math.max(0, maxRequests - validRequests.length);
  }
}

/**
 * Secure storage helper
 */
export class SecureStorage {
  private static readonly PREFIX = 'garments_erp_';
  
  static setItem(key: string, value: unknown): void {
    try {
      const sanitizedKey = sanitizeString(key, 100);
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(this.PREFIX + sanitizedKey, serializedValue);
    } catch (error) {
      console.error('Error storing data securely:', error);
    }
  }
  
  static getItem<T>(key: string): T | null {
    try {
      const sanitizedKey = sanitizeString(key, 100);
      const item = sessionStorage.getItem(this.PREFIX + sanitizedKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error retrieving data securely:', error);
      return null;
    }
  }
  
  static removeItem(key: string): void {
    try {
      const sanitizedKey = sanitizeString(key, 100);
      sessionStorage.removeItem(this.PREFIX + sanitizedKey);
    } catch (error) {
      console.error('Error removing data securely:', error);
    }
  }
  
  static clear(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }
}

/**
 * Input validation for trial balance specific data
 */
export function validateTrialBalanceRequest(request: {
  startDate: Date;
  endDate: Date;
  groupByCategory?: boolean;
  includeZeroBalances?: boolean;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate date range
  const dateValidation = validateDateRange(request.startDate, request.endDate);
  if (!dateValidation.isValid) {
    errors.push(dateValidation.error!);
  }
  
  // Check for reasonable date range (not too large)
  const daysDifference = Math.abs(request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDifference > 365) {
    errors.push('Date range cannot exceed 365 days');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}