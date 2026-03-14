import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = await request.json()
    
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')
    
    const isValid = expectedSignature === razorpay_signature
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }
    
    // Update payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'captured',
        method: 'razorpay'
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id)
    
    if (paymentError) throw paymentError
    
    // Update order payment status
    const { error: orderError } = await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', orderId)
      .eq('user_id', user.id)
    
    if (orderError) throw orderError
    
    return NextResponse.json({ 
      data: { success: true, orderId }, 
      error: null 
    })
    
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
