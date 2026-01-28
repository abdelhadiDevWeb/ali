import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/session'
import { sanitizeError, logError } from '@/lib/utils/error-handler'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('admin_session')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Verify JWT token
    let adminId: string
    try {
      const payload = await verifyJWT(token)
      adminId = payload.adminId as string
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session. Please log in again.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, first_name, last_name, email } = body

    // Verify that the user is updating their own profile
    if (id !== adminId) {
      return NextResponse.json(
        { error: 'You can only update your own profile.' },
        { status: 403 }
      )
    }

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update admin profile
    const { data, error } = await supabase
      .from('admin')
      .update({
        first_name,
        last_name,
        email: email.trim().toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', adminId)
      .select()
      .single()

    if (error) {
      logError('ProfileUpdateAPI.update', error)
      return NextResponse.json(
        { error: 'Unable to update profile. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      admin: data,
    })
  } catch (error: any) {
    logError('ProfileUpdateAPI.POST', error)
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    )
  }
}
