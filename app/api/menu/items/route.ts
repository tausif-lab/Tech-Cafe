import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    
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
    
    let query = supabase
      .from('menu_items')
      .select(`
        *,
        category:categories(id, name, slug),
        variants(*),
        add_ons:add_ons(*)
      `)
      .eq('cafe_id', cafeId)
      .eq('is_available', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
    
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
