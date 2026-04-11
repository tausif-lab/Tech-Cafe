import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types";
import { sendOrderReadyEmail } from "@/lib/email";
import { createClient as createAdminClient } from "@supabase/supabase-js";


export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
    
     
  
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

    const {
      status,
      rejectionReason,
    }: { status: OrderStatus; rejectionReason?: string } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    const updateData: any = { status };

    if (status === "cancelled" && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    if (status === "ready") {
      console.log(
        "📧 [EMAIL] Status is READY - starting email send process for order:",
        id,
      );
      updateData.estimated_ready_at = new Date().toISOString();

      try {
        // Fetch order details with user email
        console.log("📧 [EMAIL] Fetching order details from database...");
        const { data: orderDetails, error: fetchError } = await supabase
          .from("orders")
          .select(
            `
            order_number,
            slot_date,
            slot_time,
            user_id,
            cafes!inner(name)
          `,
          )
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error("❌ [EMAIL] Error fetching order details:", fetchError);
        }

        if (!orderDetails) {
          console.warn("⚠️ [EMAIL] Order details not found for ID:", id);
        } else {
          console.log("✅ [EMAIL] Order details fetched:", {
            order_number: orderDetails.order_number,
            user_id: orderDetails.user_id,
            slot_time: orderDetails.slot_time,
            slot_date: orderDetails.slot_date,
          });

          // Fetch user from auth.users to get email
          console.log(
            "📧 [EMAIL] Fetching user from auth for user_id:",
            orderDetails.user_id,
          );
         /* const {
            data: { user: orderUser },
            error: authError,
          } = await supabase.auth.admin.getUserById(orderDetails.user_id);*/
           const {
  data: { user: orderUser },
  error: authError,
} = await supabaseAdmin.auth.admin.getUserById(orderDetails.user_id);

          if (authError) {
            console.error(
              "❌ [EMAIL] Error fetching user from auth:",
              authError,
            );
          }

          if (!orderUser) {
            console.warn(
              "⚠️ [EMAIL] User not found in auth for user_id:",
              orderDetails.user_id,
            );
          } else if (!orderUser.email) {
            console.warn("⚠️ [EMAIL] User found but has no email address");
          } else {
            console.log("✅ [EMAIL] User found with email:", orderUser.email);
            console.log("📧 [EMAIL] Sending email...");

            const result = await sendOrderReadyEmail(
              orderUser.email,
              orderUser.user_metadata?.full_name ||
                orderUser.email.split("@")[0],
              orderDetails.order_number,
              orderDetails.slot_time || "ASAP",
              orderDetails.slot_date
                ? new Date(orderDetails.slot_date).toLocaleDateString("en-IN")
                : "Today",
              (Array.isArray(orderDetails.cafes) &&
                orderDetails.cafes[0]?.name) ||
                "Tech Cafe",
            );

            if (result.success) {
              console.log(
                "✅ [EMAIL] Email sent successfully! Message ID:",
                result.data?.id,
              );
            } else {
              console.error("❌ [EMAIL] Email send failed:", result.error);
            }
          }
        }
      } catch (emailError) {
        console.error(
          "❌ [EMAIL] Unexpected error in email process:",
          emailError,
        );
      }
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
      confirmed: "order_confirmed",
      preparing: "order_preparing",
      ready: "order_ready",
      cancelled: "order_cancelled",
      refunded: "order_refunded",
      pending: "",
      completed: "",
    };

    const notificationType = notificationTypes[status];

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

    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 },
    );
  }
}
