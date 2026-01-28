import { NextRequest, NextResponse } from 'next/server'
import { clearRateLimitStore } from '@/lib/security/rate-limit'

/**
 * Development-only endpoint to clear rate limit store
 * Only available in development mode
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    clearRateLimitStore()
    return NextResponse.json({
      success: true,
      message: 'Rate limit store cleared',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to clear rate limit store' },
      { status: 500 }
    )
  }
}
