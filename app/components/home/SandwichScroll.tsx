"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

const FRAME_COUNT = 200;

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
    .ticker-text {
      animation: ticker-move 18s linear infinite;
    }
    @keyframes ticker-move {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `}</style>
);

const SCROLL_HEIGHT = "500vh";

export default function SandwichScroll() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const { scrollYProgress } = useScroll();
  const frameIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, FRAME_COUNT - 1],
  );

  // Preload images
  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, "0");
      img.src = `/sandwich-jpg/ezgif-frame-${paddedIndex}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT && !cancelled) setIsLoaded(true);
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
    return () => {
      cancelled = true;
    };
  }, []);

  const renderFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !images[index]) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = images[index];
      const scale = window.devicePixelRatio || 1;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const cssWidth = canvas.width / scale;
      const cssHeight = canvas.height / scale;
      const canvasRatio = cssWidth / cssHeight;
      const imgRatio = img.width / img.height;
      let drawWidth = cssWidth,
        drawHeight = cssHeight,
        offsetX = 0,
        offsetY = 0;
      if (canvasRatio > imgRatio) {
        drawHeight = cssWidth / imgRatio;
        offsetY = (cssHeight - drawHeight) / 2;
      } else {
        drawWidth = cssHeight * imgRatio;
        offsetX = (cssWidth - drawWidth) / 2;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    },
    [images],
  );

  useEffect(() => {
    if (isLoaded) renderFrame(0);
  }, [isLoaded, renderFrame]);

  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (!isLoaded) return;
    const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(latest)));
    requestAnimationFrame(() => renderFrame(index));
  });

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * scale);
      canvas.height = Math.round(window.innerHeight * scale);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      let currentIndex = 0;
      try {
        currentIndex = Math.min(
          FRAME_COUNT - 1,
          Math.max(0, Math.floor(frameIndex.get())),
        );
      } catch {
        currentIndex = 0;
      }
      renderFrame(currentIndex);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [frameIndex, renderFrame]);

  // Animation transforms — tighter, more editorial
  const titleY = useTransform(scrollYProgress, [0, 0.28], [0, -180]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  const infoY = useTransform(scrollYProgress, [0, 0.4], [80, -120]);
  const infoOpacity = useTransform(scrollYProgress, [0, 0.08, 0.38], [0, 1, 0]);
  const badgeOpacity = useTransform(
    scrollYProgress,
    [0.0, 0.06, 0.3],
    [0, 1, 0],
  );
  const badgeY = useTransform(scrollYProgress, [0, 0.08, 0.3], [20, 0, -30]);
  const tickerX = useTransform(scrollYProgress, [0, 1], [0, 300]);

  // Corner label opacity
  const cornerOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <>
      <FontLoader />
      <div
        className="relative w-full"
        style={{ height: SCROLL_HEIGHT, backgroundColor: "#C8B89A" }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Loading state — warm, minimal */}
          {!isLoaded && (
            <div
              className="absolute inset-0 flex items-center justify-center z-50"
              style={{ backgroundColor: "#C8B89A" }}
            >
              <div className="flex flex-col items-center gap-4">
                {/* Animated dots */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: "#1F3A2E",
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                        opacity: 0.5,
                      }}
                    />
                  ))}
                </div>
                <span
                  className="text-[#1F3A2E]/50 text-[9px] tracking-[0.6em] uppercase"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Preparing your table
                </span>
              </div>
            </div>
          )}

          {/* Canvas — scroll-driven food animation */}
          <canvas
            ref={canvasRef}
            className={clsx(
              "absolute inset-0 w-full h-full transition-opacity duration-1000",
              isLoaded ? "opacity-100" : "opacity-0",
            )}
            style={{ objectFit: "cover" }}
          />

          {/* ── Layered warm vignette — matches sandwich image bg exactly ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: [
                "radial-gradient(ellipse 70% 60% at 50% 55%, transparent 30%, rgba(200,184,154,0.45) 100%)",
                "linear-gradient(to bottom, rgba(200,184,154,0.55) 0%, transparent 20%, transparent 75%, rgba(200,184,154,0.7) 100%)",
                "linear-gradient(to right, rgba(200,184,154,0.4) 0%, transparent 18%, transparent 82%, rgba(200,184,154,0.4) 100%)",
              ].join(", "),
            }}
          />

          {/* ── Fine grain texture overlay ── */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
              backgroundSize: "180px 180px",
            }}
          />

          {/* ── TOP LEFT corner label ── */}
          <motion.div
            style={{ opacity: cornerOpacity }}
            className="absolute top-22 left-6 md:left-12 z-30 flex flex-col gap-1 pointer-events-none"
          >
            <span
              className="text-[9px] tracking-[0.55em] uppercase"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(31,58,46,0.45)",
              }}
            >
              Snack Bistro
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1 h-1 rounded-full bg-[#D94B4B]" />
              <span
                className="text-[9px] tracking-[0.45em] uppercase"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(31,58,46,0.35)",
                }}
              >
                Open Now
              </span>
            </div>
          </motion.div>

          {/* ── TOP RIGHT corner: hours ── */}
          <motion.div
            style={{ opacity: cornerOpacity }}
            className="absolute top-22 right-6 md:right-12 z-30 pointer-events-none text-right hidden md:block"
          >
            <span
              className="text-[9px] tracking-[0.45em] uppercase"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(31,58,46,0.35)",
              }}
            >
              Mon–Fri &nbsp;9AM – 10PM
            </span>
          </motion.div>

          {/* ── MAIN TITLE — oversized, editorial ── */}
          <motion.div
            style={{ y: titleY, opacity: titleOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-4 text-center"
          >
            {/* Eyebrow — thin rule + label */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-px w-8"
                style={{ backgroundColor: "rgba(31,58,46,0.25)" }}
              />
              <span
                className="text-[9px] tracking-[0.6em] uppercase"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(31,58,46,0.45)",
                }}
              >
                Campus Cafe &mdash; GEC
              </span>
              <div
                className="h-px w-8"
                style={{ backgroundColor: "rgba(31,58,46,0.25)" }}
              />
            </div>

            {/* Wordmark headline */}
            <h1
              className="leading-none tracking-tight text-center"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(4.5rem, 13vw, 13rem)",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 0.88,
                color: "#1F3A2E",
              }}
            >
              The Tech
              <br />
              <span style={{ color: "#D94B4B" }}>Cafe</span>
              <span style={{ color: "#1F3A2E" }}>.</span>
            </h1>

            {/* Sub-label */}
            <p
              className="mt-5 tracking-[0.35em] uppercase"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(0.6rem, 1.1vw, 0.75rem)",
                color: "rgba(31,58,46,0.4)",
                fontWeight: 500,
              }}
            >
              Your campus, your food, your vibe
            </p>

            {/* Vibe tags — pill row */}
            <motion.div
              style={{ opacity: badgeOpacity, y: badgeY }}
              className="flex items-center gap-2 mt-8 flex-wrap justify-center"
            >
              {[
                { label: "🥗 Fresh Bowls", delay: 0 },
                { label: "☕ Cold Brews", delay: 0.06 },
                { label: "📚 Study Fuel", delay: 0.12 },
                { label: "🔥 Daily Specials", delay: 0.18 },
              ].map(({ label, delay }) => (
                <span
                  key={label}
                  className="text-[9px] font-semibold tracking-wider uppercase px-4 py-2"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    backgroundColor: "rgba(31,58,46,0.08)",
                    color: "rgba(31,58,46,0.55)",
                    border: "1px solid rgba(31,58,46,0.1)",
                    borderRadius: "2px",
                  }}
                >
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── LEFT SIDEBAR INFO — hours block ── */}
          <motion.div
            style={{ y: infoY, opacity: infoOpacity }}
            className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-0 pointer-events-none"
          >
            <div
              className="w-px self-stretch mb-4"
              style={{
                height: "40px",
                backgroundColor: "rgba(217,75,75,0.4)",
              }}
            />
            <p
              className="text-[8px] tracking-[0.55em] uppercase mb-4"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(31,58,46,0.4)",
              }}
            >
              We're open
            </p>
            <div
              className="pl-4 space-y-2.5"
              style={{ borderLeft: "1.5px solid rgba(217,75,75,0.35)" }}
            >
              <div>
                <p
                  className="text-base font-extrabold"
                  style={{ fontFamily: "'Syne', sans-serif", color: "#1F3A2E" }}
                >
                  Mon — Fri
                </p>
                <p
                  className="text-xs font-medium"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: "rgba(31,58,46,0.55)",
                  }}
                >
                  9:00 AM – 10:00 PM
                </p>
              </div>
              <div
                className="w-5 h-px"
                style={{ backgroundColor: "rgba(217,75,75,0.3)" }}
              />
              <div>
                <p
                  className="text-base font-extrabold"
                  style={{ fontFamily: "'Syne', sans-serif", color: "#1F3A2E" }}
                >
                  Saturday
                </p>
                <p
                  className="text-xs font-medium"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: "rgba(31,58,46,0.55)",
                  }}
                >
                  9:00 AM – 5:00 PM
                </p>
              </div>
              <p
                className="text-[9px] pt-1"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(31,58,46,0.28)",
                }}
              >
                Sunday — we rest too 😴
              </p>
            </div>
          </motion.div>

          {/* ── BOTTOM TICKER — editorial marquee strip ── */}
          <motion.div
            style={{ x: tickerX, borderTop: "1px solid rgba(31,58,46,0.1)" }}
            className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none overflow-hidden"
          >
            <div
              className="py-3 overflow-hidden"
              style={{ borderTop: "1px solid rgba(31,58,46,0.12)" }}
            >
              {/* Two copies for seamless loop */}
              <div className="ticker-text flex whitespace-nowrap">
                {[1, 2].map((n) => (
                  <span
                    key={n}
                    className="text-[#1F3A2E]/8 font-extrabold uppercase tracking-tighter select-none pr-16"
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: "clamp(4rem, 8vh, 7rem)",
                      lineHeight: 1,
                    }}
                  >
                    Eat Good &bull; Study Hard &bull; Vibe On &bull; Order Fresh
                    &bull;&nbsp;
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── BOTTOM RIGHT: scroll indicator ── */}
          <motion.div
            style={{ opacity: titleOpacity }}
            className="absolute bottom-10 right-6 md:right-12 z-30 flex flex-col items-center gap-2 pointer-events-none"
          >
            <span
              className="text-[8px] tracking-[0.5em] uppercase rotate-90 origin-center mb-6"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(31,58,46,0.3)",
              }}
            >
              Scroll
            </span>
            <div
              className="w-px h-8"
              style={{
                backgroundColor: "rgba(31,58,46,0.2)",
                background:
                  "linear-gradient(to bottom, rgba(31,58,46,0.3), transparent)",
              }}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}
