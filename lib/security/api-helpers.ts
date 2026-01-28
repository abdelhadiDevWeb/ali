/**
 * API Route Security Helpers
 * Utilities for securing API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfFromRequest } from './csrf';
import { rateLimiters } from './rate-limit';
import { ValidationError } from './validation';

export interface SecureApiOptions {
  requireAuth?: boolean;
  requireCsrf?: boolean;
  rateLimiter?: typeof rateLimiters.standard;
  allowedMethods?: string[];
}

/**
 * Secure API route wrapper
 * Applies security measures to API routes
 */
export async function secureApiRoute(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: SecureApiOptions = {}
): Promise<NextResponse> {
  const {
    requireAuth = false,
    requireCsrf = true,
    rateLimiter = rateLimiters.standard,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  } = options;

  // Check HTTP method
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  // Apply rate limiting
  const rateLimitResponse = await rateLimiter(request);
  if (rateLimitResponse) {
    // Convert Response to NextResponse
    const responseData = await rateLimitResponse.json();
    return NextResponse.json(responseData, {
      status: rateLimitResponse.status,
      headers: Object.fromEntries(rateLimitResponse.headers.entries()),
    });
  }

  // Validate CSRF token for state-changing methods
  if (requireCsrf && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const isValidCsrf = await validateCsrfFromRequest(request);
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  // Check authentication if required
  if (requireAuth) {
    // You can add authentication check here
    // For example, check Supabase session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  try {
    return await handler(request);
  } catch (error) {
    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          message: error.message,
          field: error.field,
        },
        { status: 400 }
      );
    }

    // Handle other errors without exposing details
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create a secure API route handler
 */
export function createSecureApiHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: SecureApiOptions = {}
) {
  return async (request: NextRequest) => {
    return secureApiRoute(request, handler, options);
  };
}

/**
 * Validate request body
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  validator: (data: unknown) => T
): Promise<T> {
  try {
    const body = await request.json();
    return validator(body);
  } catch (error) {
    throw new ValidationError('Invalid request body');
  }
}

/**
 * Get client IP address
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  return ip.trim();
}

/**
 * Create error response
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...details,
    },
    { status }
  );
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}
