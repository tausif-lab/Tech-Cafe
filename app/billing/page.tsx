"use client";
import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useCart } from "@/app/components/usermenu/Cartcontext";
import { useRouter } from "next/navigation";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
    .bill-scroll::-webkit-scrollbar { display: none; }
  `}</style>
);

// ── Constants ─────────────────────────────────────────────────────────────────
const GST_RATE = 0.05;
const PLATFORM_FEE = 10;

const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI",
    icon: "📲",
    description: "Google Pay, PhonePe, Paytm",
  },

  { id: "cash", label: "Cash", icon: "💵", description: "Pay at counter" },
];

// ── Bill line row ─────────────────────────────────────────────────────────────
function BillRow({
  item,
  index,
}: {
  item: ReturnType<typeof useCart>["items"][0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex items-center gap-4 py-4"
      style={{ borderBottom: "1px solid rgba(232,225,207,0.08)" }}
    >
      {/* Image */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{ width: "48px", height: "48px", borderRadius: "2px" }}
      >
        <img
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[8px] tracking-[0.4em] uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(232,225,207,0.22)",
            }}
          >
            {item.code}
          </span>
          <span
            className="text-[8px] tracking-[0.35em] uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(217,75,75,0.6)",
            }}
          >
            {item.categoryName}
          </span>
        </div>
        <p
          className="text-sm font-extrabold uppercase truncate"
          style={{
            fontFamily: "'Syne', sans-serif",
            color: "#E8E1CF",
            letterSpacing: "-0.01em",
          }}
        >
          {item.name}
        </p>
      </div>

      {/* Qty × Price = Total */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className="text-[10px] tracking-[0.3em]"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "rgba(232,225,207,0.3)",
          }}
        >
          ×{item.quantity}
        </span>
        <span
          className="text-sm font-bold"
          style={{ fontFamily: "'Syne', sans-serif", color: "#E8E1CF" }}
        >
          ₹{item.price * item.quantity}
        </span>
      </div>
    </motion.div>
  );
}

// ── Payment method selector ───────────────────────────────────────────────────
function PaymentSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PAYMENT_METHODS.map((method) => {
        const isActive = selected === method.id;
        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className="relative flex flex-col items-start p-4 text-left transition-all duration-200"
            style={{
              backgroundColor: isActive
                ? "rgba(217,75,75,0.12)"
                : "rgba(232,225,207,0.04)",
              border: `2px solid ${isActive ? "#D94B4B" : "rgba(232,225,207,0.1)"}`,
              borderRadius: "2px",
              transition: "all 0.2s ease",
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="payment-indicator"
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ backgroundColor: "#D94B4B" }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="text-xl mb-2">{method.icon}</span>
            <span
              className="text-sm font-extrabold uppercase block"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: isActive ? "#E8E1CF" : "rgba(232,225,207,0.5)",
                letterSpacing: "-0.01em",
              }}
            >
              {method.label}
            </span>
            <span
              className="text-[9px] mt-0.5"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: isActive
                  ? "rgba(232,225,207,0.45)"
                  : "rgba(232,225,207,0.2)",
              }}
            >
              {method.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Success overlay ───────────────────────────────────────────────────────────
function SuccessOverlay({
  onTrackOrder,
  onHome,
}: {
  onTrackOrder: () => void;
  onHome: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ backgroundColor: "#1F3A2E" }}
    >
      <div className="flex flex-col items-center gap-6 text-center px-8">
        {/* <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl"
        >
          ✅
        </motion.div> */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <p
            className="text-[10px] tracking-[0.55em] uppercase mb-3"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(232,225,207,0.35)",
            }}
          >
            Tech cafe &bull; Order Placed
          </p>
          <h2
            className="font-extrabold uppercase leading-none"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              letterSpacing: "-0.03em",
              color: "#E8E1CF",
            }}
          >
            Order
            <br />
            <span style={{ color: "#D94B4B" }}> Placed!</span>
          </h2>
          <p
            className="text-sm mt-4 max-w-xs mx-auto leading-relaxed"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(232,225,207,0.4)",
            }}
          >
            Your food will be ready soon 
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
          className="mt-4 flex flex-col sm:flex-row items-center gap-3"
        >
          <button
            onClick={onTrackOrder}
            className="px-8 py-3 text-[10px] font-bold tracking-widest uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backgroundColor: "#D94B4B",
              color: "#E8E1CF",
              borderRadius: "2px",
            }}
          >
            Track Order
          </button>
          <button
            onClick={onHome}
            className="px-8 py-3 text-[10px] font-bold tracking-widest uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backgroundColor: "transparent",
              color: "#E8E1CF",
              border: "1px solid rgba(232,225,207,0.35)",
              borderRadius: "2px",
            }}
          >
            Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function BillingPage() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, {
    once: true,
    margin: "-40px 0px",
  });
  const { items, subtotal, totalItems, clearCart } = useCart();
  const router = useRouter();

  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst + PLATFORM_FEE;

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      // Convert cart items to API format
      const orderItems = items.map((item) => ({
        menu_item_id: null, // Will be null until we have real menu items
        name: item.name,
        image_url: item.img,
        is_veg: item.veg,
        base_price: item.price,
        variant_id: null,
        variant_name: null,
        variant_price_delta: 0,
        add_ons: [],
        add_ons_total: 0,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      // Create order (payment disabled for demo)
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          paymentMethod: "cash", // Default to cash for demo
          notes: null,
        }),
      });

      const orderResult = await orderResponse.json();

      if (orderResult.error) {
        alert("Failed to create order: " + orderResult.error);
        setLoading(false);
        return;
      }

      const { orderId: newOrderId } = orderResult.data;
      setOrderId(newOrderId);

      // Simulate processing delay
      await new Promise((r) => setTimeout(r, 1000));

      setOrderPlaced(true);
      setLoading(false);

      /* ═══════════════════════════════════════════════════════════
         RAZORPAY PAYMENT INTEGRATION (DISABLED FOR DEMO)
         
         Uncomment this section when you have Razorpay KYC approved:
         
      // If cash payment, mark as complete
      if (selectedPayment === 'cash') {
        setOrderPlaced(true);
        setLoading(false);
        return;
      }
      
      // Otherwise, initiate Razorpay payment
      const paymentResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: newOrderId })
      });
      
      const paymentResult = await paymentResponse.json();
      
      if (paymentResult.error) {
        alert('Failed to create payment: ' + paymentResult.error);
        setLoading(false);
        return;
      }
      
      const { razorpayOrderId, cafeName, orderNumber, amount } = paymentResult.data;
      
      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: amount * 100,
        currency: 'INR',
        name: cafeName,
        description: `Order ${orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          // Verify payment
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: newOrderId
            })
          });
          
          const verifyResult = await verifyResponse.json();
          
          if (verifyResult.error) {
            alert('Payment verification failed: ' + verifyResult.error);
            setLoading(false);
            return;
          }
          
          setOrderPlaced(true);
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };
      
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
      ═══════════════════════════════════════════════════════════ */
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert("Error placing order: " + message);
      setLoading(false);
    }
  };

  const handleTrackOrder = () => {
    clearCart();
    if (orderId) {
      router.push(`/orders/${orderId}`);
    } else {
      router.push("/orders");
    }
  };

  const handleHome = () => {
    clearCart();
    router.push("/");
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <>
        <FontLoader />
        <section
          className="min-h-screen flex flex-col items-center justify-center gap-6"
          style={{ backgroundColor: "#1F3A2E" }}
        >
          <span className="text-5xl opacity-30">🛒</span>
          <p
            className="text-[10px] tracking-[0.55em] uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(232,225,207,0.25)",
            }}
          >
            No items in your tray
          </p>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-6 py-3 text-[9px] font-bold tracking-widest uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backgroundColor: "#D94B4B",
              color: "#E8E1CF",
              borderRadius: "2px",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Menu
          </button>
        </section>
      </>
    );
  }

  return (
    <>
      <FontLoader />

      {orderPlaced && (
        <SuccessOverlay onTrackOrder={handleTrackOrder} onHome={handleHome} />
      )}

      <section
        className="relative min-h-screen overflow-hidden"
        style={{ backgroundColor: "#1F3A2E" }}
      >
        {/* ── TOP HEADER — mirrors menu.tsx header exactly ── */}
        <div
          ref={headerRef}
          className="px-6 md:px-12 pt-20 pb-10"
          style={{ borderBottom: "2px solid rgba(232,225,207,0.12)" }}
        >
          <div className="max-w-screen-xl mx-auto flex items-end justify-between gap-8 flex-wrap">
            {/* Left: breadcrumb */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
              className="text-[10px] tracking-[0.5em] uppercase self-start mt-1"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(232,225,207,0.3)",
              }}
            >
              Snack Bistro &bull; Menu &bull;{" "}
              <span style={{ color: "#D94B4B" }}>Billing</span>
            </motion.p>

            {/* Centre: Big title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-extrabold uppercase leading-none flex-1"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(3.5rem, 10vw, 8.5rem)",
                letterSpacing: "-0.03em",
                lineHeight: 0.92,
                color: "#E8E1CF",
              }}
            >
              Your
              <br />
              <span style={{ color: "#D94B4B" }}>Bill</span>
            </motion.h1>

            {/* Right: summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="self-end max-w-[220px]"
            >
              <p
                className="text-sm leading-relaxed mb-3"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.4)",
                }}
              >
                Review your order and choose how you want to pay.
              </p>
              <span
                className="text-[9px] tracking-[0.4em] uppercase px-3 py-1.5"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "#D94B4B",
                  border: "1px solid rgba(217,75,75,0.35)",
                  borderRadius: "2px",
                }}
              >
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
            </motion.div>
          </div>
        </div>

        {/* ── ITEM CODE LABELS ROW — mirrors menu.tsx code label strip ── */}
        <div style={{ borderBottom: "2px solid rgba(232,225,207,0.1)" }}>
          <div className="flex overflow-x-auto bill-scroll">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="flex-shrink-0 px-5 py-3 text-[10px] tracking-[0.45em] uppercase whitespace-nowrap"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.2)",
                  borderRight:
                    i < items.length - 1
                      ? "1px solid rgba(232,225,207,0.08)"
                      : "none",
                  minWidth: "140px",
                }}
              >
                {item.code} ×{item.quantity}
              </div>
            ))}
          </div>
        </div>

        {/* ── TWO COLUMN LAYOUT: Items list | Bill summary ── */}
        <div
          className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px]"
          style={{ borderLeft: "2px solid rgba(232,225,207,0.08)" }}
        >
          {/* ── LEFT: itemised list ── */}
          <div style={{ borderRight: "2px solid rgba(232,225,207,0.08)" }}>
            <div className="px-6 md:px-10 py-8">
              {/* Section label */}
              <p
                className="text-[9px] tracking-[0.5em] uppercase mb-6"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.25)",
                }}
              >
                Order Summary
              </p>

              {/* Items */}
              <div>
                {items.map((item, index) => (
                  <BillRow key={item.id} item={item} index={index} />
                ))}
              </div>

              {/* Back link */}
              <button
                onClick={() => router.push("/")}
                className="group mt-8 flex items-center gap-2 text-[9px] tracking-[0.4em] uppercase transition-colors hover:text-[#E8E1CF]"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.25)",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="group-hover:-translate-x-1 transition-transform duration-200"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Edit Order
              </button>
            </div>
          </div>

          {/* ── RIGHT: billing summary + payment ── */}
          <div className="px-6 md:px-8 py-8 flex flex-col gap-8">
            {/* Price breakdown */}
            <div>
              <p
                className="text-[9px] tracking-[0.5em] uppercase mb-5"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.25)",
                }}
              >
                Bill Breakdown
              </p>

              <div className="flex flex-col gap-3">
                {[
                  { label: "Subtotal", value: `₹${subtotal}`, muted: true },
                  {
                    label: `GST (${GST_RATE * 100}%)`,
                    value: `₹${gst}`,
                    muted: true,
                  },
                  {
                    label: "Platform Fee",
                    value: `₹${PLATFORM_FEE}`,
                    muted: true,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span
                      className="text-[10px] tracking-[0.35em] uppercase"
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: "rgba(232,225,207,0.3)",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        color: "rgba(232,225,207,0.45)",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}

                {/* Total divider */}
                <div
                  style={{
                    borderTop: "2px solid rgba(232,225,207,0.1)",
                    paddingTop: "12px",
                  }}
                >
                  <div className="flex items-end justify-between">
                    <span
                      className="text-[10px] tracking-[0.5em] uppercase"
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: "rgba(232,225,207,0.5)",
                      }}
                    >
                      Total
                    </span>
                    <span
                      className="font-extrabold"
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "clamp(1.6rem, 3vw, 2rem)",
                        color: "#E8E1CF",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p
                className="text-[9px] tracking-[0.5em] uppercase mb-4"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.25)",
                }}
              >
                Payment Method
              </p>
              <PaymentSelector
                selected={selectedPayment}
                onSelect={setSelectedPayment}
              />
            </div>

            {/* Place Order CTA */}
            <div>
              <motion.button
                onClick={handlePlaceOrder}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 flex items-center justify-center gap-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  backgroundColor: loading ? "rgba(217,75,75,0.5)" : "#D94B4B",
                  color: "#E8E1CF",
                  borderRadius: "2px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <div
                      className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                      style={{
                        borderColor: "rgba(232,225,207,0.5)",
                        borderTopColor: "transparent",
                      }}
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order &bull; ₹{total}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </motion.button>

              <p
                className="text-center mt-3 text-[8px] tracking-[0.3em] uppercase"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.12)",
                }}
              >
                By placing your order you agree to our terms
              </p>
            </div>
          </div>
        </div>

        {/* ── BOTTOM STRIP — mirrors menu.tsx bottom strip ── */}
        <div
          className="px-6 md:px-12 py-5 flex items-center justify-between flex-wrap gap-4"
          style={{ borderTop: "2px solid rgba(232,225,207,0.1)" }}
        >
          <div className="flex items-center gap-6 flex-wrap">
            {["📍 GEC Campus", "⚡ Ready in ~12 min", "🔒 Secure Payment"].map(
              (t) => (
                <span
                  key={t}
                  className="text-[10px] tracking-[0.35em] uppercase"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: "rgba(232,225,207,0.2)",
                  }}
                >
                  {t}
                </span>
              ),
            )}
          </div>
          <span
            className="text-[9px] tracking-[0.4em] uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(232,225,207,0.15)",
            }}
          >
            Tech cafe &copy; 2025
          </span>
        </div>
      </section>
    </>
  );
}
