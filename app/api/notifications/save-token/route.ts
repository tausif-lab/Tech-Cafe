import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/notifications/save-token
 * Body: { token: string }
 *
 * Saves (or upserts) the current user's FCM device token in the
 * device_tokens table, linked to their cafe_id.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await request.json()
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Get the user's cafe_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('cafe_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.cafe_id) {
      return NextResponse.json(
        { error: 'No cafe associated with this account' },
        { status: 403 }
      )
    }

    // Only admins/superadmins should register for push
    if (!['admin', 'superadmin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Only admin accounts can register for notifications' },
        { status: 403 }
      )
    }

    // Upsert: update token's updated_at if it already exists; insert otherwise
   // Check if token already exists
const { data: existingToken } = await supabase
  .from('device_tokens')
  .select('id')
  .eq('user_id', user.id)
  .eq('token', token)
  .single()

if (existingToken) {
  // Just update timestamp
  const { error: updateError } = await supabase
    .from('device_tokens')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', existingToken.id)
  
  if (updateError) throw updateError
  
  console.log('[save-token] Token updated for user:', user.id)
} else {
  // Insert new token
  const { error: insertError } = await supabase
    .from('device_tokens')
    .insert({
      user_id: user.id,
      cafe_id: profile.cafe_id,
      token,
    })
  
  if (insertError) throw insertError
  
  console.log('[save-token] New token saved for user:', user.id, 'cafe:', profile.cafe_id)
}

return NextResponse.json({ success: true, saved: true })
  } catch (error: any) {
    console.error('[save-token] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
