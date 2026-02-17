"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <motion.div
      className="h-[38rem] overflow-y-auto flex justify-center relative space-x-16 rounded-none p-10 bg-transparent"
      ref={ref}
    >
      {/* Left: scrolling text */}
      <div className="relative flex items-start px-4">
        <div className="max-w-xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-24 first:mt-6">
              <motion.p
                animate={{ opacity: activeCard === index ? 0.4 : 0.15 }}
                className="text-[0.6rem] tracking-[0.55em] uppercase font-mono text-[#1F3A2E] mb-3"
              >
                {String(index + 1).padStart(2, "0")} &mdash; Selection
              </motion.p>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.2 }}
                className="text-3xl md:text-4xl font-bold italic text-[#1F3A2E] mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {item.title}
              </motion.h2>
              <motion.div
                animate={{ opacity: activeCard === index ? 1 : 0 }}
                className="w-8 h-px bg-[#D94B4B] mb-4"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.15 }}
                className="text-[#1F3A2E]/70 text-sm leading-relaxed max-w-sm font-light"
                style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-32" />
        </div>
      </div>

      {/* Right: sticky visual */}
      <div
        className={cn(
          "hidden lg:block h-[30rem] w-[22rem] rounded-sm sticky top-4 overflow-hidden shadow-2xl",
          contentClassName
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};