# Security Utilities

This directory contains security utilities and helpers for the application.

## Modules

### `env-validator.ts`
Validates required environment variables at startup to prevent misconfiguration.

**Usage:**
```typescript
import { validateEnvVars } from '@/lib/security/env-validator'

// Call at application startup
validateEnvVars()
```

### `rate-limit.ts`
In-memory rate limiting utility. For production, consider using Redis-based rate limiting.

**Usage:**
```typescript
import { rateLimiters } from '@/lib/security/rate-limit'

// In API route or middleware
const response = await rateLimiters.auth(request)
if (response) {
  return response // Rate limit exceeded
}
```

**Pre-configured limiters:**
- `strict`: 10 requests per minute
- `standard`: 100 requests per minute
- `auth`: 5 requests per minute (for login/register)

### `validation.ts`
Input validation and sanitization utilities to prevent XSS, injection attacks, and data corruption.

**Usage:**
```typescript
import { validateEmail, validatePassword, sanitizeString } from '@/lib/security/validation'

// Validate email
const email = validateEmail(userInput)

// Validate password strength
validatePassword(userInput)

// Sanitize string input
const safe = sanitizeString(userInput)
```

### `csrf.ts`
CSRF token generation and validation utilities.

**Usage:**
```typescript
import { getCsrfToken, validateCsrfFromRequest } from '@/lib/security/csrf'

// Get CSRF token (for forms)
const token = await getCsrfToken()

// Validate CSRF token (in API routes)
const isValid = await validateCsrfFromRequest(request)
```

## Best Practices

1. **Always validate user input** before processing
2. **Use rate limiting** on all public API endpoints
3. **Validate CSRF tokens** for state-changing operations
4. **Sanitize all user-generated content** before displaying
5. **Use environment variable validation** in production
6. **Implement proper error handling** without exposing sensitive information

## Security Checklist

- [x] Environment variable validation
- [x] Rate limiting
- [x] Input validation and sanitization
- [x] CSRF protection
- [x] Security headers (in next.config.ts)
- [x] Secure cookie settings
- [x] XSS prevention
- [x] SQL injection prevention (handled by Supabase)

## Production Considerations

1. **Rate Limiting**: Replace in-memory rate limiting with Redis for distributed systems
2. **Monitoring**: Add logging and monitoring for security events
3. **WAF**: Consider using a Web Application Firewall (WAF) in production
4. **DDoS Protection**: Use a CDN with DDoS protection (e.g., Cloudflare, Vercel)
5. **Security Audits**: Regularly audit dependencies and update them
6. **Penetration Testing**: Conduct regular security testing
