# Security Configuration

This document outlines the security measures implemented in this Next.js application.

## Security Headers

The application implements comprehensive security headers via `next.config.ts`:

- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables browser XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features
- **Content-Security-Policy (CSP)**: Controls resource loading

## Content Security Policy (CSP)

The CSP is configured to:
- Only allow scripts from same origin (with exceptions for Next.js)
- Restrict styles to same origin
- Allow images from HTTPS sources
- Restrict connections to Supabase domains
- Block inline scripts and styles (with necessary exceptions)

## Rate Limiting

Rate limiting is implemented to prevent abuse:

- **Auth endpoints**: 5 requests per minute
- **API endpoints**: 100 requests per minute
- **Strict endpoints**: 10 requests per minute

Rate limiting is applied in middleware and can be customized per route.

## Input Validation

All user input is validated and sanitized:

- **Email validation**: Format and length checks
- **Password validation**: Strength requirements (min 8 chars, uppercase, lowercase, number, special char)
- **URL validation**: Protocol and domain whitelisting
- **Text sanitization**: XSS prevention, length limits
- **UUID validation**: Format verification

## CSRF Protection

CSRF tokens are generated and validated for state-changing operations:

- Tokens are stored in HTTP-only cookies
- Tokens are validated on form submissions and API requests
- Constant-time comparison prevents timing attacks

## Secure Cookies

All cookies are configured with security best practices:

- **httpOnly**: Prevents JavaScript access
- **secure**: HTTPS-only in production
- **sameSite**: Prevents CSRF attacks
- **path**: Restricted to appropriate paths

## Environment Variables

Environment variables are validated at startup:

- Required variables are checked
- URL format validation
- Key length validation
- Prevents misconfiguration errors

## Supabase Security

Supabase clients are configured with:

- Secure cookie settings
- Proper session management
- Automatic token refresh
- Row Level Security (RLS) support

## Authentication Security

- Password strength requirements
- Rate limiting on auth endpoints
- Secure session management
- Automatic session refresh

## API Security

- Rate limiting on all API routes
- Input validation on all endpoints
- CSRF protection for state-changing operations
- Error handling without information disclosure

## Security Utilities

All security utilities are located in `lib/security/`:

- `env-validator.ts`: Environment variable validation
- `rate-limit.ts`: Rate limiting implementation
- `validation.ts`: Input validation and sanitization
- `csrf.ts`: CSRF token management

## Best Practices

1. **Never trust user input** - Always validate and sanitize
2. **Use HTTPS** - All production traffic should be encrypted
3. **Keep dependencies updated** - Regularly update packages
4. **Monitor security events** - Log and alert on suspicious activity
5. **Use strong passwords** - Enforce password policies
6. **Implement least privilege** - Only grant necessary permissions
7. **Regular security audits** - Review code and dependencies
8. **Error handling** - Don't expose sensitive information in errors

## Production Checklist

Before deploying to production:

- [ ] Set all required environment variables
- [ ] Verify HTTPS is enabled
- [ ] Test rate limiting
- [ ] Verify security headers are present
- [ ] Test CSRF protection
- [ ] Review and update dependencies
- [ ] Enable logging and monitoring
- [ ] Set up DDoS protection
- [ ] Configure WAF if available
- [ ] Review Supabase RLS policies
- [ ] Test authentication flows
- [ ] Verify secure cookie settings

## Security Monitoring

Consider implementing:

- **Logging**: Log all security events (failed logins, rate limit hits, etc.)
- **Alerts**: Set up alerts for suspicious activity
- **Analytics**: Monitor security metrics
- **Audit logs**: Track all authentication and authorization events

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** create a public issue
2. Contact the project maintainers privately
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before disclosure

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
