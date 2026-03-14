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
        order_items(*)
      `)
      .eq('cafe_id', profile.cafe_id)
      .order('created_at', { ascending: false })
    
    if (status) {
      // Handle multiple statuses separated by comma
      const statuses = status.split(',').map(s => s.trim())
      query = query.in('status', statuses)
    }
    
    if (date) {
      const startOfDay = `${date}T00:00:00`
      const endOfDay = `${date}T23:59:59`
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Admin orders fetch error:', error)
      throw error
    }
    
    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error('Admin orders API error:', error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
