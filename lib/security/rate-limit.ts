/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter (use Redis for production)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: Request) => string;
}

const defaultKeyGenerator = (request: Request): string => {
  // Use IP address or user ID for rate limiting
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  
  // In development, use a more specific key to avoid blocking all requests
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(request.url);
    const path = url.pathname;
    // Include path in key for development to allow different endpoints
    return `${ip}:${path}`;
  }
  
  return ip;
};

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator = defaultKeyGenerator } = options;

  return async (request: Request): Promise<Response | null> => {
    const key = keyGenerator(request);
    const now = Date.now();

    // Clean up expired entries
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });

    // Get or create entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null; // Allow request
    }

    // Increment count
    store[key].count += 1;

    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      const resetTime = new Date(store[key].resetTime).toISOString();
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((store[key].resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, maxRequests - store[key].count).toString(),
            'X-RateLimit-Reset': resetTime,
          },
        }
      );
    }

    return null; // Allow request
  };
}

// Pre-configured rate limiters
export const rateLimiters = {
  // Strict rate limiter (10 requests per minute)
  strict: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  }),
  
  // Standard rate limiter (100 requests per minute)
  standard: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),
  
  // Auth rate limiter (more lenient for login/register)
  // In development: 30 requests per minute, in production: 10 requests per minute
  auth: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: process.env.NODE_ENV === 'production' ? 10 : 30, // 10 in prod, 30 in dev
  }),
};

// Helper function to clear rate limit store (useful for development/testing)
export function clearRateLimitStore() {
  Object.keys(store).forEach((key) => {
    delete store[key];
  });
}
