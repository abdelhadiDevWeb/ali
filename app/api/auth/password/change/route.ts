import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/session'
import bcrypt from 'bcryptjs'
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
    const { oldPassword, newPassword, confirmPassword } = body

    // Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All password fields are required.' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match.' },
        { status: 400 }
      )
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from the current password.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current admin data to verify old password
    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('id, password')
      .eq('id', adminId)
      .single()

    if (adminError || !admin) {
      logError('PasswordChangeAPI.getAdmin', adminError)
      return NextResponse.json(
        { error: 'Unable to verify your account. Please try again.' },
        { status: 500 }
      )
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.password)
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect.' },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in database
    const { error: updateError } = await supabase
      .from('admin')
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', adminId)

    if (updateError) {
      logError('PasswordChangeAPI.update', updateError)
      return NextResponse.json(
        { error: 'Unable to update password. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    })
  } catch (error: any) {
    logError('PasswordChangeAPI.POST', error)
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    )
  }
}
