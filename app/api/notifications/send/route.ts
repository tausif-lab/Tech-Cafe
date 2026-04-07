import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPushToTokens } from '@/lib/firebase/admin'

/**
 * POST /api/notifications/send
 * Body: { orderId: string, cafeId: string, orderNumber: string }
 *
 * Internal endpoint — called by /api/orders on every new order.
 * Fetches all FCM tokens for the cafe and broadcasts a push notification.
 */
export async function POST(request: NextRequest) {
  try {
    // Use service role to read all device tokens (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { orderId, cafeId, orderNumber } = body as {
      orderId: string
      cafeId: string
      orderNumber: string
    }

    if (!orderId || !cafeId || !orderNumber) {
      return NextResponse.json(
        { error: 'orderId, cafeId and orderNumber are required' },
        { status: 400 }
      )
    }

    /*Fetch all FCM tokens registered for this cafe
    const { data: tokenRows, error: tokenError } = await supabase
      .from('device_tokens')
      .select('token')
      .eq('cafe_id', cafeId)
    
    if (tokenError) throw tokenError*/
    console.log('[send-notification] Looking for tokens for cafe:', cafeId)

const { data: tokenRows, error: tokenError } = await supabase
  .from('device_tokens')
  .select('*') // Select all to see full data
  .eq('cafe_id', cafeId)

console.log('[send-notification] Found token rows:', tokenRows)

if (tokenError) {
  console.error('[send-notification] Token fetch error:', tokenError)
  throw tokenError
}
    
    const tokens = (tokenRows ?? []).map((r: { token: string }) => r.token)
   console.log("TOKENS:", tokens);
    if (tokens.length === 0) {
      console.log(`[send-notification] No device tokens for cafe ${cafeId}`)
      return NextResponse.json({ sent: 0 })
    }

    // Send multicast push notification via Firebase Admin SDK
    await sendPushToTokens(
      tokens,
      '🔔 New Order Received!',
      `Order ${orderNumber} is waiting for your confirmation`,
      {
        order_id:     orderId,
        cafe_id:      cafeId,
        order_number: orderNumber,
        click_action: '/admin',
      }
    )

    return NextResponse.json({ sent: tokens.length })
  } catch (error: any) {
    console.error('[send-notification] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
