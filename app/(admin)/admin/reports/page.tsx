"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Download, TrendingUp, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

interface ReportOrder {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_status: string;
  slot_date: string;
  slot_time: string;
  order_items: {
    item_name: string;
    quantity: number;
    total_price: number;
    category_name: string; // ADD THIS
    category_id: string; // ADD THIS
  }[];
}

// ADD these new interfaces
interface CategoryAnalytics {
  category_id: string;
  category_name: string;
  total_revenue: number;
  order_count: number;
  item_count: number;
  percentage: number;
}

interface TimeSlotAnalytics {
  slot_time: string;
  order_count: number;
  revenue: number;
}

interface DailyTrend {
  date: string;
  revenue: number;
  orders: number;
}

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<ReportOrder[]>([]);
  const [cafeId, setCafeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"today" | "week" | "month">("month");
  const [categoryAnalytics, setCategoryAnalytics] = useState<
    CategoryAnalytics[]
  >([]);
  const [timeSlotAnalytics, setTimeSlotAnalytics] = useState<
    TimeSlotAnalytics[]
  >([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [topItems, setTopItems] = useState<
    { name: string; quantity: number; revenue: number }[]
  >([]);

  const supabase = createClient();

  async function load(r: typeof range) {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("cafe_id")
      .eq("id", user!.id)
      .single();
    if (!profile?.cafe_id) return;
    setCafeId(profile.cafe_id);

    const now = new Date();
    let from: string;
    if (r === "today") {
      from = now.toISOString().split("T")[0];
    } else if (r === "week") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      from = d.toISOString();
    } else {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      from = d.toISOString();
    }

    // Fetch orders - simplified query without nested relations
    const { data } = await supabase
      .from("orders")
      .select(
        `
    id,
    order_number, 
    created_at, 
    status, 
    total_amount, 
    payment_status, 
    slot_date, 
    slot_time,
    order_items(
      item_name, 
      quantity, 
      total_price,
      menu_item_id,
      cafe_id
    )
  `,
      )
      .eq("cafe_id", profile.cafe_id)
      .gte("created_at", from)
      .not("status", "in", "(cancelled,refunded)") // Changed from payment_status filter
      .order("created_at", { ascending: false });

    // Fetch all menu items with categories for this cafe
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select(
        `
    id,
    category_id,
    categories(id, name)
  `,
      )
      .eq("cafe_id", profile.cafe_id);

    // Create a lookup map for category info
    const categoryLookup = new Map<
      string,
      { category_id: string; category_name: string }
    >();
    menuItems?.forEach((item) => {
      const category = Array.isArray(item.categories)
        ? item.categories[0]
        : item.categories;
      if (item.category_id && category) {
        categoryLookup.set(item.id, {
          category_id: category.id,
          category_name: category.name,
        });
      }
    });
    // Transform data to include category info from lookup
    const transformedOrders =
      (data as any)?.map((order: any) => ({
        ...order,
        order_items: order.order_items.map((item: any) => {
          const categoryInfo = item.menu_item_id
            ? categoryLookup.get(item.menu_item_id)
            : null;

          return {
            item_name: item.item_name,
            quantity: item.quantity,
            total_price: item.total_price,
            category_id: categoryInfo?.category_id || "uncategorized",
            category_name: categoryInfo?.category_name || "Uncategorized",
          };
        }),
      })) ?? [];

    // Remove duplicates before setting state
    const uniqueOrders = transformedOrders.reduce(
      (acc: ReportOrder[], order: ReportOrder) => {
        if (!acc.find((o) => o.id === order.id)) {
          acc.push(order);
        }
        return acc;
      },
      [],
    );

    setOrders(uniqueOrders); // Changed from transformedOrders to uniqueOrders

    // Calculate analytics
    calculateAnalytics(uniqueOrders, r); // Also change this from transformedOrders to uniqueOrders
    setLoading(false);
  }

  function calculateAnalytics(
    ordersData: ReportOrder[],
    rangeType: typeof range,
  ) {
    // Category-wise analytics
    const categoryMap = new Map<string, CategoryAnalytics>();
    const itemMap = new Map<string, { quantity: number; revenue: number }>();
    const slotMap = new Map<string, { count: number; revenue: number }>();
    const dateMap = new Map<string, { revenue: number; count: number }>();

    ordersData.forEach((order) => {
      // Time slot analytics
      const slotKey = order.slot_time || "No Slot";
      const slotData = slotMap.get(slotKey) || { count: 0, revenue: 0 };
      slotMap.set(slotKey, {
        count: slotData.count + 1,
        revenue: slotData.revenue + Number(order.total_amount),
      });

      // Daily trends
      const dateKey = new Date(order.created_at).toISOString().split("T")[0];
      const dateData = dateMap.get(dateKey) || { revenue: 0, count: 0 };
      dateMap.set(dateKey, {
        revenue: dateData.revenue + Number(order.total_amount),
        count: dateData.count + 1,
      });

      // Process order items for category and item analytics
      order.order_items.forEach((item) => {
        const catId = item.category_id || "uncategorized";
        const catName = item.category_name || "Uncategorized";

        // Category analytics
        const existing = categoryMap.get(catId) || {
          category_id: catId,
          category_name: catName,
          total_revenue: 0,
          order_count: 0,
          item_count: 0,
          percentage: 0,
        };
        categoryMap.set(catId, {
          ...existing,
          total_revenue: existing.total_revenue + Number(item.total_price),
          order_count: existing.order_count + 1,
          item_count: existing.item_count + item.quantity,
        });

        // Top items analytics
        const itemData = itemMap.get(item.item_name) || {
          quantity: 0,
          revenue: 0,
        };
        itemMap.set(item.item_name, {
          quantity: itemData.quantity + item.quantity,
          revenue: itemData.revenue + Number(item.total_price),
        });
      });
    });

    // Calculate category percentages
    const totalRevenue = ordersData.reduce(
      (s, o) => s + Number(o.total_amount),
      0,
    );
    const categories = Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        percentage:
          totalRevenue > 0 ? (cat.total_revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue);

    // Top items
    const items = Array.from(itemMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Time slots
    const slots = Array.from(slotMap.entries())
      .map(([slot_time, data]) => ({
        slot_time,
        order_count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Daily trends
    const trends = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setCategoryAnalytics(categories);
    setTopItems(items);
    setTimeSlotAnalytics(slots);
    setDailyTrends(trends);
    console.log('Daily Trends:', trends)
    console.log('Category Analytics:', categories)
  }
  useEffect(() => {
    load(range);
  }, [range]);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  function exportCSV() {
    const rows = [
      [
        "Order #",
        "Date",
        "Status",
        "Slot Date",
        "Slot Time",
        "Items",
        "Category",
        "Total (₹)",
      ],
      ...orders.flatMap((o) =>
        o.order_items.map((item) => [
          o.order_number,
          new Date(o.created_at).toLocaleString("en-IN"),
          o.status,
          o.slot_date ?? "",
          o.slot_time ?? "",
          `${item.quantity}x ${item.item_name}`,
          item.category_name,
          String(item.total_price),
        ]),
      ),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tech-cafe-analytics-${range}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics CSV downloaded!");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">
            Reports
          </h1>
          <p className="text-gray-400 mt-1">Paid orders only</p>
        </div>
        <button
          onClick={exportCSV}
          className="btn-outline flex items-center gap-2"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Range selector */}
      <div className="flex gap-2 mb-6">
        {(["today", "week", "month"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize
              ${range === r ? "bg-yellow-500 text-black border-yellow-500" : "border-zinc-800 text-gray-400"}`}
          >
            {r === "today"
              ? "Today"
              : r === "week"
                ? "Last 7 days"
                : "This month"}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(totalRevenue),
            icon: TrendingUp,
          },
          {
            label: "Total Orders",
            value: String(totalOrders),
            icon: ShoppingBag,
          },
          {
            label: "Avg Order Value",
            value: formatCurrency(avgOrderValue),
            icon: TrendingUp,
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-gray-400 text-xs mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-yellow-500">{stat.value}</p>
          </div>
        ))}
      </div>
      {/* Category Performance */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">
          Category Performance
        </h2>
        <div className="space-y-3">
          {categoryAnalytics.map((cat) => (
            <div key={cat.category_id} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-white">
                    {cat.category_name}
                  </span>
                  <span className="text-sm text-gray-400">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-yellow-500">
                  {formatCurrency(cat.total_revenue)}
                </p>
                <p className="text-xs text-gray-400">
                  {cat.item_count} items sold
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Items & Peak Hours Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Top Selling Items */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Top Selling Items
          </h2>
          <div className="space-y-3">
            {topItems.slice(0, 5).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-500">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.quantity} sold</p>
                </div>
                <p className="text-sm font-bold text-yellow-500">
                  {formatCurrency(item.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Peak Hours</h2>
          <div className="space-y-3">
            {timeSlotAnalytics.slice(0, 5).map((slot) => (
              <div
                key={slot.slot_time}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {slot.slot_time}
                  </p>
                  <p className="text-xs text-gray-400">
                    {slot.order_count} orders
                  </p>
                </div>
                <p className="text-sm font-bold text-yellow-500">
                  {formatCurrency(slot.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trends Chart (only for week/month view) 
      {range !== "today" && dailyTrends.length > 1 && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Revenue Trend</h2>
          {dailyTrends.length === 0 ? (
    <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
      No data available for this period
    </div>
  ) : (
          <div className="h-48 flex items-end gap-1">
            {dailyTrends.map(day => {
  const maxRevenue = Math.max(...dailyTrends.map(d => d.revenue))
  const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
  const minHeight = day.revenue > 0 ? Math.max(height, 5) : 0  // Add minimum 5% height for visibility
  return (
    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
      <div className="relative group flex-1 w-full flex items-end">
        <div 
          className="w-full bg-yellow-500 rounded-t hover:bg-yellow-400 transition-all cursor-pointer min-h-[4px]"
          style={{height: `${minHeight}%`}}
          title={`${new Date(day.date).toLocaleDateString('en-IN')}: ${formatCurrency(day.revenue)}`}
        />
      </div>
      <span className="text-xs text-gray-400">
        {new Date(day.date).getDate()}
      </span>
    </div>
  )
})}
          </div>
  )}
        </div>
      )}*/}

      {/* Daily Trends Chart (only for week/month view) */}
{range !== "today" && dailyTrends.length > 0 && (
  <div className="card p-6 mb-8">
    <h2 className="text-xl font-bold text-white mb-4">Revenue Trend</h2>
    <div className="h-48 flex items-end gap-1">
      {dailyTrends.map(day => {
        const maxRevenue = Math.max(...dailyTrends.map(d => d.revenue))
        const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
        const minHeight = day.revenue > 0 ? Math.max(height, 5) : 0
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative group flex-1 w-full flex items-end">
              <div 
                className="w-full bg-yellow-500 rounded-t hover:bg-yellow-400 transition-all cursor-pointer min-h-[4px]"
                style={{height: `${minHeight}%`}}
                title={`${new Date(day.date).toLocaleDateString('en-IN')}: ${formatCurrency(day.revenue)}`}
              />
            </div>
            <span className="text-xs text-gray-400">
              {new Date(day.date).getDate()}
            </span>
          </div>
        )
      })}
    </div>
  </div>
)}

      {/* Orders table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No paid orders in this period
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Order #", "Date", "Items", "Total"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-gray-400 text-xs font-medium uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-900/50">
                  <td className="px-5 py-3 font-mono font-bold text-yellow-500">
                    {o.order_number}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(o.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs max-w-xs truncate">
                    {o.order_items
                      .map((i) => `${i.quantity}× ${i.item_name}`)
                      .join(", ")}
                  </td>
                  <td className="px-5 py-3 font-semibold text-white">
                    {formatCurrency(Number(o.total_amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
