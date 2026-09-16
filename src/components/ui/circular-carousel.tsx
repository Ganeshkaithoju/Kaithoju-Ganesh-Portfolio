"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselItem {
  id?: string | number;
  title: string;
  description?: string;
  desc?: string;
  tag?: string;
  icon?: React.ComponentType<{ className?: string }>;
  display_order?: number | null;
  order?: number;
}

export interface CircularCarouselProps {
  items: CarouselItem[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = true,
  autoPlayInterval = 4000,
  className,
}: CircularCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Detect mobile screen for responsive 3D arc positioning
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ensure items are strictly sorted by admin display_order
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const orderA =
        a.display_order !== undefined && a.display_order !== null && !isNaN(Number(a.display_order))
          ? Number(a.display_order)
          : 9999;
      const orderB =
        b.display_order !== undefined && b.display_order !== null && !isNaN(Number(b.display_order))
          ? Number(b.display_order)
          : 9999;
      return orderA - orderB;
    });
  }, [items]);

  const total = sortedItems.length;
  const activeIndex = total > 0 ? (controlledIndex ?? internalIndex) % total : 0;

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      const newIndex = ((index % total) + total) % total;
      if (controlledIndex === undefined) {
        setInternalIndex(newIndex);
      }
      onActiveChange?.(newIndex);
    },
    [total, controlledIndex, onActiveChange],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Autoplay timer
  useEffect(() => {
    if (!autoPlay || isHovered || isFocused || total <= 1) return;
    intervalRef.current = setInterval(next, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, autoPlayInterval, isHovered, isFocused, next, total]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, [next, prev]);

  if (total === 0) return null;

  const activeItem = sortedItems[activeIndex] || sortedItems[0];
  const activeDisplayOrder =
    activeItem.display_order !== undefined && activeItem.display_order !== null
      ? Number(activeItem.display_order)
      : activeIndex + 1;

  // Compute smooth positions along the 3D arc
  const getCardStyle = (index: number) => {
    let offset = index - activeIndex;
    if (total > 1) {
      while (offset > total / 2) offset -= total;
      while (offset < -total / 2) offset += total;
    }

    const absOffset = Math.abs(offset);
    const sign = Math.sign(offset);

    // Responsive horizontal distance
    const step1X = isMobile ? 120 : 185;
    const step2X = isMobile ? 200 : 315;
    const farX = isMobile ? 260 : 400;

    let x = 0;
    let y = 0;
    let scale = 1;
    let opacity = 1;
    let zIndex = 10;
    let isVisible = true;

    if (absOffset === 0) {
      x = 0;
      y = -10;
      scale = 1;
      opacity = 1;
      zIndex = 10;
    } else if (absOffset === 1) {
      x = sign * step1X;
      y = 18;
      scale = 0.86;
      opacity = 0.6;
      zIndex = 7;
    } else if (absOffset === 2) {
      x = sign * step2X;
      y = 44;
      scale = 0.74;
      opacity = 0.3;
      zIndex = 4;
    } else {
      x = sign * farX;
      y = 60;
      scale = 0.55;
      opacity = 0;
      zIndex = 0;
      isVisible = false;
    }

    return { x, y, scale, opacity, zIndex, isVisible };
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Services carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative flex flex-col items-center justify-center outline-none py-4 select-none w-full max-w-4xl mx-auto overflow-visible",
        className,
      )}
    >
      {/* 3D Arc Track Area: cards curved cleanly with active card on top center */}
      <div className="relative h-[180px] sm:h-[200px] w-full flex items-center justify-center">
        {sortedItems.map((item, i) => {
          const style = getCardStyle(i);
          const isActive = i === activeIndex;
          const itemDesc = item.description || item.desc || "";
          const ItemIcon = item.icon;

          return (
            <motion.button
              key={item.id ?? `${item.title}-${i}`}
              animate={{
                x: style.x,
                y: style.y,
                scale: style.scale,
                opacity: style.opacity,
                zIndex: style.zIndex,
              }}
              transition={{
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => goTo(i)}
              aria-label={item.title}
              aria-selected={isActive}
              tabIndex={style.isVisible ? 0 : -1}
              style={{
                pointerEvents: style.isVisible ? "auto" : "none",
                transformOrigin: "center center",
              }}
              className={cn(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-start justify-between cursor-pointer rounded-2xl border backdrop-blur-lg text-left p-4 sm:p-5 transition-shadow duration-300",
                isMobile ? "w-44 h-32" : "w-56 sm:w-60 h-36",
                isActive
                  ? "border-primary/50 bg-zinc-900/95 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] ring-1 ring-primary/30"
                  : "border-white/10 bg-zinc-900/60 shadow-lg hover:border-white/20 hover:bg-zinc-900/80",
              )}
            >
              {/* Header with Tag and Icon */}
              <div className="flex items-center justify-between w-full">
                {item.tag ? (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-white/80">
                    {item.tag}
                  </span>
                ) : (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-white/80">
                    SERVICE
                  </span>
                )}

                {ItemIcon && (
                  <div className="grid h-6 w-6 place-items-center text-primary">
                    <ItemIcon className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="w-full mt-1.5">
                <h3
                  className={cn(
                    "font-display font-semibold leading-tight tracking-tight transition-colors line-clamp-1",
                    isActive
                      ? "text-white text-sm sm:text-base font-bold"
                      : "text-white/80 text-xs sm:text-sm",
                  )}
                >
                  {item.title}
                </h3>
                {itemDesc && (
                  <p
                    className={cn(
                      "mt-1 text-xs leading-relaxed transition-colors line-clamp-2",
                      isActive ? "text-white/70" : "text-white/45",
                    )}
                  >
                    {itemDesc}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Center Numbering & Count: Clean spacious gap below the arc matching reference UI */}
      <div className="flex flex-col items-center justify-center mt-6 sm:mt-8 select-none">
        <motion.span
          key={`num-${activeDisplayOrder}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white/95"
        >
          {String(activeDisplayOrder).padStart(2, "0")}
        </motion.span>
        <span className="mt-1 text-xs font-mono tracking-widest text-white/40 uppercase">
          of {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Navigation Controls: Clean round buttons and pill indicator */}
      <div className="flex items-center gap-4 mt-6 z-10">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={prev}
          aria-label="Previous service"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-sm"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.button>

        {/* Dot / Pill indicators */}
        <div className="flex items-center gap-1.5" role="tablist">
          {sortedItems.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                i === activeIndex
                  ? "w-6 bg-white/90"
                  : "w-1.5 bg-white/20 hover:bg-white/40",
              )}
              aria-label={`Go to service ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={next}
          aria-label="Next service"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-sm"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.button>
      </div>
    </div>
  );
}

export default CircularCarousel;
