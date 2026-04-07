import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, cafe_id")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "superadmin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { status, rejectionReason }: { status: OrderStatus; rejectionReason?: string } = await request.json()
    
    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }
    
    const updateData: any = { status }
    
    if (status === 'cancelled' && rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }
    
    if (status === 'ready') {
      updateData.estimated_ready_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .eq("cafe_id", profile.cafe_id)
      .select()
      .single();

    if (error) throw error;

    // Create notification for user
    const notificationTypes: Record<OrderStatus, string> = {
      confirmed: 'order_confirmed',
      preparing: 'order_preparing',
      ready: 'order_ready',
      cancelled: 'order_cancelled',
      refunded: 'order_refunded',
      pending: '',
      completed: ''
    }
    
    const notificationType = notificationTypes[status]
    
    if (notificationType) {
      const notificationTitles: Record<string, string> = {
        order_confirmed: "Order Confirmed!",
        order_preparing: "Order is Being Prepared",
        order_ready: "Order Ready for Pickup!",
        order_cancelled: "Order Cancelled",
        order_refunded: "Order Refunded",
      };

      const notificationBodies: Record<string, string> = {
        order_confirmed: `Your order #${data.order_number} has been confirmed by the cafe.`,
        order_preparing: `Your order #${data.order_number} is now being prepared.`,
        order_ready: `Your order #${data.order_number} is ready for pickup!`,
        order_cancelled: `Your order #${data.order_number} has been cancelled.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
        order_refunded: `Your order #${data.order_number} has been refunded.`,
      };

      await supabase.from("app_notifications").insert({
        user_id: data.user_id,
        cafe_id: data.cafe_id,
        order_id: data.id,
        type: notificationType,
        title: notificationTitles[notificationType],
        body: notificationBodies[notificationType],
        data: { order_id: data.id, order_number: data.order_number },
      });
    }
    
    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error('Order status update error:', error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
