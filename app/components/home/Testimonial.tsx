"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ── Font loader (matches MenuSection) ─────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
  `}</style>
);

// ── Color palette for each card — NOT pure green; warm complements ────────────
// Dark forest, warm beige, dusty terracotta, warm rust, deep olive
const CARD_PALETTES = [
  { bg: "#E8E1CF", text: "#1F3A2E", accent: "#D94B4B", label: "WARM BEIGE"   }, // 0 — beige (matches menu base)
  { bg: "#1F3A2E", text: "#E8E1CF", accent: "#D94B4B", label: "FOREST"       }, // 1 — dark green
  { bg: "#C9B99A", text: "#1F3A2E", accent: "#D94B4B", label: "SAND"         }, // 2 — warm sand/tan
  { bg: "#8B3A2A", text: "#E8E1CF", accent: "#E8E1CF", label: "BRICK"        }, // 3 — brick / deep rust
  { bg: "#2D4A38", text: "#E8E1CF", accent: "#C9B99A", label: "MOSS"         }, // 4 — moss green
  { bg: "#6B4C3B", text: "#E8E1CF", accent: "#E8E1CF", label: "MOCHA"        }, // 5 — warm mocha
];

// ── Testimonial data ───────────────────────────────────────────────────────────
type ReviewCard = {
  id: number;
  quote: string;
  name: string;
  role: string;
  initials: string;
  code: string;
};

const REVIEW_STORAGE_KEY = "tech-cafe-reviews";

const TESTIMONIALS: ReviewCard[] = [
  {
    id: 1,
    quote: "The chai here hits different after a brutal lab session. Honestly the only thing keeping us going.",
    name: "Arjun Mehta",
    role: "CSE, 3rd Year",
    initials: "AM",
    code: "TB.01",
  },
  {
    id: 2,
    quote: "Mexican Pizza is criminally underrated. I've had it six times this week and I regret nothing.",
    name: "Priya Nair",
    role: "ECE, 2nd Year",
    initials: "PN",
    code: "TB.02",
  },
  {
    id: 3,
    quote: "Best paneer sandwich on campus — maybe the city. The grilled crust is perfection.",
    name: "Dev Sharma",
    role: "IT, 4th Year",
    initials: "DS",
    code: "TB.03",
  },
  {
    id: 4,
    quote: "They never run out of dosa before noon, which is more than I can say for the main canteen.",
    name: "Sneha Kulkarni",
    role: "Mech, 1st Year",
    initials: "SK",
    code: "TB.04",
  },
  {
    id: 5,
    quote: "Fast, cheap, genuinely good. This cafe is the actual hidden gem of GEC.",
    name: "Rohan Verma",
    role: "Civil, 3rd Year",
    initials: "RV",
    code: "TB.05",
  },
  {
    id: 6,
    quote: "The staff knows my order before I say it. That's real cafe culture right there.",
    name: "Fatima Shaikh",
    role: "EXTC, 2nd Year",
    initials: "FS",
    code: "TB.06",
  },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function buildReviewCode(index: number) {
  return `TB.${String(index + 1).padStart(2, "0")}`;
}

// ── Fan angles for the background deck cards ──────────────────────────────────
// When card n is active, the rest fan out behind it
function getDeckTransform(cardIndex: number, activeIndex: number, total: number) {
  if (cardIndex === activeIndex) {
    return { rotate: 0, x: 0, y: 0, scale: 1, zIndex: total + 10, opacity: 1 };
  }

  const offset = cardIndex - activeIndex;
  const absOffset = Math.abs(offset);

  // Cards behind the active one fan left/right
  const sign = offset < 0 ? -1 : 1;
  const rotate = sign * (absOffset * 7 + 4);
  const x = sign * (absOffset * 55 + 20);
  const y = absOffset * 12 + 8;
  const scale = Math.max(0.82, 1 - absOffset * 0.055);
  const zIndex = total - absOffset;
  const opacity = absOffset > 3 ? 0 : 1 - absOffset * 0.1;

  return { rotate, x, y, scale, zIndex, opacity };
}

// ── A single testimonial card ─────────────────────────────────────────────────
interface CardProps {
  testimonial: ReviewCard;
  cardIndex: number;
  activeIndex: number;
  total: number;
  onClick: () => void;
}

function TestimonialCard({ testimonial, cardIndex, activeIndex, total, onClick }: CardProps) {
  const palette = CARD_PALETTES[cardIndex % CARD_PALETTES.length];
  const isActive = cardIndex === activeIndex;
  const tf = getDeckTransform(cardIndex, activeIndex, total);

  return (
    <motion.div
      layout
      animate={{
        rotate: tf.rotate,
        x: tf.x,
        y: tf.y,
        scale: tf.scale,
        opacity: tf.opacity,
        zIndex: tf.zIndex,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 38,
        mass: 1,
      }}
      onClick={onClick}
      className="absolute cursor-pointer select-none"
      style={{
        width: "clamp(280px, 36vw, 420px)",
        top: 0,
        left: "50%",
        translateX: "-50%",
        transformOrigin: "bottom center",
        zIndex: tf.zIndex,
      }}
    >
      {/* Card body */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          backgroundColor: palette.bg,
          border: `2px solid ${isActive ? palette.text : "transparent"}`,
          boxShadow: isActive
            ? `0 24px 60px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.18)`
            : `0 8px 24px rgba(0,0,0,0.18), 0 3px 8px rgba(0,0,0,0.12)`,
          padding: "clamp(20px, 3vw, 36px)",
          minHeight: "clamp(260px, 32vw, 360px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "box-shadow 0.3s ease, border-color 0.3s ease",
          // Folded corner effect — cut top-right corner
          clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)",
        }}
      >
        {/* Folded corner accent */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: 0,
            height: 0,
            borderStyle: "solid",
            borderWidth: "0 24px 24px 0",
            borderColor: `transparent ${isActive ? palette.accent : "rgba(0,0,0,0.15)"} transparent transparent`,
            opacity: 0.6,
            transition: "border-color 0.3s ease",
          }}
        />

        {/* Code label */}
        <div
          className="text-[9px] tracking-[0.5em] uppercase mb-4"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: `${palette.text}55`,
          }}
        >
          {testimonial.code} &nbsp;&bull;&nbsp; GEC TECH CAFÉ
        </div>

        {/* Quote */}
        <blockquote
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)",
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            color: palette.text,
            flex: 1,
            display: "flex",
            alignItems: "center",
            margin: "0 0 24px",
          }}
        >
          "{testimonial.quote}"
        </blockquote>

        {/* Author row */}
        <div
          className="flex items-center gap-3"
          style={{ borderTop: `1px solid ${palette.text}18`, paddingTop: "16px" }}
        >
          {/* Avatar circle */}
          <div
            className="flex-shrink-0 flex items-center justify-center font-bold text-xs tracking-widest"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: palette.accent,
              color: "#E8E1CF",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              border: `2px solid ${palette.text}22`,
            }}
          >
            {testimonial.initials}
          </div>

          <div>
            <div
              className="text-sm font-semibold leading-tight"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: palette.text,
              }}
            >
              {testimonial.name}
            </div>
            <div
              className="text-[10px] tracking-wider uppercase mt-0.5"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: `${palette.text}55`,
              }}
            >
              {testimonial.role}
            </div>
          </div>

          {/* Active dot indicator */}
          {isActive && (
            <div
              className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: palette.accent }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Section header — matches MenuSection header exactly ───────────────────────
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
          Tech Café &bull; Student Love
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
          What They
          <br />
          <span style={{ color: "rgba(31,58,46,0.18)" }}>Said</span>
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
          Straight from the students. No filters, just real talk about campus fuel.
        </motion.p>
      </div>
    </div>
  );
}

// ── Dot pagination ─────────────────────────────────────────────────────────────
function DotPagination({
  total,
  active,
  onSelect,
}: {
  total: number;
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 justify-center mt-12">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className="transition-all duration-300"
          style={{
            width: i === active ? 28 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === active ? "#1F3A2E" : "rgba(31,58,46,0.2)",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}

// ── Arrow button ───────────────────────────────────────────────────────────────
function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex items-center justify-center transition-all duration-200"
      style={{
        width: 48,
        height: 48,
        border: "2px solid #1F3A2E",
        borderRadius: 0,
        backgroundColor: "transparent",
        color: "#1F3A2E",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.25 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1F3A2E";
          (e.currentTarget as HTMLButtonElement).style.color = "#E8E1CF";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "#1F3A2E";
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        {direction === "left" ? (
          <path d="M19 12H5M12 19l-7-7 7-7" />
        ) : (
          <path d="M5 12h14M12 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

// ── Main deck stage ───────────────────────────────────────────────────────────
function TestimonialDeck({
  testimonials,
}: {
  testimonials: ReviewCard[];
}) {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px 0px" });

  // Auto-advance when in view
  useEffect(() => {
    if (!autoplay || !isInView || testimonials.length === 0) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [autoplay, isInView, testimonials.length]);

  useEffect(() => {
    if (active >= testimonials.length) {
      setActive(Math.max(testimonials.length - 1, 0));
    }
  }, [active, testimonials.length]);

  const prev = () => {
    setAutoplay(false);
    setActive((p) => (p - 1 + testimonials.length) % testimonials.length);
  };
  const next = () => {
    setAutoplay(false);
    setActive((p) => (p + 1) % testimonials.length);
  };

  return (
    <div ref={sectionRef} className="py-20 px-6 md:px-12">
      {/* Deck stage */}
      <div
        className="relative mx-auto"
        style={{
          height: "clamp(320px, 42vw, 480px)",
          maxWidth: 560,
        }}
      >
        {/* Render all cards; z-order controlled by getDeckTransform */}
        {testimonials.map((t, i) => (
          <TestimonialCard
            key={t.id}
            testimonial={t}
            cardIndex={i}
            activeIndex={active}
            total={testimonials.length}
            onClick={() => {
              setAutoplay(false);
              setActive(i);
            }}
          />
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <ArrowButton direction="left" onClick={prev} disabled={false} />

        {/* Counter */}
        <div
          className="text-[10px] tracking-[0.45em] uppercase px-4 py-2 select-none"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "rgba(31,58,46,0.35)",
            border: "1px solid rgba(31,58,46,0.15)",
            minWidth: 72,
            textAlign: "center",
          }}
        >
          {String(active + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(testimonials.length).padStart(2, "0")}
        </div>

        <ArrowButton direction="right" onClick={next} disabled={false} />
      </div>

      {/* Dot indicator */}
      <DotPagination
        total={testimonials.length}
        active={active}
        onSelect={(i) => {
          setAutoplay(false);
          setActive(i);
        }}
      />
    </div>
  );
}

// ── Code label row — mirrors MenuSection ──────────────────────────────────────
function CodeLabelRow({ testimonials }: { testimonials: ReviewCard[] }) {
  return (
    <div style={{ borderBottom: "2px solid #1F3A2E" }}>
      <div className="flex overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {testimonials.slice(0, 4).map((t, i) => (
          <div
            key={t.id}
            className="flex-shrink-0 px-5 py-3 text-[10px] tracking-[0.45em] uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(31,58,46,0.3)",
              width: "clamp(180px, 22vw, 280px)",
              borderRight: i < 3 ? "2px solid #1F3A2E" : "none",
            }}
          >
            {t.code}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: { name: string; role: string; quote: string }) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setRole("");
      setQuote("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
        style={{ backgroundColor: "rgba(14, 25, 20, 0.72)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xl overflow-hidden"
          style={{
            backgroundColor: "#E8E1CF",
            border: "2px solid #1F3A2E",
            boxShadow: "0 24px 60px rgba(0,0,0,0.24)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "2px solid #1F3A2E" }}>
            <div>
              <p
                className="text-[10px] tracking-[0.45em] uppercase"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(31,58,46,0.45)" }}
              >
                Tech Cafe . Review
              </p>
              <h3
                className="mt-2 text-2xl font-extrabold uppercase"
                style={{ fontFamily: "'Syne', sans-serif", color: "#1F3A2E", letterSpacing: "-0.02em" }}
              >
                Leave A Review
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center"
              style={{ color: "#1F3A2E" }}
              aria-label="Close review form"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({ name: name.trim(), role: role.trim(), quote: quote.trim() });
            }}
            className="p-6 space-y-4"
          >
            <div>
              <label
                className="block text-[10px] tracking-[0.35em] uppercase mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(31,58,46,0.55)" }}
              >
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 outline-none"
                style={{
                  border: "1px solid rgba(31,58,46,0.18)",
                  backgroundColor: "rgba(31,58,46,0.03)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "#1F3A2E",
                }}
              />
            </div>

            <div>
              <label
                className="block text-[10px] tracking-[0.35em] uppercase mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(31,58,46,0.55)" }}
              >
                Designation Or Branch
                <span style={{ color: "rgba(31,58,46,0.3)", marginLeft: 8 }}>Optional</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="CSE, 2nd Year or Student Coordinator"
                className="w-full px-4 py-3 outline-none"
                style={{
                  border: "1px solid rgba(31,58,46,0.18)",
                  backgroundColor: "rgba(31,58,46,0.03)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "#1F3A2E",
                }}
              />
            </div>

            <div>
              <label
                className="block text-[10px] tracking-[0.35em] uppercase mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(31,58,46,0.55)" }}
              >
                Review
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Write your review here"
                required
                rows={5}
                className="w-full px-4 py-3 outline-none resize-none"
                style={{
                  border: "1px solid rgba(31,58,46,0.18)",
                  backgroundColor: "rgba(31,58,46,0.03)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "#1F3A2E",
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-[10px] font-semibold tracking-widest uppercase"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "#1F3A2E",
                  border: "1px solid rgba(31,58,46,0.2)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-[10px] font-semibold tracking-widest uppercase"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  backgroundColor: "#1F3A2E",
                  color: "#E8E1CF",
                }}
              >
                Submit Review
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Footer strip — mirrors MenuSection ────────────────────────────────────────
function FooterStrip({
  onLeaveReview,
  reviewCount,
}: {
  onLeaveReview: () => void;
  reviewCount: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 md:px-12 py-5 flex items-center justify-between flex-wrap gap-4"
      style={{ borderTop: "2px solid #1F3A2E" }}
    >
      <div className="flex items-center gap-6 flex-wrap">
        {[`⭐ 4.9 / 5.0 Rating`, `📣 ${reviewCount}+ Reviews`, "🎓 GEC Campus"].map((tag) => (
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

      <button
        onClick={onLeaveReview}
        className="group flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase px-5 py-2.5 transition-all duration-200"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          backgroundColor: "#1F3A2E",
          color: "#E8E1CF",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#D94B4B";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1F3A2E";
        }}
      >
        Leave a Review
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
      </button>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<ReviewCard[]>(TESTIMONIALS);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(REVIEW_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as ReviewCard[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = [...parsed, ...TESTIMONIALS].map((review, index) => ({
          ...review,
          code: buildReviewCode(index),
        }));
        setTestimonials(merged);
      }
    } catch {
      setTestimonials(TESTIMONIALS);
    }
  }, []);

  const handleReviewSubmit = ({
    name,
    role,
    quote,
  }: {
    name: string;
    role: string;
    quote: string;
  }) => {
    if (!name || !quote) return;

    const customReview: ReviewCard = {
      id: Date.now(),
      name,
      role: role || "Student",
      quote,
      initials: getInitials(name),
      code: "",
    };

    const existingCustomReviews = testimonials.filter(
      (review) => !TESTIMONIALS.some((seedReview) => seedReview.id === review.id),
    );
    const nextCustomReviews = [customReview, ...existingCustomReviews];
    const allReviews = [...nextCustomReviews, ...TESTIMONIALS].map((review, index) => ({
      ...review,
      code: buildReviewCode(index),
    }));

    setTestimonials(allReviews);
    window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(nextCustomReviews));
    setReviewModalOpen(false);
  };

  return (
    <>
      <FontLoader />
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#E8E1CF" }}
      >
        {/* Dot grid texture — matches MenuSection */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.25]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(31,58,46,0.35) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative">
          <SectionHeader />
          <CodeLabelRow testimonials={testimonials} />
          <TestimonialDeck testimonials={testimonials} />
          <FooterStrip
            onLeaveReview={() => setReviewModalOpen(true)}
            reviewCount={testimonials.length}
          />
        </div>
      </section>
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}
