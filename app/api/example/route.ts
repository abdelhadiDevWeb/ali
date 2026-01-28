/**
 * Example Secure API Route
 * Demonstrates how to use security utilities in API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createSecureApiHandler, 
  validateRequestBody,
  createSuccessResponse,
  createErrorResponse 
} from '@/lib/security/api-helpers';
import { validateEmail, validatePassword, sanitizeString } from '@/lib/security/validation';
import { rateLimiters } from '@/lib/security/rate-limit';

// Example: Public GET endpoint with rate limiting
export const GET = createSecureApiHandler(
  async (request: NextRequest) => {
    // Your handler logic here
    return createSuccessResponse({
      message: 'This is a secure API endpoint',
      timestamp: new Date().toISOString(),
    });
  },
  {
    requireAuth: false,
    requireCsrf: false,
    rateLimiter: rateLimiters.standard,
    allowedMethods: ['GET'],
  }
);

// Example: Protected POST endpoint with CSRF and validation
export const POST = createSecureApiHandler(
  async (request: NextRequest) => {
    // Validate request body
    const body = await validateRequestBody(request, (data) => {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid request body');
      }
      
      const { email, password, name } = data as {
        email: string;
        password: string;
        name: string;
      };

      // Validate and sanitize inputs
      const validatedEmail = validateEmail(email);
      validatePassword(password);
      const sanitizedName = sanitizeString(name);

      return {
        email: validatedEmail,
        password, // Don't return password in response
        name: sanitizedName,
      };
    });

    // Process the request
    // ... your business logic here ...

    return createSuccessResponse({
      message: 'Request processed successfully',
      data: {
        email: body.email,
        name: body.name,
        // Never return password
      },
    });
  },
  {
    requireAuth: true, // Require authentication
    requireCsrf: true, // Require CSRF token
    rateLimiter: rateLimiters.auth, // Stricter rate limiting
    allowedMethods: ['POST'],
  }
);
