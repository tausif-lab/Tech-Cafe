import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "../../../lib/utils";
import { ShoppingBag, TrendingUp, Clock, CheckCircle } from "lucide-react";
import AdminOrdersLive from "@/app/components/admin/AdminOrdersLive";

async function getStats(cafeId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  ).toISOString();

  const [allTodayOrders, allMonthOrders, pending] = await Promise.all([
    // ALL today's orders (paid + cash)
    supabase
      .from("orders")
      .select("total_amount, status, payment_status")
      .eq("cafe_id", cafeId)
      .gte("created_at", today)
      .not("status", "in", "(cancelled,refunded)"),  // Exclude cancelled/refunded
    
    // ALL month's orders (paid + cash)
    supabase
      .from("orders")
      .select("total_amount, status, payment_status")
      .eq("cafe_id", cafeId)
      .gte("created_at", monthStart)
      .not("status", "in", "(cancelled,refunded)"),
    
    // Active orders
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("cafe_id", cafeId)
      .in("status", ["pending", "confirmed", "preparing", "ready" , "completed"]),
  ]);

  // Separate paid vs pending revenue
  const todayPaidRevenue = allTodayOrders.data
    ?.filter((o: any) => o.payment_status === "completed")
    .reduce((s: number, o: any) => s + Number(o.total_amount), 0) ?? 0;

  const todayPendingRevenue = allTodayOrders.data
    ?.filter((o: any) => o.payment_status === "pending")
    .reduce((s: number, o: any) => s + Number(o.total_amount), 0) ?? 0;

  const totalTodayRevenue = todayPaidRevenue + todayPendingRevenue;

  const completedToday = allTodayOrders.data?.filter(
    (o: any) => o.status === "completed"
  ).length ?? 0;

  return {
    today_orders: allTodayOrders.data?.length ?? 0,
    today_revenue: totalTodayRevenue,
    today_paid_revenue: todayPaidRevenue,
    today_pending_revenue: todayPendingRevenue,
    completed_today: completedToday,
    month_orders: allMonthOrders.data?.length ?? 0,
    month_revenue: allMonthOrders.data?.reduce(
      (s: number, o: any) => s + Number(o.total_amount),
      0,
    ) ?? 0,
    pending_orders: pending.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("cafe_id")
    .eq("id", user!.id)
    .single();

  const stats = await getStats(profile!.cafe_id!);

  const STATS = [
  {
    label: "Today's Orders",
    value: stats.today_orders,
    icon: ShoppingBag,
    sub: `${stats.completed_today} completed`,
  },
  {
    label: "Today's Revenue",
    value: formatCurrency(stats.today_revenue),
    icon: TrendingUp,
    sub: `₹${stats.today_pending_revenue.toFixed(0)} completed`,
  },
  {
    label: "Active Orders",
    value: stats.pending_orders,
    icon: Clock,
    sub: "need attention",
  },
  {
    label: "Month's Revenue",
    value: formatCurrency(stats.month_revenue),
    icon: CheckCircle,
    sub: `${stats.month_orders} orders`,
  },
];

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <stat.icon size={16} className="text-yellow-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Live orders */}
      <AdminOrdersLive cafeId={profile!.cafe_id!} />
    </div>
  );
}
