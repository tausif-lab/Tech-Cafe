/*"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  `}</style>
);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
const router = useRouter();
  return (
    <>
      <FontLoader />
      <nav
        className="fixed top-0 left-0 w-full z-50 transition-all duration-500"
        style={{
          backgroundColor: isScrolled
            ? "rgba(232,225,207,0.97)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: isScrolled ? "1px solid rgba(31,58,46,0.12)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-18">
          {/* ── Left: eyebrow label ── *}
         
          <div className=" flex items-center gap-4">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#D94B4B" }}
            />
            <span
              className="text-[10px] tracking-[0.55em] uppercase transition-colors duration-300"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: isScrolled
                  ? "rgba(31,58,46,0.4)"
                  : "rgba(232,225,207,0.5)",                                                                
              }}
            >
              GECR
            </span>
          </div>
          {/* ── Centre: Wordmark ── *}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-baseline gap-1"
          >
            <span
              className="font-extrabold uppercase tracking-tight leading-none transition-colors duration-300"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)",
                letterSpacing: "-0.02em",
                color: isScrolled ? "#1F3A2E" : "#E8E1CF",
              }}
            >
              Clever
            </span>
            <span
              className="font-extrabold uppercase leading-none"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)",
                letterSpacing: "-0.02em",
                color: "#D94B4B",
              }}
            >
              Codex
            </span>
            <span
              className="font-extrabold leading-none"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)",
                color: "#D94B4B",
              }}
            >
              .
            </span>
          </Link>
          {/* ── Right: nav links + CTA ── *}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Order Now pill *}
            <button
              onClick={() => router.push('/auth/login')}
              className="flex items-center gap-2 px-4 py-2 text-[9px] font-bold tracking-widest uppercase transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                backgroundColor: "#D94B4B",
                color: "#E8E1CF",
                borderRadius: "4px",
              }}
            >
              Login
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}*/

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "../usermenu/Cartcontext";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  `}</style>
);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { totalItems } = useCart();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <FontLoader />
      <nav
        className="fixed top-0 left-0 w-full z-50 transition-all duration-500"
        style={{
          backgroundColor: isScrolled
            ? "rgba(232,225,207,0.97)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: isScrolled ? "1px solid rgba(31,58,46,0.12)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 flex items-center justify-between h-16 md:h-18">
          {/* Left: eyebrow label */}
          <div className="flex items-center gap-3 md:gap-4">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#D94B4B" }}
            />
            <span
              className="text-[10px] tracking-[0.55em] uppercase transition-colors duration-300"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: isScrolled
                  ? "rgba(31,58,46,0.4)"
                  : "rgba(232,225,207,0.5)",
              }}
            >
              GECR
            </span>
          </div>

          {/* Centre: Wordmark */}
          <Link
            href="/"
            className="flex items-baseline gap-0.5 md:gap-1 md:absolute md:left-1/2 md:-translate-x-1/2"
          >
            <span
              className="font-extrabold uppercase tracking-tight leading-none transition-colors duration-300"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
                letterSpacing: "-0.02em",
                color: isScrolled ? "#1F3A2E" : "#E8E1CF",
              }}
            >
              Clever
            </span>
            <span
              className="font-extrabold uppercase leading-none"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
                letterSpacing: "-0.02em",
                color: "#D94B4B",
              }}
            >
              Codex
            </span>
            <span
              className="font-extrabold leading-none"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
                color: "#D94B4B",
              }}
            >
              .
            </span>
          </Link>

          {/* Right: nav links + CTA */}
          <div className="flex items-center gap-3">
            {/* Cart button - always visible */}
            <button
              onClick={() => router.push('/billing')}
              className="relative p-2 transition-all duration-200 hover:scale-110"
              aria-label="Cart"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isScrolled ? "#1F3A2E" : "#E8E1CF"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: "#D94B4B",
                    color: "#E8E1CF",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              // Show account icon when logged in
              <button
                onClick={() => router.push('/Accountpage')}
                className="p-2 transition-all duration-200 hover:scale-110"
                aria-label="Account"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isScrolled ? "#1F3A2E" : "#E8E1CF"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            ) : (
              // Show login button when not logged in
              <button
                onClick={() => router.push('/auth/login')}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-[9px] font-bold tracking-widest uppercase transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  backgroundColor: "#D94B4B",
                  color: "#E8E1CF",
                  borderRadius: "4px",
                }}
              >
                Login
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Hamburger menu for mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
            >
              <span
                className="w-5 h-0.5 transition-all duration-300"
                style={{
                  backgroundColor: isScrolled ? "#1F3A2E" : "#E8E1CF",
                  transform: menuOpen ? "rotate(45deg) translateY(6px)" : "none",
                }}
              />
              <span
                className="w-5 h-0.5 transition-all duration-300"
                style={{
                  backgroundColor: isScrolled ? "#1F3A2E" : "#E8E1CF",
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                className="w-5 h-0.5 transition-all duration-300"
                style={{
                  backgroundColor: isScrolled ? "#1F3A2E" : "#E8E1CF",
                  transform: menuOpen ? "rotate(-45deg) translateY(-6px)" : "none",
                }}
              />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            className="md:hidden absolute top-full left-0 w-full transition-all duration-300"
            style={{
              backgroundColor: isScrolled
                ? "rgba(232,225,207,0.97)"
                : "rgba(31,58,46,0.95)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(31,58,46,0.12)",
            }}
          >
            <div className="px-6 py-4 space-y-3">
              {user ? (
                <button
                  onClick={() => {
                    router.push('/Accountpage');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    backgroundColor: "#D94B4B",
                    color: "#E8E1CF",
                    borderRadius: "4px",
                  }}
                >
                  My Account
                </button>
              ) : (
                <button
                  onClick={() => {
                    router.push('/auth/login');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    backgroundColor: "#D94B4B",
                    color: "#E8E1CF",
                    borderRadius: "4px",
                  }}
                >
                  Login
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
