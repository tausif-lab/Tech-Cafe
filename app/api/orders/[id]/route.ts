import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        cafe:cafes(name, phone, address)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) throw error
    
    if (!data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
