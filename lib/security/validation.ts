/**
 * Input Validation and Sanitization Utilities
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 10000); // Limit length
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required', 'email');
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    throw new ValidationError('Invalid email format', 'email');
  }

  if (sanitized.length > 254) {
    throw new ValidationError('Email is too long', 'email');
  }

  return sanitized;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): void {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required', 'password');
  }

  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long', 'password');
  }

  if (password.length > 128) {
    throw new ValidationError('Password is too long', 'password');
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    throw new ValidationError('Password must contain at least one uppercase letter', 'password');
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    throw new ValidationError('Password must contain at least one lowercase letter', 'password');
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    throw new ValidationError('Password must contain at least one number', 'password');
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    throw new ValidationError('Password must contain at least one special character', 'password');
  }
}

/**
 * Validate URL
 */
export function validateUrl(url: string, allowedDomains?: string[]): string {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('URL is required', 'url');
  }

  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:') {
      throw new ValidationError('Only HTTPS URLs are allowed', 'url');
    }

    // Check against allowed domains if provided
    if (allowedDomains && allowedDomains.length > 0) {
      const hostname = parsedUrl.hostname;
      const isAllowed = allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );

      if (!isAllowed) {
        throw new ValidationError(`URL domain not allowed: ${hostname}`, 'url');
      }
    }

    return parsedUrl.toString();
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid URL format', 'url');
  }
}

/**
 * Validate and sanitize text input
 */
export function validateText(
  text: string,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  } = {}
): string {
  const { minLength = 0, maxLength = 10000, required = false } = options;

  if (required && (!text || typeof text !== 'string' || text.trim().length === 0)) {
    throw new ValidationError('This field is required');
  }

  if (!text) {
    return '';
  }

  const sanitized = sanitizeString(text);

  if (sanitized.length < minLength) {
    throw new ValidationError(`Text must be at least ${minLength} characters long`);
  }

  if (sanitized.length > maxLength) {
    throw new ValidationError(`Text must be no more than ${maxLength} characters long`);
  }

  return sanitized;
}

/**
 * Validate UUID
 */
export function validateUuid(uuid: string): string {
  if (!uuid || typeof uuid !== 'string') {
    throw new ValidationError('UUID is required', 'uuid');
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(uuid)) {
    throw new ValidationError('Invalid UUID format', 'uuid');
  }

  return uuid;
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value) as T[Extract<keyof T, string>];
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value) as T[Extract<keyof T, string>];
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item: unknown) =>
          typeof item === 'string' ? sanitizeString(item) : item
        ) as T[Extract<keyof T, string>];
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}
