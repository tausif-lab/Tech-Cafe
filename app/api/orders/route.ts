import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CartItem } from '@/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { 
      items, 
      slotId, 
      slotDate, 
      slotTime, 
      paymentMethod, 
      couponCode, 
      notes 
    }: {
      items: CartItem[]
      slotId?: string
      slotDate?: string
      slotTime?: string
      paymentMethod: 'razorpay' | 'cash' | 'pos'
      couponCode?: string
      notes?: string
    } = body
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    
    // Get cafe_id from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('cafe_id')
      .eq('id', user.id)
      .single()
    
    let cafeId = profile?.cafe_id
    
    if (!cafeId) {
      const { data: cafe } = await supabase
        .from('cafes')
        .select('id, settings')
        .eq('is_active', true)
        .single()
      cafeId = cafe?.id
    }
    
    if (!cafeId) {
      return NextResponse.json({ error: 'No active cafe found' }, { status: 404 })
    }
    
    // Get cafe settings for tax
    const { data: cafe } = await supabase
      .from('cafes')
      .select('settings')
      .eq('id', cafeId)
      .single()
    
    const taxRate = cafe?.settings?.tax_percentage || 5
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    let discountAmount = 0
    let couponId = null
    
    // Validate and apply coupon if provided
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('cafe_id', cafeId)
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single()
      
      if (coupon) {
        const now = new Date().toISOString()
        const isValid = 
          (!coupon.starts_at || coupon.starts_at <= now) &&
          (!coupon.expires_at || coupon.expires_at >= now) &&
          subtotal >= coupon.min_order_value &&
          (!coupon.max_uses || coupon.used_count < coupon.max_uses)
        
        if (isValid) {
          couponId = coupon.id
          if (coupon.discount_type === 'percentage') {
            discountAmount = (subtotal * coupon.discount_value) / 100
            if (coupon.max_discount_amount) {
              discountAmount = Math.min(discountAmount, coupon.max_discount_amount)
            }
          } else {
            discountAmount = coupon.discount_value
          }
        }
      }
    }
    
    const afterDiscount = subtotal - discountAmount
    const taxAmount = (afterDiscount * taxRate) / 100
    const totalAmount = afterDiscount + taxAmount
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        cafe_id: cafeId,
        user_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        slot_id: slotId || null,
        slot_date: slotDate || null,
        slot_time: slotTime || null,
        subtotal,
        discount_amount: discountAmount,
        coupon_id: couponId,
        coupon_code: couponCode?.toUpperCase() || null,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'pending',
        payment_method: paymentMethod,
        notes: notes || null
      })
      .select()
      .single()
    
    if (orderError) throw orderError
    
    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      cafe_id: cafeId,
      menu_item_id: item.menu_item_id,
      item_name: item.name,
      item_image_url: item.image_url,
      item_is_veg: item.is_veg,
      variant_id: item.variant_id,
      variant_name: item.variant_name,
      base_price: item.base_price,
      variant_price_delta: item.variant_price_delta,
      add_ons: item.add_ons,
      add_ons_total: item.add_ons_total,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError
    
    // Update coupon usage if applied
    if (couponId) {
      await supabase.rpc('increment_coupon_usage', { coupon_id: couponId })
    }
    
    // Update slot availability if slot selected
    if (slotId && slotDate) {
      await supabase.rpc('increment_slot_booking', { 
        p_slot_id: slotId, 
        p_slot_date: slotDate 
      })
    }
    
    return NextResponse.json({ 
      data: { 
        orderId: order.id, 
        orderNumber: order.order_number,
        totalAmount: order.total_amount 
      }, 
      error: null 
    })
    
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// Get user's orders
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
