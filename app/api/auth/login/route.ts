import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { sanitizeError, logError } from '@/lib/utils/error-handler'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if admin exists with this email in the admin table
    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('id, email, password, first_name, last_name')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (adminError) {
      logError('LoginAPI.checkAdmin', adminError)
      return NextResponse.json(
        { error: 'Unable to verify credentials. Please try again.' },
        { status: 500 }
      )
    }

    // Check if admin exists in the table
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password. Admin not found.' },
        { status: 401 }
      )
    }

    // Verify password against stored hash
    const isValidPassword = await bcrypt.compare(password, admin.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Password is correct - create JWT session token
    const token = await new SignJWT({
      adminId: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
      },
    })

    // Set secure HTTP-only cookie
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    logError('LoginAPI.POST', error)
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    )
  }
}
