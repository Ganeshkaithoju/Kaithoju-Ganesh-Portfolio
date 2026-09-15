import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue, AnimatePresence, useInView } from "framer-motion";
import {
  Github, Linkedin, Mail, Phone, MapPin, Download, ArrowUpRight, ArrowRight, Code2, Server, Database, Wrench, Brain, Sparkles, Rocket, Award, GraduationCap, Briefcase, ExternalLink, Send, Menu, X, Sun, Moon, Terminal, Layers, Cpu, Globe, Shield, Zap, Star, ChevronDown, Quote, HardDrive, CircuitBoard, Leaf, Utensils, Hospital, CreditCard, CheckCircle2,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendContactNotification } from "@/lib/contact-notification";
import { PublicComments } from "@/components/PublicComments";
import { usePortfolioData, iconMap } from "@/hooks/usePortfolioData";

export const Route = createFileRoute("/")({ component: PortfolioPage });

/* ============================================================
   VIEWPORT VIDEO COMPONENT
   ============================================================ */
export function ViewportVideo({ src, className }: { src: string, className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(e => console.log("Autoplay prevented", e));
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <video 
      ref={videoRef}
      src={src} 
      className={className} 
      muted 
      playsInline 
      loop 
    />
  );
}

/* ============================================================
   DATA (from resume)
   ============================================================ */
// Fallback constants used if Supabase fetch fails or hasn't been seeded yet
const FALLBACK_EMAIL = "ganeshkaithoju4685@gmail.com";
const FALLBACK_PHONE_DISPLAY = "+91 93923 79339";
const FALLBACK_PHONE_TEL = "+919392379339";
const FALLBACK_LINKEDIN = "https://www.linkedin.com/in/ganesh-kaithoju";
const FALLBACK_GITHUB = "https://github.com/Ganeshkaithoju";

const NAV = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#timeline", label: "Timeline" },
  { href: "#contact", label: "Contact" },
];

const SKILLS = [
  { group: "Frontend", icon: Layers, items: [
    { name: "HTML5", level: 94 }, { name: "CSS3", level: 90 }, { name: "JavaScript", level: 86 }, { name: "React", level: 84 },
  ]},
  { group: "Backend", icon: Server, items: [
    { name: "Python", level: 88 }, { name: "Java", level: 82 }, { name: "Spring Boot", level: 78 }, { name: "Node.js", level: 72 },
  ]},
  { group: "Database", icon: Database, items: [
    { name: "MySQL", level: 84 },
  ]},
  { group: "Languages & Concepts", icon: Terminal, items: [
    { name: "C", level: 78 }, { name: "OOP", level: 88 }, { name: "DSA", level: 80 }, { name: "DBMS", level: 82 },
  ]},
  { group: "Embedded / IoT", icon: CircuitBoard, items: [
    { name: "Arduino UNO", level: 85 }, { name: "NodeMCU (ESP8266)", level: 80 }, { name: "Embedded C", level: 78 }, { name: "Sensors & Actuators", level: 82 },
  ]},
  { group: "Tools", icon: Wrench, items: [
    { name: "Git & GitHub", level: 84 }, { name: "VS Code", level: 94 }, { name: "UiPath (RPA)", level: 72 },
  ]},
];

const PROJECTS = [
  {
    title: "Smart Agriculture Decision Support System",
    tag: "IoT · Embedded",
    desc: "Automated irrigation using real-time soil-moisture and water-level monitoring. Arduino UNO + NodeMCU control a water pump with sensor-based decision logic and alert mechanisms, reducing water wastage and supporting sustainable crop management.",
    tech: ["Arduino UNO", "NodeMCU (ESP8266)", "Embedded C", "Sensors"],
    icon: Leaf,
    accent: "from-emerald-400 to-teal-500",
    embedded: true,
    is_embedded: true,
    has_github: false,
    github_url: "",
  },
  {
    title: "Spoonie — Self-Stabilizing Feeding Spoon",
    tag: "Assistive Tech",
    desc: "Self-stabilizing feeding spoon that assists people with hand tremors. Integrates an ADXL345 accelerometer with servo motors for real-time tremor detection and motion compensation, driven by Embedded C.",
    tech: ["Arduino UNO", "ADXL345", "Servo Motor", "Embedded C"],
    icon: Utensils,
    accent: "from-amber-400 to-orange-500",
    embedded: true,
    is_embedded: true,
    has_github: false,
    github_url: "",
  },
  {
    title: "Hospital Management System",
    tag: "Full Stack",
    desc: "Hospital portal for patient registration, doctor scheduling, billing and reports. Role-based dashboards for admins, medical staff and customers with a clean, responsive UI.",
    tech: ["React", "Spring Boot", "MySQL"],
    icon: Hospital,
    accent: "from-sky-400 to-indigo-500",
    embedded: false,
    is_embedded: false,
    has_github: true,
    github_url: "",
  },
  {
    title: "Subscription Management System",
    tag: "Full Stack",
    desc: "Responsive subscription and billing web app with admin and user dashboards. Client-side routing, role-based auth, and plan/user/subscription management — production-ready UI built to scale.",
    tech: ["React.js", "Node.js"],
    icon: CreditCard,
    accent: "from-fuchsia-400 to-purple-500",
    embedded: false,
    is_embedded: false,
    has_github: true,
    github_url: "",
  },
];

const TIMELINE = [
  { year: "2020", title: "Completed SSC", desc: "Z.P.H.S Chimanpally, Nizamabad — CGPA 10/10.", icon: GraduationCap },
  { year: "2022", title: "Completed Intermediate", desc: "Trinity Junior College, Karimnagar — 83.9%.", icon: GraduationCap },
  { year: "2022", title: "Started B.Tech (ECE)", desc: "Began Electronics & Communication Engineering at Narasimha Reddy Engineering College.", icon: Code2 },
  { year: "2025", title: "Python Intern @ YBI Foundation", desc: "Built projects like Tic-Tac-Toe and Rock-Paper-Scissors while learning core Python.", icon: Rocket },
  { year: "2025", title: "Summer Intern @ BHEL", desc: "Team member on a thermal power systems project — analysed PLC and CNC processes at BHEL Hyderabad.", icon: Briefcase },
  { year: "2026", title: "Intern @ Lumen Technologies", desc: "Intern on the Backup & Restore team at Lumen Technologies India — Bengaluru.", icon: HardDrive },
];

const SERVICES = [
  { icon: Globe, title: "Web Development", desc: "End-to-end responsive websites tailored to your brand." },
  { icon: Layers, title: "Frontend Development", desc: "Clean UIs with React, HTML, CSS and modern tooling." },
  { icon: Server, title: "Backend Development", desc: "REST APIs with Java, Spring Boot and Node.js." },
  { icon: Cpu, title: "Python Development", desc: "Automation, scripting and data-driven applications." },
  { icon: CircuitBoard, title: "Embedded / IoT", desc: "Arduino & NodeMCU projects with sensors and actuators." },
  { icon: Database, title: "Database Design", desc: "MySQL schemas that scale with your product." },
  { icon: Zap, title: "API Development", desc: "Fast, secure and well-documented REST APIs." },
  { icon: Sparkles, title: "Responsive Design", desc: "Mobile-first, accessible, delightful on every screen." },
];

const WHY_HIRE = [
  { title: "Problem Solver", desc: "Break big problems into small, testable steps." },
  { title: "Team Collaboration", desc: "Communicate clearly, review kindly, ship together." },
  { title: "Adaptability", desc: "Comfortable jumping across the stack and picking up new tools." },
  { title: "Continuous Learner", desc: "Always a new doc, a new language, a new pattern to learn." },
  { title: "Strong Fundamentals", desc: "OOP, DSA, DBMS — a well-rounded CS/ECE base." },
  { title: "Hands-on Builder", desc: "Full-stack, embedded, and hardware — I love making things work." },
  { title: "Clear Communicator", desc: "Structured writing, on-time updates, no surprises." },
  { title: "Craft-driven", desc: "I care how the code reads, not just how it runs." },
];

const ACHIEVEMENTS = [
  { label: "B.Tech CGPA", value: "8.42", suffix: "/10" },
  { label: "SSC CGPA", value: "10", suffix: "/10" },
  { label: "Projects", value: "4", suffix: "+" },
  { label: "Certifications", value: "10", suffix: "+" },
];

const CERTIFICATIONS = [
  { title: "Robotic Process Automation using UiPath", platform: "Infosys Foundation — Finishing School for Employability", date: "July 2025", icon: Shield },
  { title: "Remote Sensing Data Analytics for Crop Production Forecasting", platform: "ISRO", date: "31 July 2025", icon: Award },
  { title: "Python Internship Certificate", platform: "YBI Foundation", date: "10 April 2025", icon: Terminal },
  { title: "Java Basic Certificate", platform: "HackerRank", date: "01 November 2024", icon: Code2 },
];

const MARQUEE = ["Python", "Java", "React", "Spring Boot", "MySQL", "HTML", "CSS", "JavaScript", "Arduino", "NodeMCU", "Embedded C", "Git", "UiPath", "REST APIs", "OOP"];

/* ============================================================
   HOOKS / PRIMITIVES
   ============================================================ */
function useMagnetic(strength = 0.35) {
  const ref = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => { x.set(0); y.set(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [strength, x, y]);
  return { ref, x, y };
}

function Counter({ to, suffix = "" }: { to: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState("0");
  useEffect(() => {
    if (!inView) return;
    const isFloat = to.includes(".");
    const target = parseFloat(to);
    const dur = 1400; const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = target * eased;
      setVal(isFloat ? cur.toFixed(2) : Math.round(cur).toString());
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function SectionHeading({ eyebrow, title, subtitle, id }: { eyebrow: string; title: ReactNode; subtitle?: string; id?: string }) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {eyebrow}
      </motion.div>
      <motion.h2 id={id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.05 }} className="mt-5 text-4xl font-bold sm:text-5xl md:text-6xl">
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="mt-4 text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
function PortfolioPage() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, restDelta: 0.001 });

  // Cursor
  const cx = useMotionValue(-100), cy = useMotionValue(-100);
  const cxs = useSpring(cx, { stiffness: 500, damping: 40 });
  const cys = useSpring(cy, { stiffness: 500, damping: 40 });

  const { isLoading: dataLoading } = usePortfolioData();

  useEffect(() => {
    const onMove = (e: MouseEvent) => { cx.set(e.clientX); cy.set(e.clientY); };
    window.addEventListener("mousemove", onMove);
    const t = setTimeout(() => setLoading(false), 1400);
    return () => { window.removeEventListener("mousemove", onMove); clearTimeout(t); };
  }, [cx, cy]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      {/* Skip link */}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to main content</a>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div role="status" aria-live="polite" aria-label="Loading portfolio" exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
            <div className="text-center">
              <motion.div aria-hidden="true" animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} className="mx-auto h-16 w-16 rounded-full border-2 border-transparent" style={{ background: "conic-gradient(from 0deg, transparent, var(--neon), transparent)", WebkitMask: "radial-gradient(closest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))" }} />
              <p className="mt-6 font-mono text-sm text-muted-foreground">Loading portfolio…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom cursor */}
      <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-difference md:block" style={{ x: cxs, y: cys, background: "oklch(0.95 0 0)" }} />
      <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[89] hidden h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full md:block" style={{ x: cxs, y: cys, background: "radial-gradient(circle, oklch(0.85 0.18 165 / 0.15), transparent 70%)" }} />

      {/* Scroll progress */}
      <motion.div aria-hidden="true" style={{ scaleX }} className="fixed left-0 right-0 top-0 z-[95] h-[3px] origin-left" >
        <div className="h-full w-full" style={{ background: "var(--gradient-text)" }} />
      </motion.div>

      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] animate-blob rounded-full opacity-30" style={{ background: "radial-gradient(circle, oklch(0.85 0.18 165 / 0.5), transparent 60%)" }} />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] animate-blob rounded-full opacity-25" style={{ background: "radial-gradient(circle, oklch(0.72 0.2 295 / 0.5), transparent 60%)", animationDelay: "4s" }} />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] animate-blob rounded-full opacity-20" style={{ background: "radial-gradient(circle, oklch(0.7 0.18 220 / 0.5), transparent 60%)", animationDelay: "8s" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <Navbar navOpen={menuOpen} setNavOpen={setMenuOpen} dark={dark} setDark={setDark} />

      <main id="main">
        {(() => {
          const { sections } = usePortfolioData();
          
          const sectionRegistry: Record<string, React.FC> = {
            hero: Hero,
            marquee: MarqueeStrip,
            about: About,
            achievements: Achievements,
            stats: Achievements,
            experience: Experience,
            education: Education,
            skills: Skills,
            projects: Projects,
            timeline: Timeline,
            services: Services,
            "why-hire": WhyHire,
            certifications: Certifications,
            contact: Contact,
            comments: PublicComments
          };

          const defaultOrder = ["hero", "marquee", "about", "achievements", "skills", "projects", "experience", "education", "timeline", "services", "why-hire", "certifications", "contact", "comments"];

          let sectionsToRender = defaultOrder.map(id => ({ id, is_visible: true, display_order: defaultOrder.indexOf(id) }));

          if (sections && sections.length > 0) {
            // Merge DB sections with defaults
            sectionsToRender = defaultOrder.map(id => {
              const dbSec = sections.find((s: any) => s.id === id);
              if (dbSec) {
                return { id, is_visible: dbSec.is_visible, display_order: dbSec.display_order };
              }
              return { id, is_visible: true, display_order: defaultOrder.indexOf(id) };
            });
            
            // Add any sections from DB that aren't in defaultOrder (custom sections added via CMS)
            sections.forEach((dbSec: any) => {
              if (!defaultOrder.includes(dbSec.id)) {
                sectionsToRender.push({ id: dbSec.id, is_visible: dbSec.is_visible, display_order: dbSec.display_order });
              }
            });

            // Sort by display order
            sectionsToRender.sort((a, b) => a.display_order - b.display_order);
          }

          return sectionsToRender
            .filter(s => s.is_visible)
            .map(s => {
              const Component = sectionRegistry[s.id];
              if (Component) return <Component key={s.id} />;

              const dbSec = sections?.find((sec: any) => sec.id === s.id);
              return <CustomSection key={s.id} section={dbSec || s} />;
            });
        })()}
      </main>

      <Footer />
    </div>
  );
}

/* ============================================================
   CUSTOM DYNAMIC SECTION (Added via CMS)
   ============================================================ */
function CustomSection({ section }: { section: any }) {
  if (!section || !section.is_visible) return null;
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id={`${section.id}-title`}
          eyebrow={section.title || "Section"}
          title={section.subtitle ? <>{section.subtitle}</> : <><span className="text-gradient">{section.title}</span></>}
        />
        {section.content ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-premium p-8 sm:p-10 leading-relaxed text-muted-foreground whitespace-pre-wrap text-base sm:text-lg"
          >
            {section.content}
          </motion.div>
        ) : (
          <div className="card-premium p-8 text-center text-muted-foreground">
            <p>Content for this section can be edited in the Admin Dashboard under Website &gt; Sections.</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   NAVBAR
   ============================================================ */
function Navbar({ navOpen, setNavOpen, dark, setDark }: { navOpen: boolean; setNavOpen: (v: boolean) => void; dark: boolean; setDark: (v: boolean) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const { navigation } = usePortfolioData();
  
  // Use DB navigation if available and has visible items, otherwise fallback
  const dbNav = navigation?.filter(n => n.is_visible).sort((a, b) => a.display_order - b.display_order);
  const activeNav = dbNav && dbNav.length > 0 ? dbNav : NAV;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 1.2 }} className={`fixed inset-x-0 top-4 z-50 mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all sm:px-6 ${scrolled ? "glass-strong shadow-lg" : "glass"}`} style={{ width: "calc(100% - 2rem)" }}>
        <button onClick={() => window.location.href = "/owner-login"} className="group flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 px-2 py-1" aria-label="Owner dashboard">
          <div aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-lg font-display text-sm font-bold text-primary-foreground" style={{ background: "var(--gradient-text)" }}>GK</div>
          <span className="hidden font-display text-sm font-semibold sm:inline">Ganesh Kaithoju</span>
        </button>
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {activeNav.map((n: any) => (
            <a key={n.path || n.href} href={n.path || n.href} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">{n.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => setDark(!dark)} className="grid h-11 w-11 place-items-center rounded-lg glass hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            {dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
          <a href="#contact" className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:inline-flex">Let's talk</a>
          <button type="button" aria-label={navOpen ? "Close menu" : "Open menu"} aria-expanded={navOpen} aria-controls="mobile-nav" className="grid h-11 w-11 place-items-center rounded-lg glass md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" onClick={() => setNavOpen(!navOpen)}>
            {navOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </motion.header>
      <AnimatePresence>
        {navOpen && (
          <motion.div id="mobile-nav" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-x-4 top-20 z-40 glass-strong rounded-2xl p-4 md:hidden">
            <nav aria-label="Mobile" className="flex flex-col">
              {activeNav.map((n: any) => (
                <a key={n.path || n.href} href={n.path || n.href} onClick={() => setNavOpen(false)} className="rounded-lg px-4 py-3 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">{n.label}</a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================
   HERO
   ============================================================ */
function TypingText({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = words[i % words.length];
    const speed = del ? 40 : 80;
    const t = setTimeout(() => {
      if (!del && text === cur) { setTimeout(() => setDel(true), 1400); return; }
      if (del && text === "") { setDel(false); setI(i + 1); return; }
      setText(del ? cur.slice(0, text.length - 1) : cur.slice(0, text.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [text, del, i, words]);
  return (
    <span className="text-gradient">{text}<span aria-hidden="true" className="inline-block w-[2px] translate-y-1 animate-pulse bg-primary" style={{ height: "1em" }} /></span>
  );
}

function MagneticButton({ children, href, variant = "primary", download, ariaLabel }: { children: ReactNode; href: string; variant?: "primary" | "ghost"; download?: string; ariaLabel?: string }) {
  const { ref, x, y } = useMagnetic(0.3);
  const cls = variant === "primary"
    ? "bg-primary text-primary-foreground hover:shadow-[0_0_40px_oklch(0.85_0.18_165/0.5)]"
    : "glass hover:bg-white/10";
  return (
    <motion.a
      ref={ref as any}
      href={href}
      aria-label={ariaLabel}
      download={download}
      target={download ? undefined : href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      style={{ x, y }}
      className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${cls}`}
    >
      {children}
    </motion.a>
  );
}

function Hero() {
  const { siteSettings } = usePortfolioData();
  
  const heroName = siteSettings?.hero_name || "Ganesh";
  const heroSubtitles = siteSettings?.hero_subtitles?.length ? siteSettings.hero_subtitles : ["full-stack web apps", "clean interfaces", "reliable systems", "IoT that ships"];
  const heroBio = siteSettings?.hero_bio || "Aspiring Software & Full-Stack Developer working with HTML, CSS, JavaScript, React, Python, Java and Spring Boot. Currently interning on the Backup & Restore team at Lumen Technologies India.";
  const linkedinUrl = siteSettings?.linkedin_url || FALLBACK_LINKEDIN;
  const githubUrl = siteSettings?.github_url || FALLBACK_GITHUB;
  const email = siteSettings?.email || FALLBACK_EMAIL;
  const resumeUrl = siteSettings?.resume_url || "#";
  
  const codeCard = siteSettings?.hero_code_card || {
    name: "Kaithoju Ganesh",
    role: "Software & Full-Stack Dev",
    stack: ["React", "Node", "Python", "Java", "Spring Boot", "MySQL"],
    focus: "reliable · elegant · fast",
    cgpa: 8.42,
    now: "Intern @ Lumen — Backup & Restore",
    shipping: true
  };

  return (
    <section id="home" aria-labelledby="hero-title" className="relative flex min-h-dvh items-center px-4 pt-32 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.4 }} className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs">
            <span aria-hidden="true" className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
            {codeCard.now}
          </motion.div>
          <motion.h1 id="hero-title" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.5 }} className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Hi, I'm <span className="text-gradient">{heroName}</span>.<br />
            I build <TypingText words={heroSubtitles} />
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.7 }} className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            {heroBio}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.85 }} className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton href="#projects">View my work <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></MagneticButton>
            <MagneticButton href="#contact" variant="ghost">Get in touch <ArrowRight aria-hidden="true" className="h-4 w-4" /></MagneticButton>
            {resumeUrl ? (
              <a href={`${resumeUrl}?download=`} download="Ganesh_Kaithoju_Resume.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                <Download aria-hidden="true" className="h-4 w-4" /> Download Resume
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-muted-foreground/50 cursor-not-allowed" title="Resume not available">
                <Download aria-hidden="true" className="h-4 w-4" /> Resume Unavailable
              </span>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 2 }} className="mt-10 flex items-center gap-5 text-muted-foreground">
            <a aria-label="LinkedIn profile" href={linkedinUrl} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Linkedin aria-hidden="true" className="h-5 w-5" /></a>
            <a aria-label="GitHub profile" href={githubUrl} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Github aria-hidden="true" className="h-5 w-5" /></a>
            <a aria-label="Send email" href={`mailto:${email}`} className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Mail aria-hidden="true" className="h-5 w-5" /></a>
            <div aria-hidden="true" className="ml-2 h-px w-16 bg-border" />
            <span aria-hidden="true" className="font-mono text-xs">scroll ↓</span>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 1.6 }} className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
          <div className="absolute inset-0 rounded-3xl animate-gradient" style={{ background: "conic-gradient(from 0deg, oklch(0.85 0.18 165 / 0.4), oklch(0.72 0.2 295 / 0.4), oklch(0.7 0.18 220 / 0.4), oklch(0.85 0.18 165 / 0.4))", filter: "blur(40px)" }} />
          <motion.div animate={{ rotateY: [0, 6, -6, 0], rotateX: [0, -4, 4, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="relative h-full w-full rounded-3xl card-premium p-6" style={{ transformStyle: "preserve-3d" }}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400/70" /><span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" /><span className="h-2.5 w-2.5 rounded-full bg-green-400/70" /></div>
              <span className="font-mono">ganesh.tsx</span>
            </div>
            <pre className="mt-4 overflow-hidden font-mono text-[13px] leading-relaxed">
{`const dev = ${JSON.stringify(codeCard, null, 2)};`}
            </pre>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[Code2, Server, HardDrive].map((Icon, i) => (
                <motion.div key={i} whileHover={{ y: -4 }} className="glass grid aspect-square place-items-center rounded-xl">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </motion.div>
              ))}
            </div>
            <div className="absolute -right-4 -top-4 animate-float glass rounded-2xl px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> CGPA {codeCard.cgpa !== undefined ? codeCard.cgpa : "8.42"}</div>
            </div>
            <div className="absolute -bottom-4 -left-4 animate-float glass rounded-2xl px-3 py-2 text-xs" style={{ animationDelay: "1.5s" }}>
              <div className="flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {codeCard.badge_bottom || codeCard.role || "Backup & Restore"}</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <motion.div aria-hidden="true" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground">
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}

function MarqueeStrip() {
  const { marquee, sections } = usePortfolioData();
  const items = marquee?.length ? marquee : MARQUEE;

  const section = sections?.find(s => s.id === 'marquee');
  if (sections && section && !section.is_visible) return null;

  return (
    <div aria-hidden="true" className="relative my-12 overflow-hidden py-6">
      <div className="mx-auto max-w-6xl border-y border-border/60 py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...items, ...items, ...items, ...items].map((t, i) => (
            <span key={i} className="mx-8 font-display text-2xl font-medium text-muted-foreground sm:text-3xl">
              <span className="text-gradient">✦</span> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ABOUT
   ============================================================ */
function About() {
  const { siteSettings, sections } = usePortfolioData();
  const section = sections?.find(s => s.id === 'about');
  if (sections && section && !section.is_visible) return null;

  const focus = siteSettings?.about_focus_areas?.length ? siteSettings.about_focus_areas : ["Full-Stack Development", "Backend & APIs", "Database Design", "Embedded / IoT", "Python Automation", "Data Structures & OOP"];
  const paragraphs = siteSettings?.about_paragraphs?.length ? siteSettings.about_paragraphs : [
    "I'm Kaithoju Ganesh, an aspiring Software & Full-Stack Developer pursuing my B.Tech in Electronics & Communication Engineering at Narasimha Reddy Engineering College.",
    "I enjoy building dynamic, responsive, user-friendly applications — from React front-ends to Java / Spring Boot APIs and MySQL back-ends — and I'm equally at home with Arduino, NodeMCU and Embedded C.",
    "Right now I'm an Intern on the Backup & Restore team at Lumen Technologies India, learning enterprise engineering practices and shipping alongside a real product team.",
    "Outside of coursework I love turning ideas into working prototypes — automating irrigation, building assistive devices, and shipping full-stack side projects."
  ];

  return (
    <section id="about" aria-labelledby="about-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading 
          id="about-title" 
          eyebrow={section?.title || "About"} 
          title={section?.subtitle ? <>{section.subtitle}</> : <>Passionate about <span className="text-gradient">building software that matters</span></>} 
        />
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            {paragraphs.map((p: any, i: number) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
          </motion.div>
          <motion.ul initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="grid grid-cols-2 gap-4 list-none">
            {focus.map((f: any, i: number) => (
              <motion.li key={f} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} className="card-premium p-5">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg glass"><span className="font-mono text-xs text-primary">0{i + 1}</span></div>
                <div className="font-display font-semibold">{f}</div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ACHIEVEMENTS
   ============================================================ */
function Achievements() {
  const { achievements, sections } = usePortfolioData();
  const items = achievements?.length ? achievements : ACHIEVEMENTS;

  const section = sections?.find(s => s.id === 'achievements' || s.id === 'stats');
  if (sections && section && !section.is_visible) return null;

  return (
    <section id="achievements" aria-labelledby="achievements-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="achievements-title"
          eyebrow={section?.title || "Achievements"}
          title={section?.subtitle ? <>{section.subtitle}</> : <>Key <span className="text-gradient">Milestones & Numbers</span></>}
        />
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border/60 bg-background/50 p-6 shadow-sm backdrop-blur-xl md:grid-cols-4 md:p-8">
          {items.map((s: any, i: number) => (
            <motion.div
              key={s.label || s.title || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-premium p-6 text-center flex flex-col items-center justify-center"
            >
              <div className="font-display text-4xl font-bold text-gradient sm:text-5xl">
                <Counter to={s.value || s.metric || "0"} suffix={s.suffix || ""} />
              </div>
              <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.label || s.title}</div>
              {s.description && (
                <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-2">{s.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const Stats = Achievements;

/* ============================================================
   EXPERIENCE
   ============================================================ */
function Experience() {
  const { experience, sections } = usePortfolioData();

  const fallbackRoles = [
    {
      title: "Intern — Backup & Restore",
      company: "Lumen Technologies India",
      period: "2026 — Present",
      location: "Bengaluru, IN",
      is_current: true,
      icon: HardDrive,
      bullets: [
        "Working with the Backup & Restore team on enterprise data-protection workflows",
        "Learning production-grade backup/restore tooling, monitoring and troubleshooting",
        "Collaborating within an Agile team — standups, sprints, code reviews",
        "Sharpening scripting and debugging skills against real infrastructure",
      ],
    },
    {
      title: "Summer Intern",
      company: "BHEL — Bharat Heavy Electricals Limited",
      period: "May 2025 — June 2025",
      location: "Hyderabad, IN",
      is_current: false,
      icon: Briefcase,
      bullets: [
        "Team member on a thermal power systems project",
        "Analyzed PLC and CNC processes on the shop floor",
        "Hands-on exposure to industrial automation and cross-functional teamwork",
      ],
    },
    {
      title: "Python Intern",
      company: "YBI Foundation",
      period: "March 2025 — April 2025",
      location: "Remote",
      is_current: false,
      icon: Terminal,
      bullets: [
        "Learned core Python concepts and standard libraries",
        "Built projects like Tic-Tac-Toe and Rock-Paper-Scissors",
        "Strengthened programming fundamentals and problem-solving",
      ],
    },
  ];

  const roles = experience?.length ? experience : fallbackRoles;

  const section = sections?.find(s => s.id === 'experience');
  if (sections && section && !section.is_visible) return null;

  return (
    <section id="experience" aria-labelledby="experience-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading 
          id="experience-title" 
          eyebrow={section?.title || "Experience"} 
          title={section?.subtitle ? <>{section.subtitle}</> : <>Where I've been <span className="text-gradient">learning &amp; shipping</span></>} 
        />
        <div className="space-y-6">
          {roles.map((r, i) => (
            <motion.article key={r.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.05 }} className="relative overflow-hidden card-premium p-8 sm:p-10">
              {r.is_current && <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full" style={{ background: "radial-gradient(circle, oklch(0.85 0.18 165 / 0.25), transparent 60%)" }} />}
              <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr]">
                <div aria-hidden="true" className="grid h-20 w-20 place-items-center rounded-2xl" style={{ background: "var(--gradient-text)" }}>
                  <r.icon className="h-9 w-9 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-display text-2xl font-bold sm:text-3xl">{r.title}</h3>
                    {r.is_current && <span className="rounded-full glass px-3 py-1 text-xs text-primary">Current</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-muted-foreground">
                    <span className="font-medium text-foreground">{r.company}</span>
                    <span aria-hidden="true" className="text-xs">•</span>
                    <span className="text-sm">{r.period}</span>
                    <span aria-hidden="true" className="text-xs">•</span>
                    <span className="inline-flex items-center gap-1 text-sm"><MapPin aria-hidden="true" className="h-3.5 w-3.5" /> {r.location}</span>
                  </div>
                  <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {r.bullets.map((b: string) => (
                      <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                        <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   EDUCATION
   ============================================================ */
function Education() {
  const { education, sections } = usePortfolioData();

  const fallbackEducation = [
    { title: "B.Tech — Electronics & Communication", institution: "Narasimha Reddy Engineering College · 2022 – 2026", score: "CGPA 8.42 / 10" },
    { title: "Intermediate", institution: "Trinity Junior College, Karimnagar · 2020 – 2022", score: "83.9%" },
    { title: "SSC", institution: "Z.P.H.S Chimanpally, Nizamabad · 2019 – 2020", score: "CGPA 10 / 10" },
  ];

  const eduItems = education?.length ? education : fallbackEducation;

  const section = sections?.find(s => s.id === 'education');
  if (sections && section && !section.is_visible) return null;

  return (
    <section id="education" aria-labelledby="education-title" className="relative px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading 
          id="education-title" 
          eyebrow={section?.title || "Education"} 
          title={section?.subtitle ? <>{section.subtitle}</> : <>My <span className="text-gradient">academic journey</span></>} 
        />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {eduItems.map((e) => (
            <div key={e.title} className="card-premium p-6">
              <div className="mb-3 flex items-center gap-3">
                <div aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl glass"><GraduationCap className="h-5 w-5 text-primary" /></div>
                <h4 className="font-display text-base font-semibold">{e.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{e.institution}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs"><Star aria-hidden="true" className="h-3.5 w-3.5 text-primary" /> {e.score}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   SKILLS
   ============================================================ */
function Skills() {
  const { skills, sections } = usePortfolioData();
  const items = skills?.length ? skills : SKILLS;

  const section = sections?.find(s => s.id === 'skills');
  if (sections && section && !section.is_visible) return null;

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading 
          id="skills-title" 
          eyebrow={section?.title || "Skills"} 
          title={section?.subtitle ? <>{section.subtitle}</> : <>My <span className="text-gradient">technical toolbox</span></>} 
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s, gi) => (
            <motion.div key={s.group} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: gi * 0.05 }} whileHover={{ y: -6 }} className="card-premium group relative overflow-hidden p-6">
              <div aria-hidden="true" className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100" style={{ background: "oklch(0.85 0.18 165 / 0.35)" }} />
              <div className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <div aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-lg glass"><s.icon className="h-5 w-5 text-primary" /></div>
                  <h3 className="font-display text-lg font-semibold">{s.group}</h3>
                </div>
                <div className="space-y-3">
                  {s.items.map((it: any) => (
                    <div key={it.name} role="group" aria-label={`${it.name} proficiency ${it.level}%`}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-foreground">{it.name}</span>
                        <span className="font-mono text-muted-foreground">{it.level}%</span>
                      </div>
                      <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${it.level}%` }} viewport={{ once: true }} transition={{ duration: 1.1, ease: "easeOut" }} className="h-full rounded-full" style={{ background: "var(--gradient-text)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PROJECTS
   ============================================================ */
function Projects() {
  const { projects, siteSettings, sections } = usePortfolioData();
  const items = projects?.length ? projects : PROJECTS;
  const githubUrl = siteSettings?.github_url || FALLBACK_GITHUB;

  const section = sections?.find(s => s.id === 'projects');
  if (sections && section && !section.is_visible) return null;

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading 
          id="projects-title" 
          eyebrow={section?.title || "Projects"} 
          title={section?.subtitle ? <>{section.subtitle}</> : <>Selected <span className="text-gradient">work</span></>} 
          subtitle="A handful of things I've designed, built, and shipped."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((p, i) => (
            <motion.article key={p.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }} whileHover={{ y: -8 }} className="card-premium group relative flex flex-col overflow-hidden">
              <div aria-hidden="true" className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br ${p.accent}`}>
                {p.image_url ? (
                  p.media_type === 'video' ? (
                    <ViewportVideo src={p.image_url} className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-80" />
                  ) : (
                    <img src={p.image_url} alt={p.title} className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-80" />
                  )
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="glass-strong grid h-20 w-20 place-items-center rounded-2xl">
                        {p.icon && <p.icon className="h-9 w-9 text-white/95" />}
                      </div>
                    </div>
                  </>
                )}
                <span className="absolute left-4 top-4 rounded-full glass-strong px-3 py-1 text-xs">{p.tag}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tech?.map((t: any) => (
                    <span key={t} className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                  <span className="inline-flex items-center gap-1 text-muted-foreground"><Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Academic Project</span>
                  {(() => {
                    const isEmbedded = Boolean(p.is_embedded ?? p.embedded);
                    const showGithub = p.has_github !== undefined ? Boolean(p.has_github) : !isEmbedded;
                    const projectGithubUrl = p.github_url?.trim() ? p.github_url.trim() : githubUrl;

                    if (showGithub) {
                      return (
                        <a
                          href={projectGithubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                          aria-label={`View ${p.title} related work on GitHub`}
                        >
                          GitHub <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                        </a>
                      );
                    }

                    if (isEmbedded) {
                      return (
                        <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                          <CircuitBoard aria-hidden="true" className="h-3.5 w-3.5" /> Hardware Build
                        </span>
                      );
                    }

                    return null;
                  })()}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TIMELINE
   ============================================================ */
function Timeline() {
  const { timeline, sections } = usePortfolioData();
  const items = timeline?.length ? timeline : TIMELINE;

  const section = sections?.find(s => s.id === 'timeline');
  if (sections && section && !section.is_visible) return null;

  return (
    <section id="timeline" aria-labelledby="timeline-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeading 
          id="timeline-title" 
          eyebrow={section?.title || "Timeline"} 
          title={section?.subtitle ? <>{section.subtitle}</> : <>The <span className="text-gradient">journey so far</span></>} 
        />
        <ol className="relative list-none">
          <div aria-hidden="true" className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent md:left-1/2 md:-translate-x-1/2" />
          {items.map((t: any, i: number) => {
            const left = i % 2 === 0;
            const IconComponent = t.icon || (t.icon_name && iconMap[t.icon_name]) || GraduationCap;
            return (
              <motion.li key={(t.year || "") + (t.title || "") + i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 * i }} className={`relative mb-10 flex flex-col md:flex-row ${left ? "md:justify-start" : "md:justify-end"}`}>
                <div aria-hidden="true" className={`absolute left-4 top-4 h-4 w-4 -translate-x-1/2 rounded-full ring-4 ring-background md:left-1/2 animate-pulse-glow`} style={{ background: "var(--gradient-text)" }} />
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${left ? "md:pr-8 md:text-right" : "md:ml-auto md:pl-8"}`}>
                  <div className="card-premium p-6">
                    <div className={`mb-2 flex items-center gap-2 ${left ? "md:justify-end" : ""}`}>
                      <IconComponent className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span className="font-mono text-sm text-primary">{t.year}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold">{t.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.desc || t.description}</p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ============================================================
   SERVICES
   ============================================================ */
function Services() {
  const { services, sections } = usePortfolioData();
  const items = services?.length ? services : SERVICES;

  const section = sections?.find(s => s.id === 'services');
  if (sections && section && !section.is_visible) return null;

  return (
    <section id="services" aria-labelledby="services-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading 
          id="services-title" 
          eyebrow={section?.title || "Services"} 
          title={section?.subtitle ? <>{section.subtitle}</> : <>How I can <span className="text-gradient">help</span></>} 
          subtitle="From landing pages to full products and hardware prototypes."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }} whileHover={{ y: -6 }} className="card-premium group relative overflow-hidden p-6">
              <div aria-hidden="true" className="mb-4 grid h-11 w-11 place-items-center rounded-xl transition-transform group-hover:scale-110" style={{ background: "var(--gradient-text)" }}>
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   WHY HIRE
   ============================================================ */
function WhyHire() {
  const { whyHire, sections } = usePortfolioData();
  const items = whyHire?.length ? whyHire : WHY_HIRE;

  const section = sections?.find(s => s.id === 'why-hire');
  if (sections && section && !section.is_visible) return null;

  return (
    <section aria-labelledby="why-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading 
          id="why-title" 
          eyebrow={section?.title || "Why hire me"} 
          title={section?.subtitle ? <>{section.subtitle}</> : <>Reasons I might be a <span className="text-gradient">good fit</span></>} 
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((w, i) => (
            <motion.div key={w.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }} className="card-premium p-5">
              <div className="mb-2 font-mono text-xs text-primary">0{i + 1}</div>
              <div className="font-display font-semibold">{w.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CERTIFICATIONS
   ============================================================ */
function Certifications() {
  const { certifications, sections } = usePortfolioData();
  const items = certifications?.length ? certifications : CERTIFICATIONS;

  const section = sections?.find(s => s.id === 'certifications');
  if (sections && section && !section.is_visible) return null;

  return (
    <section aria-labelledby="certs-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeading 
          id="certs-title" 
          eyebrow={section?.title || "Certifications"} 
          title={section?.subtitle ? <>{section.subtitle}</> : <>Credentials &amp; <span className="text-gradient">learning</span></>} 
        />
        <ul className="grid grid-cols-1 gap-5 list-none">
          {items.map((c: any, i: number) => (
            <motion.li key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="card-premium flex flex-col sm:flex-row sm:items-center gap-5 p-6">
              <div className="flex items-center gap-5 flex-1">
                {c.image_url ? (
                  <div aria-hidden="true" className="shrink-0 h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    {c.media_type === 'video' ? (
                      <ViewportVideo src={c.image_url} className="h-full w-full object-cover" />
                    ) : (
                      <img src={c.image_url} alt={c.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                ) : (
                  <div aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-text)" }}>
                    <c.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-display text-lg font-semibold">{c.title || c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.platform || c.issuer} · Issued {c.date}</p>
                </div>
              </div>
              {c.url && (
                <a href={c.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded mt-2 sm:mt-0" aria-label={`View ${c.title} credential`}>
                  View Credential <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================
   CONTACT
   ============================================================ */
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

function Contact() {
  const { siteSettings, sections } = usePortfolioData();
  const email = siteSettings?.email || FALLBACK_EMAIL;
  const phoneDisplay = siteSettings?.phone_display || FALLBACK_PHONE_DISPLAY;
  const phoneTel = siteSettings?.phone_tel || FALLBACK_PHONE_TEL;
  const linkedinUrl = siteSettings?.linkedin_url || FALLBACK_LINKEDIN;
  const resumeUrl = siteSettings?.resume_url;

  const section = sections?.find(s => s.id === 'contact');
  if (sections && section && !section.is_visible) return null;

  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof z.infer<typeof contactSchema>, string>>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setErrors({});
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof errors;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      // Store in Supabase contact_messages table
      const { error } = await supabase.from("contact_messages").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
        status: "pending",
        is_pinned: false,
        is_featured: false,
      });
      if (error) throw error;

      // Send real-time notification to owner via Google Apps Script (if configured)
      const gasUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
      if (gasUrl && typeof gasUrl === "string" && gasUrl.trim().length > 0) {
        sendContactNotification(parsed.data, gasUrl);
      }

      form.reset();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Contact submission failed", err);
      toast.error("There is a failure occurred while sharing your message, please try after some time");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading 
          id="contact-title" 
          eyebrow={section?.title || "Contact"} 
          title={section?.subtitle ? <>{section.subtitle}</> : <>Let's build <span className="text-gradient">something great</span></>} 
          subtitle="Have a project, a role, or just want to say hi? My inbox is open." 
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
              { icon: Phone, label: "Phone", value: phoneDisplay, href: `tel:${phoneTel}` },
              { icon: MapPin, label: "Location", value: "Hyderabad, Telangana, India", href: "https://www.google.com/maps/place/Hyderabad" },
              { icon: Linkedin, label: "LinkedIn", value: "/in/ganesh-kaithoju", href: linkedinUrl },
              resumeUrl ? { icon: Download, label: "Resume", value: "Download PDF", href: `${resumeUrl}?download=` } : null,
            ].filter(Boolean).map((c: any) => (
              <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noreferrer" : undefined} className="card-premium group flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                <div aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-xl glass"><c.icon className="h-5 w-5 text-primary" /></div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
                  <div className="font-medium">{c.value}</div>
                </div>
                <ArrowUpRight aria-hidden="true" className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
          <motion.form initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} onSubmit={onSubmit} noValidate className="card-premium space-y-4 p-8" aria-label="Contact form">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" placeholder="Your name" required maxLength={100} error={errors.name} />
              <Field label="Email" name="email" type="email" placeholder="you@example.com" required maxLength={255} error={errors.email} />
            </div>
            <Field label="Subject" name="subject" placeholder="What's this about?" required maxLength={200} error={errors.subject} />
            <Field label="Message" name="message" placeholder="Tell me a bit about your project…" textarea required maxLength={2000} error={errors.message} />
            <button type="submit" disabled={submitting} className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-medium text-primary-foreground transition-all hover:shadow-[0_0_40px_oklch(0.85_0.18_165/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? "Sending…" : (<>Send message <Send aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>)}
            </button>
            <p className="text-xs text-muted-foreground">Your message is stored securely and only I can read it.</p>
          </motion.form>
        </div>
      </div>

      {/* Animated Success Popup Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-success-title"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-white/10 bg-[oklch(0.16_0.02_260)]/95 p-8 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label="Close success popup"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Glowing Icon Container */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
                className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-primary shadow-[0_0_50px_oklch(0.85_0.18_165/0.4)]"
              >
                <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-40" />
                <CheckCircle2 className="relative h-10 w-10 text-primary" />
              </motion.div>

              {/* Large "Success" text */}
              <motion.h3
                id="contact-success-title"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
              >
                <span className="text-gradient">Success</span>
              </motion.h3>

              {/* "message sent successfully" subtext */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-2 text-base sm:text-lg font-medium text-foreground/90"
              >
                Message sent successfully
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs"
              >
                Thank you for reaching out! A confirmation email has been sent to your email address, and I will get back to you as soon as possible.
              </motion.p>

              {/* Done Button */}
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition-all"
              >
                Done
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Field({ label, name, type = "text", placeholder, required, textarea, maxLength, error }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; textarea?: boolean; maxLength?: number; error?: string }) {
  const id = `field-${name}`;
  const errId = `${id}-error`;
  const cls = `w-full rounded-xl border ${error ? "border-red-400/70" : "border-white/10"} bg-white/[0.03] px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
        {label}{required && <span aria-hidden="true" className="ml-0.5 text-primary">*</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={name} placeholder={placeholder} required={required} rows={5} maxLength={maxLength} aria-invalid={!!error} aria-describedby={error ? errId : undefined} className={cls} />
      ) : (
        <input id={id} name={name} type={type} placeholder={placeholder} required={required} maxLength={maxLength} aria-invalid={!!error} aria-describedby={error ? errId : undefined} className={cls} />
      )}
      {error && <p id={errId} role="alert" className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  const { siteSettings } = usePortfolioData();

  const linkedinUrl = siteSettings?.linkedin_url || FALLBACK_LINKEDIN;
  const githubUrl = siteSettings?.github_url || FALLBACK_GITHUB;
  const email = siteSettings?.email || FALLBACK_EMAIL;
  const resumeUrl = siteSettings?.resume_url;

  return (
    <footer className="relative border-t border-border/60 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-lg font-display text-sm font-bold text-primary-foreground" style={{ background: "var(--gradient-text)" }}>GK</div>
          <div>
            <div className="font-display font-semibold">Kaithoju Ganesh</div>
            <div className="text-xs text-muted-foreground">Software &amp; Full-Stack Developer · Hyderabad, IN</div>
          </div>
        </div>
        <nav aria-label="Footer social links" className="flex items-center gap-5 text-muted-foreground">
          <a aria-label="LinkedIn" href={linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Linkedin aria-hidden="true" className="h-5 w-5" /></a>
          <a aria-label="GitHub" href={githubUrl} target="_blank" rel="noreferrer" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Github aria-hidden="true" className="h-5 w-5" /></a>
          <a aria-label="Email" href={`mailto:${email}`} className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Mail aria-hidden="true" className="h-5 w-5" /></a>
          {resumeUrl && <a aria-label="Download resume" href={`${resumeUrl}?download=`} download="Ganesh_Kaithoju_Resume.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Download aria-hidden="true" className="h-5 w-5" /></a>}
        </nav>
        <div className="text-center text-xs text-muted-foreground md:text-right">
          <div>© {new Date().getFullYear()} Kaithoju Ganesh. All rights reserved.</div>
          <div className="mt-1">Designed &amp; developed by <span className="text-gradient font-medium">Kaithoju Ganesh</span></div>
        </div>
      </div>
    </footer>
  );
}
