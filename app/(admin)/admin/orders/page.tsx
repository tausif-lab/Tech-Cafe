"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order } from "@/types";
import {
  formatCurrency,
  formatTime,
  formatDate,
  getOrderStatusInfo,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  ChefHat,
  Bell,
  Package,
  Search,
} from "lucide-react";

const STATUS_FLOW: Record<string, string> = {
  confirmed: "preparing",
  preparing: "ready",
  ready: "completed",
};

const NEXT_ACTION: Record<
  string,
  { label: string; icon: typeof ChefHat; color: string }
> = {
  confirmed: {
    label: "Start Preparing",
    icon: ChefHat,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  preparing: {
    label: "Mark Ready",
    icon: Bell,
    color: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  ready: {
    label: "Mark Completed",
    icon: Package,
    color: "bg-zinc-800 text-gray-400 border-zinc-700",
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [search, setSearch] = useState("");
  const [cafeId, setCafeId] = useState<string>("");
  const supabase = createClient();

  async function fetchOrders() {
    try {
      const statusParam =
        filter === "active" ? "status=pending,confirmed,preparing,ready" : "";

      const response = await fetch(`/api/admin/orders?${statusParam}`);
      const result = await response.json();

      if (result.data) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCafeId() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("cafe_id")
      .eq("id", user.id)
      .single();
    if (profile?.cafe_id) {
      setCafeId(profile.cafe_id);
    }
  }

  useEffect(() => {
    loadCafeId();
  }, []);

  useEffect(() => {
    if (!cafeId) return;
    fetchOrders();

    const channel = supabase
      .channel("admin-orders-page")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `cafe_id=eq.${cafeId}`,
        },
        () => fetchOrders(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId, filter]);

  async function updateStatus(
    orderId: string,
    status: string,
    reason?: string,
  ) {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });

      const result = await response.json();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Order updated to ${status}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleReject(orderId: string) {
    const reason = prompt("Rejection reason (shown to customer):");
    if (reason === null) return;
    await updateStatus(
      orderId,
      "cancelled",
      reason || "Order rejected by cafe",
    );

    const order = orders.find((o) => o.id === orderId);
    if (order?.slot_id) {
      await supabase.rpc("release_slot", { p_slot_id: order.slot_id });
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.order_items?.some((item) =>
        item.item_name.toLowerCase().includes(searchLower),
      )
    );
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const activeCount = orders.filter((o) =>
    ["pending", "confirmed", "preparing", "ready"].includes(o.status),
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 mt-1">
            {pendingCount > 0 && (
              <span className="text-yellow-500 font-semibold">
                {pendingCount} pending •{" "}
              </span>
            )}
            {activeCount} active orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("active")}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
              filter === "active"
                ? "bg-yellow-500 text-black border-yellow-500"
                : "border-zinc-800 text-gray-400 hover:text-white",
            )}
          >
            Active Orders
          </button>
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
              filter === "all"
                ? "bg-yellow-500 text-black border-yellow-500"
                : "border-zinc-800 text-gray-400 hover:text-white",
            )}
          >
            All Orders
          </button>
        </div>

        <div className="flex-1 max-w-md relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by order # or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500/50"
          />
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-400">
            {search ? "No orders match your search" : "No orders found"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusInfo = getOrderStatusInfo(order.status);
            const nextAction = NEXT_ACTION[order.status];
            const isPending = order.status === "pending";

            return (
              <div
                key={order.id}
                className={cn(
                  "bg-zinc-900 border rounded-2xl p-5 transition-all",
                  isPending
                    ? "border-yellow-500/40 shadow-lg shadow-yellow-500/10"
                    : "border-zinc-800",
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white text-lg">
                        {order.order_number}
                      </p>
                      {isPending && (
                        <span className="text-[10px] bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 space-y-0.5">
                      <p>
                        {formatDate(order.created_at)} •{" "}
                        {formatTime(order.created_at)}
                      </p>
                      {order.slot_date && order.slot_time && (
                        <p className="text-yellow-500 font-medium">
                          Pickup: {formatDate(order.slot_date)} at{" "}
                          {formatTime(order.slot_time)}
                        </p>
                      )}
                    {/* {order.order_type && (
                        <p className="capitalize">{order.order_type}</p>
                      )}*/}
                      {(order as any).order_type && (
  <p className="capitalize">{(order as any).order_type}</p>
)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "text-xs font-medium px-3 py-1.5 rounded-full inline-block mb-2",
                        statusInfo.bg,
                        statusInfo.color,
                      )}
                    >
                      {statusInfo.label}
                    </span>
                    <p className="text-yellow-500 font-bold text-xl">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {order.payment_status === "paid"
                        ? "Paid"
                        : "Cash on pickup"}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-black/30 rounded-xl p-4 mb-4">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                    Order Items
                  </p>
                  <div className="space-y-2">
                    {(order.order_items ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 font-bold">
                            {item.quantity}×
                          </span>
                          <span className="text-white">{item.item_name}</span>
                          {item.variant_name && (
                            <span className="text-gray-500 text-xs">
                              ({item.variant_name})
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400">
                          {formatCurrency(item.total_price)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {order.notes && (
                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <p className="text-gray-400 text-xs font-medium mb-1">
                        Special Instructions:
                      </p>
                      <p className="text-white text-sm">{order.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, "confirmed")}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all"
                      >
                        <CheckCircle size={16} />
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleReject(order.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all"
                      >
                        <XCircle size={16} />
                        Reject Order
                      </button>
                    </>
                  ) : nextAction &&
                    order.status !== "completed" &&
                    order.status !== "cancelled" ? (
                    <button
                      onClick={() =>
                        updateStatus(order.id, STATUS_FLOW[order.status])
                      }
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all hover:opacity-80",
                        nextAction.color,
                      )}
                    >
                      <nextAction.icon size={16} />
                      {nextAction.label}
                    </button>
                  ) : null}
                </div>

                {order.rejection_reason && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-xs font-medium mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-red-300 text-sm">
                      {order.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
