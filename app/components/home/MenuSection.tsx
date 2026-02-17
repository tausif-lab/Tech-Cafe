"use client";
import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation"
// ADD this import
import { useCart } from "../usermenu/Cartcontext";
import AddToCart from "../usermenu/Addtocart";
// ── Fonts ────────────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
    .ms-scroll::-webkit-scrollbar { display: none; }
  `}</style>
);

// ── Menu data ────────────────────────────────────────────────────────────────
// ── Menu data ────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    id: 1,
    name: "Mexican Pizza",
    code: "MX.01",
    label: "Spicy Special",
    price: "₹249",
    tag: "veg",
    emoji: "🍕",
    img: "/mexican-pizza.png",
    description:
      "Crispy base layered with refried beans, jalapeños, olives & molten cheese. A desi twist with bold Mexican vibes.",
    calories: "520 kcal",
    time: "12 min",
    toppings: ["Jalapeños", "Olives", "Cheese"],
    spice: 2,
  },
  {
    id: 2,
    name: "Paneer Sandwich",
    code: "PS.02",
    label: "Cafe Classic",
    price: "₹180",
    tag: "veg",
    emoji: "🥪",
    img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=700&q=85",
    description:
      "Grilled bread stuffed with spiced paneer, onions & capsicum. Crispy outside, soft and masaledar inside.",
    calories: "390 kcal",
    time: "8 min",
    toppings: ["Paneer", "Onion", "Capsicum"],
    spice: 1,
  },
  {
    id: 3,
    name: "Masala Dosa",
    code: "DS.03",
    label: "South Star",
    price: "₹120",
    tag: "veg",
    emoji: "🥞",
    img: "/dosa.png",
    description:
      "Golden crispy dosa filled with spiced potato masala. Served with coconut chutney & hot sambar. Pure comfort food.",
    calories: "340 kcal",
    time: "10 min",
    toppings: ["Potato Masala", "Chutney", "Sambar"],
    spice: 1,
  },
];


// ── Spice dots (reused from menu.tsx pattern) ─────────────────────────────────
function SpiceDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: i <= level ? "#D94B4B" : "rgba(31,58,46,0.15)",
          }}
        />
      ))}
    </div>
  );
}

// ── Individual card — editorial panel layout matching page.tsx CategoryPanel style ──
function MenuCard({ item, index, onCartOpen }: { item: typeof MENU_ITEMS[0]; index: number; onCartOpen: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });
  const [hovered, setHovered] = useState(false);
   const { addItem, items } = useCart();
const cartItem = items.find((i) => i.id === `menu-${item.id}`);
const qty = cartItem ? cartItem.quantity : 0;

const handleAddToCart = () => {
  addItem({
    id: `menu-${item.id}`,
    categoryId: 0,
    itemId: item.id,
    code: item.code,
    name: item.name,
    price: parseInt(item.price.replace("₹", "")),
    img: item.img,
    veg: item.tag === "veg",
    categoryName: "Customer Faves",
  });
  onCartOpen();
};

  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full flex flex-col md:flex-row overflow-hidden cursor-pointer"
      style={{
        border: "2px solid #1F3A2E",
        minHeight: "360px",
        backgroundColor: hovered ? "#1F3A2E" : "#E8E1CF",
        transition: "background-color 0.35s ease",
      }}
    >
      {/* ── TEXT SIDE ── */}
      <motion.div
        initial={{ x: isEven ? -40 : 40, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        className={`relative z-10 flex flex-col justify-between p-7 md:p-10 w-full md:w-1/2 ${!isEven ? "md:order-2" : ""}`}
      >
        {/* Top: code + badges */}
        <div>
          <div
            className="pb-3 mb-5"
            style={{ borderBottom: `1px solid ${hovered ? "rgba(232,225,207,0.12)" : "rgba(31,58,46,0.12)"}` }}
          >
            <span
              className="text-[10px] tracking-[0.45em] uppercase"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: hovered ? "rgba(232,225,207,0.35)" : "rgba(31,58,46,0.35)",
                transition: "color 0.35s ease",
              }}
            >
              {item.code}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span
              className="text-[9px] font-semibold tracking-widest uppercase px-3 py-1.5"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                backgroundColor: hovered ? "rgba(217,75,75,0.2)" : "rgba(217,75,75,0.1)",
                color: "#D94B4B",
                border: "1px solid rgba(217,75,75,0.3)",
                borderRadius: "2px",
                transition: "background-color 0.35s ease",
              }}
            >
              {item.label}
            </span>
            <span
              className="text-[9px] font-semibold tracking-widest uppercase px-3 py-1.5"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                backgroundColor: "transparent",
                color: hovered ? "rgba(232,225,207,0.5)" : "rgba(31,58,46,0.35)",
                border: `1px solid ${hovered ? "rgba(232,225,207,0.15)" : "rgba(31,58,46,0.15)"}`,
                borderRadius: "2px",
                transition: "all 0.35s ease",
              }}
            >
              {item.tag}
            </span>
          </div>

          {/* Name */}
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-2xl leading-none">{item.emoji}</span>
          </div>
          <h3
            className="font-extrabold uppercase leading-tight mb-4 tracking-tight"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              letterSpacing: "-0.02em",
              color: hovered ? "#E8E1CF" : "#1F3A2E",
              transition: "color 0.35s ease",
            }}
          >
            {item.name}
          </h3>

          {/* Description */}
          <p
            className="text-sm leading-relaxed mb-5 max-w-xs"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
              color: hovered ? "rgba(232,225,207,0.55)" : "rgba(31,58,46,0.55)",
              transition: "color 0.35s ease",
            }}
          >
            {item.description}
          </p>

          {/* Ingredient pills — matches menu.tsx toppings pattern */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {item.toppings.map((t) => (
              <span
                key={t}
                className="text-[9px] tracking-wider uppercase px-2.5 py-1"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  backgroundColor: hovered ? "rgba(232,225,207,0.08)" : "rgba(31,58,46,0.06)",
                  color: hovered ? "rgba(232,225,207,0.45)" : "rgba(31,58,46,0.4)",
                  border: `1px solid ${hovered ? "rgba(232,225,207,0.12)" : "rgba(31,58,46,0.12)"}`,
                  borderRadius: "2px",
                  transition: "all 0.35s ease",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Meta row */}
          <div
            className="flex items-center gap-3 text-[9px] tracking-[0.3em] uppercase mb-6"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: hovered ? "rgba(232,225,207,0.3)" : "rgba(31,58,46,0.3)",
              transition: "color 0.35s ease",
            }}
          >
            <span>⏱ {item.time}</span>
            <span
              className="w-px h-3"
              style={{ backgroundColor: hovered ? "rgba(232,225,207,0.15)" : "rgba(31,58,46,0.15)" }}
            />
            <span>🔥 {item.calories}</span>
            <span
              className="w-px h-3"
              style={{ backgroundColor: hovered ? "rgba(232,225,207,0.15)" : "rgba(31,58,46,0.15)" }}
            />
            <SpiceDots level={item.spice} />
          </div>
        </div>

        {/* Bottom: price + CTA */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span
            className="font-extrabold"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              color: hovered ? "#E8E1CF" : "#1F3A2E",
              transition: "color 0.35s ease",
            }}
          >
            {item.price}
          </span>

          <motion.button
  whileHover={{ scale: 1.04 }}
  whileTap={{ scale: 0.96 }}
  onClick={handleAddToCart}
  className="flex items-center gap-2 px-5 py-2.5 text-[9px] font-bold tracking-widest uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backgroundColor: hovered ? "#D94B4B" : "#1F3A2E",
              color: "#E8E1CF",
              borderRadius: "2px",
              transition: "background-color 0.35s ease",
            }}
          >
            {qty > 0 ? (
  <>
    In Tray
    <span
      className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold"
      style={{ backgroundColor: "rgba(232,225,207,0.25)", color: "#E8E1CF" }}
    >
      {qty}
    </span>
  </>
) : (
  <>
    Add to tray
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </>
)}
          </motion.button>
        </div>
      </motion.div>

      {/* ── IMAGE SIDE ── */}
      <motion.div
        initial={{ x: isEven ? 60 : -60, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        className={`relative w-full md:w-1/2 min-h-[260px] md:min-h-full overflow-hidden ${!isEven ? "md:order-1" : ""}`}
        style={{
          borderLeft: isEven ? `2px solid ${hovered ? "rgba(232,225,207,0.1)" : "#1F3A2E"}` : "none",
          borderRight: !isEven ? `2px solid ${hovered ? "rgba(232,225,207,0.1)" : "#1F3A2E"}` : "none",
          transition: "border-color 0.35s ease",
        }}
      >
        <img
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{
            minHeight: "260px",
            transform: hovered ? "scale(1.06) rotate(1deg)" : "scale(1) rotate(0deg)",
            transition: "transform 0.5s ease",
          }}
        />

        {/* Gradient blend into card bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(${isEven ? "to left" : "to right"}, transparent 45%, ${hovered ? "#1F3A2E" : "#E8E1CF"} 100%)`,
            transition: "background 0.35s ease",
          }}
        />

        {/* Large watermark index */}
        <span
          className="absolute bottom-4 right-5 font-extrabold leading-none select-none pointer-events-none"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(5rem, 10vw, 8rem)",
            opacity: 0.06,
            color: hovered ? "#E8E1CF" : "#1F3A2E",
            transition: "color 0.35s ease",
          }}
        >
          {String(item.id).padStart(2, "0")}
        </span>

        {/* Top-right tag on image */}
        <div
          className="absolute top-4 left-4 px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            backgroundColor: "#D94B4B",
            color: "#E8E1CF",
            borderRadius: "2px",
          }}
        >
          {item.label}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Section header — matches page.tsx header layout exactly ──────────────────
function SectionHeader() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <div
      ref={ref}
      className="px-6 md:px-12 pt-16 pb-10"
      style={{ borderBottom: "2px solid #1F3A2E" }}
    >
      <div className="max-w-screen-xl mx-auto flex items-end justify-between gap-8 flex-wrap">

        {/* Left: nav label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
          className="text-[10px] tracking-[0.5em] uppercase self-start mt-1"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "rgba(31,58,46,0.4)",
          }}
        >
          Tech cafe  &bull; What&apos;s Poppin&apos;
        </motion.p>

        {/* Centre: BIG title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="font-extrabold uppercase leading-none flex-1"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(3.5rem, 10vw, 8.5rem)",
            letterSpacing: "-0.03em",
            lineHeight: 0.92,
            color: "#1F3A2E",
          }}
        >
          Customer
          <br />
          <span style={{ color: "rgba(31,58,46,0.18)" }}>Faves </span>
        </motion.h2>

        {/* Right: description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-sm leading-relaxed max-w-[220px] self-end"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "rgba(31,58,46,0.5)",
          }}
        >
          The crowd-voted hits. Pick your vibe, eat well between classes.
        </motion.p>
      </div>
    </div>
  );
}

// ── Item code label row — mirrors page.tsx chapter label row exactly ──────────
function CodeLabelRow() {
  return (
    <div style={{ borderBottom: "2px solid #1F3A2E" }}>
      <div className="flex overflow-x-auto ms-scroll">
        {MENU_ITEMS.map((item, i) => (
          <div
            key={item.id}
            className="flex-shrink-0 px-5 py-3 text-[10px] tracking-[0.45em] uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(31,58,46,0.3)",
              width: "clamp(200px, 25vw, 320px)",
              borderRight: i < MENU_ITEMS.length - 1 ? "2px solid #1F3A2E" : "none",
            }}
          >
            {item.code}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Footer CTA — mirrors page.tsx bottom strip exactly ────────────────────────
function FooterCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });
  const router = useRouter();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 md:px-12 py-5 flex items-center justify-between flex-wrap gap-4"
      style={{ borderTop: "2px solid #1F3A2E" }}
    >
      {/* Info tags */}
      <div className="flex items-center gap-6 flex-wrap">
        {["📍 On GEC Campus", "✨ Chef's Pick", "🕐 Open 9AM–10PM"].map((tag) => (
          <span
            key={tag}
            className="text-[10px] tracking-[0.35em] uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(31,58,46,0.3)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA button — matches page.tsx Browse all button */}
      <button
        onClick={() => router.push("/categorysection")}
        className="group flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase px-5 py-2.5 transition-all duration-200 hover:bg-[#D94B4B]"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          backgroundColor: "#1F3A2E",
          color: "#E8E1CF",
          borderRadius: "4px",
        }}
      >
        Explore Full Menu
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          className="group-hover:translate-x-1 transition-transform duration-200"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MenuSection() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <>
      <FontLoader />
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#E8E1CF" }}
      >
        {/* Dot grid texture — subtle, matching the warm parchment bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.25]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(31,58,46,0.35) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative">
          {/* ── HEADER — matches page.tsx header layout exactly ── */}
          <SectionHeader />

          {/* ── CODE LABEL ROW — mirrors page.tsx chapter label strip ── */}
          <CodeLabelRow />

          {/* ── CARDS — stacked editorial panels with borders ── */}
          <div className="flex flex-col">
            {MENU_ITEMS.map((item, index) => (
              <div
                key={item.id}
                style={{ borderBottom: index < MENU_ITEMS.length - 1 ? "2px solid #1F3A2E" : "none" }}
              >
               <MenuCard item={item} index={index} onCartOpen={() => setCartOpen(true)} />
              </div>
            ))}
          </div>

          {/* ── FOOTER STRIP ── */}
          <FooterCTA />
        </div>
        <AddToCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </section>
    </>
  );
}