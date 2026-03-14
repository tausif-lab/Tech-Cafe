import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get cafe_id from user's profile or use default
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
    
    // If no cafe_id, get the first active cafe
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
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('cafe_id', cafeId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
