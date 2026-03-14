import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { orderId } = await request.json()
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, cafe:cafes(name)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()
    
    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    })
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total_amount * 100), // Convert to paise
      currency: 'INR',
      receipt: order.order_number,
      notes: {
        order_id: order.id,
        user_id: user.id,
        cafe_id: order.cafe_id
      }
    })
    
    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        cafe_id: order.cafe_id,
        user_id: user.id,
        razorpay_order_id: razorpayOrder.id,
        amount: order.total_amount,
        currency: 'INR',
        status: 'created'
      })
      .select()
      .single()
    
    if (paymentError) throw paymentError
    
    return NextResponse.json({ 
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: order.total_amount,
        currency: 'INR',
        cafeName: order.cafe?.name || 'Tech Cafe',
        orderNumber: order.order_number
      }, 
      error: null 
    })
    
  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
