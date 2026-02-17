"use client";
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "./Cartcontext";
import { useRouter } from "next/navigation";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
    .cart-scroll::-webkit-scrollbar { display: none; }
  `}</style>
);

// ── Qty stepper ───────────────────────────────────────────────────────────────
function QtyStepper({ id, qty }: { id: string; qty: number }) {
  const { increment, decrement } = useCart();
  return (
    <div
      className="flex items-center gap-0"
      style={{ border: "1px solid rgba(232,225,207,0.15)", borderRadius: "2px" }}
    >
      <button
        onClick={() => decrement(id)}
        className="w-7 h-7 flex items-center justify-center text-[#E8E1CF]/60 hover:text-[#D94B4B] transition-colors"
        style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem" }}
        aria-label="decrease"
      >
        −
      </button>
      <span
        className="w-7 h-7 flex items-center justify-center text-[#E8E1CF] text-xs font-bold"
        style={{
          fontFamily: "'Syne', sans-serif",
          borderLeft: "1px solid rgba(232,225,207,0.12)",
          borderRight: "1px solid rgba(232,225,207,0.12)",
        }}
      >
        {qty}
      </span>
      <button
        onClick={() => increment(id)}
        className="w-7 h-7 flex items-center justify-center text-[#E8E1CF]/60 hover:text-[#2d9e2d] transition-colors"
        style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem" }}
        aria-label="increase"
      >
        +
      </button>
    </div>
  );
}

// ── Cart row ──────────────────────────────────────────────────────────────────
function CartRow({ item, index }: { item: ReturnType<typeof useCart>["items"][0]; index: number }) {
  const { removeItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 py-4"
      style={{ borderBottom: "1px solid rgba(232,225,207,0.08)" }}
    >
      {/* Image */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{ width: "52px", height: "52px", borderRadius: "2px" }}
      >
        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Category + code */}
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[8px] tracking-[0.4em] uppercase"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(232,225,207,0.25)" }}
          >
            {item.code}
          </span>
          <div
            className="w-1.5 h-1.5 rounded-sm border flex items-center justify-center flex-shrink-0"
            style={{ borderColor: item.veg ? "#2d9e2d" : "#D94B4B" }}
          >
            <div
              className="w-0.5 h-0.5 rounded-full"
              style={{ backgroundColor: item.veg ? "#2d9e2d" : "#D94B4B" }}
            />
          </div>
        </div>
        {/* Name */}
        <p
          className="text-sm font-extrabold uppercase truncate leading-tight"
          style={{ fontFamily: "'Syne', sans-serif", color: "#E8E1CF", letterSpacing: "-0.01em" }}
        >
          {item.name}
        </p>
        {/* Price × qty */}
        <p
          className="text-[10px] mt-0.5"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(232,225,207,0.4)" }}
        >
          ₹{item.price} × {item.quantity} ={" "}
          <span style={{ color: "#E8E1CF", fontWeight: 600 }}>₹{item.price * item.quantity}</span>
        </p>
      </div>

      {/* Right: stepper + remove */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <QtyStepper id={item.id} qty={item.quantity} />
        <button
          onClick={() => removeItem(item.id)}
          className="text-[8px] tracking-[0.35em] uppercase text-[#E8E1CF]/20 hover:text-[#D94B4B] transition-colors"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Remove
        </button>
      </div>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
      <span className="text-5xl opacity-30">🛒</span>
      <p
        className="text-[10px] tracking-[0.5em] uppercase text-center"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(232,225,207,0.2)" }}
      >
        Your tray is empty
      </p>
      <p
        className="text-xs text-center max-w-[160px] leading-relaxed"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(232,225,207,0.15)" }}
      >
        Head back to categories and pick something good.
      </p>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
interface AddToCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToCart({ isOpen, onClose }: AddToCartProps) {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const router = useRouter();
  const GST_RATE = 0.05;
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;

  const handleCheckout = () => {
    onClose();
    router.push("/billing");
  };

  return (
    <>
      <FontLoader />

      {/* ── Backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200]"
            style={{ backgroundColor: "rgba(31,58,46,0.5)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* ── Slide-in panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full z-[201] flex flex-col"
            style={{
              width: "clamp(320px, 38vw, 480px)",
              backgroundColor: "#1F3A2E",
              borderLeft: "2px solid rgba(232,225,207,0.12)",
            }}
          >
            {/* ── PANEL HEADER ── */}
            <div
              className="flex items-center justify-between px-6 py-5 flex-shrink-0"
              style={{ borderBottom: "2px solid rgba(232,225,207,0.1)" }}
            >
              {/* Left label */}
              <div>
                <p
                  className="text-[9px] tracking-[0.55em] uppercase mb-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(232,225,207,0.3)" }}
                >
                  Snack Bistro &bull; Your Tray
                </p>
                <h2
                  className="font-extrabold uppercase leading-none"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
                    letterSpacing: "-0.02em",
                    color: "#E8E1CF",
                  }}
                >
                  Cart
                  {totalItems > 0 && (
                    <span
                      className="ml-3 text-sm font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "#D94B4B",
                        color: "#E8E1CF",
                        fontSize: "0.7rem",
                        letterSpacing: "0.02em",
                        verticalAlign: "middle",
                      }}
                    >
                      {totalItems}
                    </span>
                  )}
                </h2>
              </div>

              {/* Close + Clear */}
              <div className="flex items-center gap-4">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[9px] tracking-[0.4em] uppercase transition-colors hover:text-[#D94B4B]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(232,225,207,0.25)" }}
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center transition-colors hover:text-[#D94B4B]"
                  style={{ color: "rgba(232,225,207,0.4)" }}
                  aria-label="Close cart"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── CATEGORY GROUP LABEL ROW (if items present) ── */}
            {items.length > 0 && (
              <div
                className="px-6 py-2 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(232,225,207,0.06)" }}
              >
                <div className="flex flex-wrap gap-2">
                  {[...new Set(items.map((i) => i.categoryName))].map((cat) => (
                    <span
                      key={cat}
                      className="text-[8px] tracking-[0.4em] uppercase px-2.5 py-1"
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: "#D94B4B",
                        border: "1px solid rgba(217,75,75,0.25)",
                        borderRadius: "2px",
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── ITEMS LIST ── */}
            <div className="flex-1 overflow-y-auto cart-scroll px-6">
              {items.length === 0 ? (
                <EmptyCart />
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <CartRow key={item.id} item={item} index={index} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* ── BILLING SUMMARY + CTA ── */}
            {items.length > 0 && (
              <div
                className="flex-shrink-0 px-6 py-5"
                style={{ borderTop: "2px solid rgba(232,225,207,0.1)" }}
              >
                {/* Line items */}
                <div className="flex flex-col gap-2 mb-4">
                  {[
                    { label: "Subtotal", value: `₹${subtotal}` },
                    { label: `GST (5%)`, value: `₹${gst}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span
                        className="text-[10px] tracking-[0.35em] uppercase"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(232,225,207,0.3)" }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ fontFamily: "'Syne', sans-serif", color: "rgba(232,225,207,0.5)" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}

                  {/* Divider */}
                  <div style={{ borderTop: "1px solid rgba(232,225,207,0.1)", margin: "4px 0" }} />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] tracking-[0.35em] uppercase"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(232,225,207,0.5)" }}
                    >
                      Total
                    </span>
                    <span
                      className="text-xl font-extrabold"
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        color: "#E8E1CF",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{total}
                    </span>
                  </div>
                </div>

                {/* Proceed to Billing CTA */}
                <button
                  onClick={handleCheckout}
                  className="group w-full py-3.5 flex items-center justify-center gap-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-200 hover:bg-[#D94B4B]"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    backgroundColor: "#D94B4B",
                    color: "#E8E1CF",
                    borderRadius: "2px",
                  }}
                >
                  Proceed to Billing
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className="group-hover:translate-x-1 transition-transform duration-200">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Fine print */}
                <p
                  className="text-center mt-3 text-[8px] tracking-[0.3em] uppercase"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(232,225,207,0.15)" }}
                >
                  ⚡ Ready in ~12 min &bull; GEC Campus only
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}