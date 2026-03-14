import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, cafe_id')
      .eq('id', user.id)
      .single()
    
    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        profiles!orders_user_id_fkey(full_name, phone)
      `)
      .eq('cafe_id', profile.cafe_id)
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (date) {
      const startOfDay = `${date}T00:00:00`
      const endOfDay = `${date}T23:59:59`
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
