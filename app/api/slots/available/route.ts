import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD format
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    // Get cafe_id
    const { data: { user } } = await supabase.auth.getUser()
    let cafeId: string | null = null
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('cafe_id')
        .eq('id', user.id)
        .single()
      cafeId = profile?.cafe_id
    }
    
    if (!cafeId) {
      const { data: cafe } = await supabase
        .from('cafes')
        .select('id')
        .eq('is_active', true)
        .single()
      cafeId = cafe?.id || null
    }
    
    if (!cafeId) {
      return NextResponse.json({ error: 'No active cafe found' }, { status: 404 })
    }
    
    // Get or create slot availability for the date
    const { data: slots, error } = await supabase
      .from('slot_availability')
      .select('*')
      .eq('cafe_id', cafeId)
      .eq('slot_date', date)
      .eq('is_blocked', false)
      .order('slot_time', { ascending: true })
    
    if (error) throw error
    
    // Mark slots as full/available
    const availableSlots = slots?.map(slot => ({
      ...slot,
      is_full: slot.booked_count >= slot.max_orders,
      is_available: slot.booked_count < slot.max_orders
    })) || []
    
    return NextResponse.json({ data: availableSlots, error: null })
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
