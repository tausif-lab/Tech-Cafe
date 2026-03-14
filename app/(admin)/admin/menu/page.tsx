"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MenuItem, Category } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import MenuItemModal from "@/app/components/admin/MenuItemModal";

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cafeId, setCafeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<MenuItem | null | "new">(
    "new" as any,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");

  const supabase = createClient();

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("cafe_id")
      .eq("id", user.id)
      .single();
    if (!profile?.cafe_id) return;
    setCafeId(profile.cafe_id);

    const [itemsRes, catsRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select("*, variants(*), add_ons(*), category:categories(name)")
        .eq("cafe_id", profile.cafe_id)
        .is("deleted_at", null)
        .order("sort_order"),
      supabase
        .from("categories")
        .select("*")
        .eq("cafe_id", profile.cafe_id)
        .is("deleted_at", null)
        .order("sort_order"),
    ]);
    setItems(itemsRes.data ?? []);
    setCategories(catsRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function toggleAvailable(item: MenuItem) {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, is_available: !i.is_available } : i,
      ),
    );
    toast.success(
      item.is_available ? "Marked as unavailable" : "Marked as available",
    );
  }

  async function deleteItem(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const { error } = await supabase
      .from("menu_items")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast.success("Item deleted");
  }

  const filtered =
    filterCat === "all"
      ? items
      : items.filter((i) => i.category_id === filterCat);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Menu</h1>
          <p className="text-gray-400 mt-1">{items.length} items</p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setModalOpen(true);
          }}
          className="btn-gold flex items-center gap-2"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
        {[{ id: "all", name: "All" } as Category, ...categories].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all",
              filterCat === cat.id
                ? "bg-yellow-500 text-black border-yellow-500"
                : "border-zinc-800 text-gray-400",
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="px-5 py-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Item
                </th>
                <th className="px-5 py-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Category
                </th>
                <th className="px-5 py-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Price
                </th>
                <th className="px-5 py-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          item.is_veg ? "bg-green-500" : "bg-red-500",
                        )}
                      />
                      <span className="font-medium text-sm text-white">{item.name}</span>
                      {item.is_featured && (
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-sm">
                    {(item.category as any)?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-yellow-500 font-semibold text-sm">
                    {formatCurrency(item.base_price)}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleAvailable(item)}
                      className="flex items-center gap-1.5 text-sm transition-colors"
                    >
                      {item.is_available ? (
                        <>
                          <ToggleRight size={18} className="text-green-400" />
                          <span className="text-green-400">Available</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={18} className="text-gray-400" />
                          <span className="text-gray-400">Unavailable</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditItem(item);
                          setModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-gray-400 hover:text-white hover:bg-zinc-800 transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteItem(item)}
                        className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No items found
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <MenuItemModal
          item={editItem as MenuItem | null}
          cafeId={cafeId}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
