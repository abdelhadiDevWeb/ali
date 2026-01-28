import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    // Verify JWT token
    try {
      await verifyJWT(token)
      return NextResponse.json({ authenticated: true })
    } catch (error) {
      return NextResponse.json({ authenticated: false })
    }
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}
