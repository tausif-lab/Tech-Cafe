"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import MenuSection from "../components/usermenu/menu"; // adjust import path as needed in your project
import AddToCart from "../components/usermenu/Addtocart";     // adjust path
import { useCart } from "../components/usermenu/Cartcontext"; // adjust path

// ── Fonts ────────────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  `}</style>
);

// ── Category data ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 1,
    label: "CAT.1",
    name: "Pizza",
    emoji: "🍕",
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    description:
      "Hand-tossed, stone-baked. From classic margherita to campus-special loaded slices — each one hits different between lectures.",
    items: "12 varieties",
    topPick: "Margherita Classic",
  },
  {
    id: 2,
    label: "CAT.2",
    name: "Burger",
    emoji: "🍔",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    description:
      "Stacked high, dripping with sauce. Juicy patties, fresh buns, and toppings that make your study break actually worth it.",
    items: "8 varieties",
    topPick: "Smash Double",
  },
  {
    id: 3,
    label: "CAT.3",
    name: "Sandwich",
    emoji: "🥪",
    img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
    description:
      "Seeded bread, fresh fillings, house sauces. Quick, filling, and light enough to eat one-handed while cramming for exams.",
    items: "10 varieties",
    topPick: "Club Crunch",
  },
  {
    id: 4,
    label: "CAT.4",
    name: "Dosa",
    emoji: "🫓",
    img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&q=80",
    description:
      "Crispy, golden, straight off the tawa. With sambar and chutneys that remind you of home — the real comfort food on campus.",
    items: "6 varieties",
    topPick: "Masala Dosa",
  },
  {
    id: 5,
    label: "CAT.5",
    name: "Pasta",
    emoji: "🍝",
    img: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80",
    description:
      "Twirled, sauced, and loaded. Creamy Alfredo, tangy Arrabbiata — proper pasta that fills you up without emptying your wallet.",
    items: "7 varieties",
    topPick: "Penne Arrabbiata",
  },
  {
    id: 6,
    label: "CAT.6",
    name: "Shakes",
    emoji: "🍹",
    img: "/Cold Coffee.jpeg",
    description:
      "Virgin, fresh-mint, ice-cold. The ultimate cool-down after a packed day — sip slow, vibe harder. Your post-class ritual.",
    items: "5 varieties",
    topPick: "Classic Mint",
  },
  {
  id: 7,
  label: "CAT.7",
  name: "Chowmein",
  emoji: "🍜",
  img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80",
  description:
    "Wok-tossed noodles packed with bold sauces and crunchy veggies. Street-style flavors that never miss.",
  items: "4 varieties",
  topPick: "Paneer Chowmein",
},
{
  id: 8,
  label: "CAT.8",
  name: "Chinese",
  emoji: "🥡",
  img: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=500&q=80",
  description:
    "Bold Indo-Chinese flavors with crispy textures and spicy gravies — perfect for a full meal or snack.",
  items: "8 varieties",
  topPick: "Paneer Chilli",
},
{
  id: 9,
  label: "CAT.9",
  name: "Maggi",
  emoji: "🍜",
  img: "/peri-peri-maggi.png",
  description:
    "Hot, spicy, and instantly satisfying. From classic masala to cheesy and peri-peri twists — your go-to comfort bowl anytime.",
  items: "7 varieties",
  topPick: "Cheese Veg Maggi",
},
{
  id: 10,
  label: "CAT.10",
  name: "French Fries",
  emoji: "🍟",
  img: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80",
  description:
    "Golden crispy fries with classic, cheesy, and spicy twists — the perfect side or anytime snack.",
  items: "4 varieties",
  topPick: "Peri Cheese Fries",
},{
  id: 11,
  label: "CAT.11",
  name: "Fried Rice",
  emoji: "🍚",
  img: "https://images.unsplash.com/photo-1604908177522-4295f5f31b5b?w=500&q=80",
  description:
    "Fluffy rice stir-fried with sauces and veggies — simple, filling, and full of flavor.",
  items: "2 varieties",
  topPick: "Schezwan Fried Rice",
},
{
  id: 12,
  label: "CAT.12",
  name: "Tech Cafe Special",
  emoji: "🌯",
  img: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80",
  description:
    "Crispy rolls loaded with signature fillings and sauces — quick bites made for college cravings.",
  items: "2 varieties",
  topPick: "Cheese Loaded Roll",
}

];

// ── Category Panel ────────────────────────────────────────────────────────────
function CategoryPanel({
  cat,
  index,
  isSelected,
  onClick,
}: {
  cat: (typeof CATEGORIES)[0];
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || isSelected;

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="relative flex-shrink-0 flex flex-col cursor-pointer overflow-hidden"
      style={{
        backgroundColor: active ? "#1F3A2E" : "#D94B4B",
        width: "clamp(240px, 28vw, 340px)",
        minHeight: "520px",
        borderRight: "2px solid #C03535",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Selected indicator bar at top */}
      <motion.div
        animate={{ scaleX: isSelected ? 1 : 0 }}
        initial={{ scaleX: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 right-0 h-[3px] origin-left"
        style={{ backgroundColor: "#E8E1CF" }}
      />

      {/* Chapter label */}
      <div
        className="px-5 pt-5 pb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
      >
        <span
          className="text-white/50 text-[10px] tracking-[0.45em] uppercase"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {cat.label}
        </span>
      </div>

      {/* Big category name */}
      <div className="px-5 pt-4">
        <h3
          className="text-white font-extrabold uppercase leading-none tracking-tight"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            letterSpacing: "-0.02em",
          }}
        >
          {cat.name}
        </h3>
      </div>

      {/* Food image — floated in, slightly tilted */}
      <div className="flex justify-center px-5 py-6 flex-1 items-start mt-2">
        <motion.div
          animate={{ rotate: active ? 3 : -2, scale: active ? 1.06 : 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative shadow-2xl"
          style={{
            width: "clamp(130px, 14vw, 190px)",
            height: "clamp(130px, 14vw, 190px)",
          }}
        >
          <img
            src={cat.img}
            alt={cat.name}
            className="w-full h-full object-cover"
            style={{ borderRadius: "4px" }}
          />
          {/* Emoji badge */}
          <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-[#E8E1CF] flex items-center justify-center text-lg shadow-md">
            {cat.emoji}
          </div>
        </motion.div>
      </div>

      {/* Description + meta */}
      <motion.div
        animate={{ y: active ? 0 : 12, opacity: active ? 1 : 0.7 }}
        transition={{ duration: 0.35 }}
        className="px-5 pb-6 mt-auto"
      >
        <p
          className="text-white/70 text-xs leading-relaxed mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {cat.description}
        </p>
        <div className="flex items-center justify-between">
          <span
            className="text-white/40 text-[9px] tracking-[0.35em] uppercase"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {cat.items}
          </span>
          <span
            className="text-white/90 text-[10px] font-semibold tracking-wide bg-white/10 px-3 py-1 rounded-full"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            ✦ {cat.topPick}
          </span>
        </div>
      </motion.div>

      {/* Bottom arrow — shows on hover/selected */}
      <motion.div
        animate={{ opacity: active ? 1 : 0, x: active ? 0 : -8 }}
        transition={{ duration: 0.25 }}
        className="absolute bottom-5 right-5 text-white/60"
      >
        {/* Arrow points down when selected to indicate menu is below */}
        {isSelected ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CategorySection() {
  const headerRef = useRef(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-40px 0px" });

  // null = no category selected (menu hidden), number = show that category's menu
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const handleCategoryClick = (id: number) => {
    if (selectedCategoryId === id) {
      // clicking the same panel again collapses the menu
      setSelectedCategoryId(null);
      return;
    }
    setSelectedCategoryId(id);
    // Smooth-scroll to the menu section after a brief delay for the reveal animation
    setTimeout(() => {
      menuRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    // Scroll back up to the category section
    headerRef.current &&
      (headerRef.current as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <FontLoader />
      <section className="bg-[#E8E1CF] overflow-hidden">

        {/* ── TOP HEADER ── */}
        <div
          ref={headerRef}
          className="px-6 md:px-12 pt-16 pb-10"
          style={{ borderBottom: "2px solid #1F3A2E" }}
        >
          <div className="max-w-screen-xl mx-auto flex items-end justify-between gap-8 flex-wrap">

            {/* Left: nav label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
              className="text-[#1F3A2E]/40 text-[10px] tracking-[0.5em] uppercase self-start mt-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Snack Bistro &bull; Categories
            </motion.p>

            {/* Centre: BIG title */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="text-[#1F3A2E] font-extrabold uppercase leading-none flex-1"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(3.5rem, 10vw, 8.5rem)",
                letterSpacing: "-0.03em",
                lineHeight: 0.92,
              }}
            >
              What We<br />Serve
            </motion.h2>

            {/* Right: description + home button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="self-end flex flex-col items-start gap-4"
            >
              <p
                className="text-[#1F3A2E]/55 text-sm leading-relaxed max-w-[220px]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Six categories of campus-grade food — crafted fresh, priced right, and built for college life.
              </p>
              <Link
                href="/home"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-semibold tracking-widest uppercase transition-all duration-200 hover:bg-[#D94B4B] hover:text-[#E8E1CF]"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "#1F3A2E",
                  border: "1px solid rgba(31,58,46,0.3)",
                  borderRadius: "4px",
                }}
              >
                Home
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5 9.5V21h14V9.5" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ── PANELS ROW ── */}
        <div
          className="flex overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.cat-scroll::-webkit-scrollbar { display: none; }`}</style>
          <div className="cat-scroll flex overflow-x-auto w-full">
            {CATEGORIES.map((cat, index) => (
              <CategoryPanel
                key={cat.id}
                cat={cat}
                index={index}
                isSelected={selectedCategoryId === cat.id}
                onClick={() => handleCategoryClick(cat.id)}
              />
            ))}
          </div>
        </div>

        {/* ── BOTTOM STRIP ── */}
        <div
          className="px-6 md:px-12 py-5 flex items-center justify-between flex-wrap gap-4"
          style={{ borderTop: "2px solid #1F3A2E" }}
        >
          <div className="flex items-center gap-6">
            {["📍 GEC Campus", "🕐 Open 9AM–10PM", "⚡ Order in 2 min"].map((t) => (
              <span
                key={t}
                className="text-[#1F3A2E]/35 text-[10px] tracking-[0.35em] uppercase"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {/* Cart icon with live badge */}
            
            
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 text-[10px] font-semibold tracking-widest uppercase transition-all duration-200 hover:bg-[#D94B4B]"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                border: "1px solid rgba(31,58,46,0.3)",
                color: "#1F3A2E",
                borderRadius: "4px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Tray
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                  style={{ backgroundColor: "#D94B4B", fontSize: "8px" }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            <button
              className="group flex items-center gap-2 bg-[#1F3A2E] text-[#E8E1CF] px-5 py-2.5 text-[10px] font-semibold tracking-widest uppercase transition-all duration-200 hover:bg-[#D94B4B] rounded-lg"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Browse all
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="group-hover:translate-x-1 transition-transform duration-200">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </section>

      {/* ── MENU SECTION — animates in below when a category is selected ── */}
      <div ref={menuRef}>
        <AnimatePresence mode="wait">
          {selectedCategoryId !== null && (
            <motion.div
              key={selectedCategoryId}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <MenuSection
                categoryId={selectedCategoryId}
                onBackToCategories={handleBackToCategories}
                onOpenCart={() => setCartOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
       <AddToCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
