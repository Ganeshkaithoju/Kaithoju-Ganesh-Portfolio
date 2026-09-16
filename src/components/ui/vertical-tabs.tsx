"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, ExternalLink, Sparkles, FolderGit2, CircuitBoard } from "lucide-react";

export interface ProjectTabItem {
  id?: string | number;
  title: string;
  tag?: string;
  description?: string;
  desc?: string;
  tech?: string[];
  image?: string;
  image_url?: string | null;
  media_type?: "image" | "video" | string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: string;
  accent_class?: string | null;
  is_embedded?: boolean;
  embedded?: boolean;
  has_github?: boolean;
  github_url?: string | null;
  featured?: boolean;
  display_order?: number | null;
  order?: number;
}

// Default Fallback Services if no projects are provided
const DEFAULT_SERVICES: ProjectTabItem[] = [
  {
    id: "01",
    display_order: 1,
    title: "Web Design",
    description:
      "Creating beautiful, functional, and user-centric digital experiences with modern web technologies.",
    image:
      "https://cdn.21st.dev/assets/mirror/10/10c8513636cffc0690df33c3a253e29d6876b8af69ad7ad404c186a0f6f7003c.jpg",
  },
  {
    id: "02",
    display_order: 2,
    title: "Framer Development",
    description: "Building high-performance, animated websites with Framer and modern design systems.",
    image:
      "https://cdn.21st.dev/assets/mirror/41/411990f399ad255e8c51100a625228dc73ca5346175e22fff6bb8e4719ef1918.jpg",
  },
  {
    id: "03",
    display_order: 3,
    title: "Branding",
    description:
      "Defining your brand's visual identity and voice for a lasting impression across all digital platforms.",
    image:
      "https://cdn.21st.dev/assets/mirror/1b/1b4d5fbf6ad8d0edcab03b93c5bf5f89f546d21cd965ec4b27cb3756904e25d0.jpg",
  },
];

const AUTO_PLAY_DURATION = 10000; // 10 seconds per slide

export interface VerticalTabsProps {
  items?: ProjectTabItem[];
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: string;
  hideHeader?: boolean;
  autoPlayDuration?: number;
  fallbackGithubUrl?: string;
  className?: string;
}

export function VerticalTabs({
  items,
  eyebrow = "PROJECTS",
  title = "Selected work",
  subtitle = "A handful of things I've designed, built, and shipped.",
  hideHeader = false,
  autoPlayDuration = AUTO_PLAY_DURATION,
  fallbackGithubUrl = "https://github.com/Ganeshkaithoju",
  className,
}: VerticalTabsProps) {
  const rawItems = items && items.length > 0 ? items : DEFAULT_SERVICES;

  // Ensure projects are strictly sorted by admin display_order
  const activeItems = useMemo(() => {
    return [...rawItems].sort((a, b) => {
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
  }, [rawItems]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Keep index within bounds if items change dynamically
  useEffect(() => {
    if (activeIndex >= activeItems.length) {
      setActiveIndex(0);
    }
  }, [activeItems.length, activeIndex]);

  // Smooth scroll container so active tab is always fully visible (handles bottom & top loop)
  const scrollToActiveTab = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const container = listContainerRef.current;
      const activeBtn = tabRefs.current[activeIndex];
      if (!container || !activeBtn) return;

      // When looping back to the very first card: auto-scroll container all the way back to top
      if (activeIndex === 0) {
        container.scrollTo({ top: 0, behavior });
        return;
      }

      // When reaching the last card (bottom card): auto-scroll container to bottom to reveal full card
      if (activeIndex === activeItems.length - 1) {
        container.scrollTo({ top: container.scrollHeight, behavior });
        return;
      }

      // Compute exact relative position of active card within the container's scroll canvas
      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const relativeTop = btnRect.top - containerRect.top + container.scrollTop;
      const relativeBottom = relativeTop + btnRect.height;

      const padding = 20; // Breathing room inside container viewport

      // If bottom of the expanded card is below the visible bottom edge of the container
      if (relativeBottom > container.scrollTop + container.clientHeight - padding) {
        const targetScroll = relativeBottom - container.clientHeight + padding;
        container.scrollTo({
          top: Math.min(container.scrollHeight - container.clientHeight, targetScroll),
          behavior,
        });
      }
      // If top of card is scrolled above the visible top edge of the container
      else if (relativeTop < container.scrollTop + padding) {
        const targetScroll = Math.max(0, relativeTop - padding);
        container.scrollTo({
          top: targetScroll,
          behavior,
        });
      }
    },
    [activeIndex, activeItems.length]
  );

  // Trigger smooth scroll immediately and across the accordion expansion lifecycle
  useEffect(() => {
    scrollToActiveTab("smooth");

    // Re-check as accordion expands
    const timer1 = setTimeout(() => scrollToActiveTab("smooth"), 120);
    const timer2 = setTimeout(() => scrollToActiveTab("smooth"), 320);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeIndex, scrollToActiveTab]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % activeItems.length);
  }, [activeItems.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
  }, [activeItems.length]);

  const handleTabClick = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsPaused(false);
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, autoPlayDuration);

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, handleNext, autoPlayDuration]);

  // Restart video playback whenever active slide changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [activeIndex]);

  const variants = {
    enter: (dir: number) => ({
      y: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      y: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const currentItem = activeItems[activeIndex] || activeItems[0];
  const currentMediaUrl = currentItem?.image_url || currentItem?.image || "";
  const isVideo = currentItem?.media_type === "video";

  return (
    <div className={cn("w-full py-2 md:py-6 lg:py-8", className)}>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column: Content & Tabs */}
          <div className="lg:col-span-5 flex flex-col justify-start order-2 lg:order-1 pt-1">
            {!hideHeader && (
              <div className="space-y-1.5 mb-6 md:mb-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary block">
                  ({eyebrow})
                </span>
                <h2 className="tracking-tight font-display text-2xl font-bold sm:text-3xl lg:text-4xl text-foreground">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground max-w-md">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Scrollable Tabs List: Fully responsive individual frosted dark cards */}
            <div
              ref={listContainerRef}
              className="relative flex flex-col space-y-2.5 sm:space-y-3 max-h-[480px] sm:max-h-[540px] lg:max-h-[640px] overflow-y-auto overflow-x-hidden pr-1.5 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scroll-smooth"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {activeItems.map((item, index) => {
                const isActive = activeIndex === index;
                // Formatted sequence number: strictly ordered 01, 02, 03, 04...
                const formattedId = String(index + 1).padStart(2, "0");
                const itemDescription = item.desc || item.description || "";
                const isEmbedded = Boolean(item.is_embedded ?? item.embedded);
                const showGithub =
                  item.has_github !== undefined ? Boolean(item.has_github) : !isEmbedded;
                const projectGithubUrl = item.github_url?.trim()
                  ? item.github_url.trim()
                  : fallbackGithubUrl;

                return (
                  <button
                    key={`${item.title}-${index}`}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      "group relative flex items-start gap-3.5 text-left transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 rounded-2xl p-3.5 sm:p-4 border backdrop-blur-xl",
                      isActive
                        ? "bg-zinc-950/90 border-primary/50 text-foreground shadow-[0_12px_36px_-8px_rgba(0,0,0,0.85)] ring-1 ring-primary/25"
                        : "bg-zinc-950/70 border-white/10 text-muted-foreground/80 hover:text-foreground hover:bg-zinc-900/80 hover:border-white/20 shadow-md"
                    )}
                  >
                    {/* Active Progress Bar (10s duration) */}
                    {isActive && (
                      <div className="absolute left-1.5 top-3.5 bottom-3.5 w-[3px] rounded-full overflow-hidden bg-primary/20">
                        <motion.div
                          key={`progress-${index}-${isPaused}`}
                          className="w-full bg-primary origin-top"
                          initial={{ height: "0%" }}
                          animate={
                            isPaused ? { height: "0%" } : { height: "100%" }
                          }
                          transition={{
                            duration: autoPlayDuration / 1000,
                            ease: "linear",
                          }}
                        />
                      </div>
                    )}

                    {/* Sequential slide number */}
                    <span
                      className={cn(
                        "text-[10px] md:text-xs font-mono font-semibold mt-0.5 tabular-nums transition-colors",
                        isActive ? "text-primary" : "text-primary/70 group-hover:text-primary"
                      )}
                    >
                      /{formattedId}
                    </span>

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "tracking-tight transition-all duration-200",
                            isActive
                              ? "text-base sm:text-lg font-bold text-white text-balance"
                              : "text-xs sm:text-sm font-medium text-white/85 line-clamp-1 group-hover:text-white"
                          )}
                        >
                          {item.title}
                        </span>
                        {item.tag && (
                          <span
                            className={cn(
                              "text-[9px] uppercase font-mono px-2 py-0.5 rounded-full transition-colors border",
                              isActive
                                ? "bg-primary/15 text-primary border-primary/30"
                                : "bg-white/10 text-white/70 border-white/5 group-hover:text-white"
                            )}
                          >
                            {item.tag}
                          </span>
                        )}
                      </div>

                      {/* Active State Accordion: Expands dynamically according to full description */}
                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            onAnimationComplete={() => scrollToActiveTab("smooth")}
                            className="overflow-hidden"
                          >
                            {/* Total description displayed in full during slide preview */}
                            {itemDescription && (
                              <p className="text-white/75 text-xs sm:text-sm font-normal leading-relaxed pb-3 pt-1">
                                {itemDescription}
                              </p>
                            )}

                            {/* Tech Stack Badges */}
                            {item.tech && item.tech.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pb-3">
                                {item.tech.map((t) => (
                                  <span
                                    key={t}
                                    className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/80 border border-white/5"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Action Links & Badges */}
                            <div className="flex items-center gap-4 text-xs pt-0.5 pb-0.5">
                              {item.is_embedded ? (
                                <span className="inline-flex items-center gap-1.5 text-white/80 font-medium">
                                  <CircuitBoard aria-hidden="true" className="h-3.5 w-3.5 text-emerald-400" /> Hardware Build
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-white/80 font-medium">
                                  <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-primary" /> Academic Project
                                </span>
                              )}

                              {showGithub && projectGithubUrl && (
                                <a
                                  href={projectGithubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                                  aria-label={`View ${item.title} on GitHub`}
                                >
                                  <FolderGit2 className="h-3.5 w-3.5" />
                                  <span>GitHub</span>
                                  <ExternalLink aria-hidden="true" className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Media Preview (Sticky & Clean Media View) */}
          <div className="lg:col-span-7 flex flex-col justify-start lg:sticky lg:top-24 h-fit order-1 lg:order-2">
            <div
              className="relative group/gallery"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative aspect-4/3 md:aspect-16/10 lg:aspect-16/11 rounded-2xl md:rounded-3xl overflow-hidden bg-zinc-950/85 backdrop-blur-2xl border border-white/15 shadow-2xl">
                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      y: { type: "spring", stiffness: 260, damping: 32 },
                      opacity: { duration: 0.35 },
                    }}
                    className="absolute inset-0 w-full h-full cursor-pointer select-none"
                    onClick={handleNext}
                  >
                    {currentMediaUrl ? (
                      isVideo ? (
                        <video
                          ref={videoRef}
                          src={currentMediaUrl}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-102 block"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={currentMediaUrl}
                          alt={currentItem.title}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 block"
                          loading="lazy"
                        />
                      )
                    ) : (
                      /* Clean Minimal Fallback Display: ambient gradient with centered glass icon, zero text clutter */
                      <div
                        className={cn(
                          "w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br relative overflow-hidden",
                          currentItem.accent || "from-primary/20 via-background to-accent/20"
                        )}
                      >
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage:
                              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                            backgroundSize: "28px 28px",
                          }}
                        />
                        <div className="relative z-10 glass-strong grid h-24 w-24 place-items-center rounded-2xl border border-white/10 shadow-2xl">
                          {currentItem.icon ? (
                            <currentItem.icon className="h-12 w-12 text-primary" />
                          ) : (
                            <Sparkles className="h-12 w-12 text-primary" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </motion.div>
                </AnimatePresence>

                {/* Prev / Next Controls */}
                <div className="absolute bottom-5 right-5 md:bottom-7 md:right-7 flex gap-2 md:gap-3 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-background/80 backdrop-blur-md border border-border/60 flex items-center justify-center text-foreground hover:bg-background hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                    aria-label="Previous Project"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-background/80 backdrop-blur-md border border-border/60 flex items-center justify-center text-foreground hover:bg-background hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                    aria-label="Next Project"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerticalTabs;
