import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue, AnimatePresence, useInView } from "framer-motion";
import {
  Github, Linkedin, Mail, Phone, MapPin, Download, ArrowUpRight, ArrowRight, Code2, Server, Database, Wrench, Brain, Sparkles, Rocket, Award, GraduationCap, Briefcase, ExternalLink, Send, Menu, X, Sun, Moon, Terminal, Layers, Cpu, Globe, Shield, Zap, Star, ChevronDown, Quote, HardDrive, CircuitBoard, Leaf, Utensils, Hospital, CreditCard,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendToWhatsApp } from "@/lib/whatsapp-integration.server";
import resumeAsset from "@/assets/resume.pdf.asset.json";
import { PublicComments } from "@/components/PublicComments";

export const Route = createFileRoute("/")({ component: PortfolioPage });

/* ============================================================
  DATA (from resume)
  ============================================================ */
const RESUME_URL = resumeAsset.url;
const EMAIL = "ganeshkaithoju4685@gmail.com";
const PHONE_DISPLAY = "+91 93923 79339";
const PHONE_TEL = "+919392379339";
const LINKEDIN = "https://www.linkedin.com/in/ganesh-kaithoju";
const GITHUB = "https://github.com/Ganeshkaithoju";

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
  },
  {
    title: "Spoonie — Self-Stabilizing Feeding Spoon",
    tag: "Assistive Tech",
    desc: "Self-stabilizing feeding spoon that assists people with hand tremors. Integrates an ADXL345 accelerometer with servo motors for real-time tremor detection and motion compensation, driven by Embedded C.",
    tech: ["Arduino UNO", "ADXL345", "Servo Motor", "Embedded C"],
    icon: Utensils,
    accent: "from-amber-400 to-orange-500",
    embedded: true,
  },
  {
    title: "Hospital Management System",
    tag: "Full Stack",
    desc: "Hospital portal for patient registration, doctor scheduling, billing and reports. Role-based dashboards for admins, medical staff and customers with a clean, responsive UI.",
    tech: ["React", "Spring Boot", "MySQL"],
    icon: Hospital,
    accent: "from-sky-400 to-indigo-500",
  },
  {
    title: "Subscription Management System",
    tag: "Full Stack",
    desc: "Responsive subscription and billing web app with admin and user dashboards. Client-side routing, role-based auth, and plan/user/subscription management — production-ready UI built to scale.",
    tech: ["React.js", "Node.js"],
    icon: CreditCard,
    accent: "from-fuchsia-400 to-purple-500",
  },
];

const TIMELINE = [
  { year: "2020", title: "Completed SSC", desc: "Z.P.H.S Chimanpally, Nizamabad — CGPA 10/10.", icon: GraduationCap },
  { year: "2022", title: "Completed Intermediate", desc: "Trinity Junior College, Karimnagar — 83.9%.", icon: GraduationCap },
  { year: "2022", title: "Started B.Tech (ECE)", desc: "Began Electronics & Communication Engineering at Narasimha Reddy Engineering College.", icon: Code2 },
  { year: "2025", title: "Python Intern @ YBI Foundation", desc: "Built projects like Tic-Tac-Toe and Rock-Paper-Scissors while learning core Python.", icon: Rocket },
  { year: "2025", title: "Summer Intern @ BHEL", desc: "Team member on a thermal power systems project — analysed PLC and CNC processes at BHEL Hyderabad.", icon: Briefcase },
  { year: "2026", title: "Completed B.Tech (ECE)", desc: "Graduated from Narasimha Reddy Engineering College with CGPA 8.44/10.", icon: GraduationCap },
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
  const [dark, setDark] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, restDelta: 0.001 });

  // Cursor
  const cx = useMotionValue(-100), cy = useMotionValue(-100);
  const cxs = useSpring(cx, { stiffness: 500, damping: 40 });
  const cys = useSpring(cy, { stiffness: 500, damping: 40 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => { cx.set(e.clientX); cy.set(e.clientY); };
    window.addEventListener("mousemove", onMove);
    const t = setTimeout(() => setLoading(false), 1400);
    return () => { window.removeEventListener("mousemove", onMove); clearTimeout(t); };
  }, [cx, cy]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme) {
      setDark(storedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", dark ? "dark" : "light");
    }
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
        <div className="absolute -top-40 -left-40 h-125 w-125 animate-blob rounded-full opacity-30" style={{ background: "radial-gradient(circle, oklch(0.85 0.18 165 / 0.5), transparent 60%)" }} />
        <div aria-hidden="true" className="absolute top-1/3 -right-40 h-150 w-150 animate-blob rounded-full opacity-25" style={{ background: "radial-gradient(circle, oklch(0.72 0.2 295 / 0.5), transparent 60%)", animationDelay: "4s" }} />
        <div className="absolute bottom-0 left-1/3 h-100 w-100 animate-blob rounded-full opacity-20" style={{ background: "radial-gradient(circle, oklch(0.7 0.18 220 / 0.5), transparent 60%)", animationDelay: "8s" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <Navbar navOpen={menuOpen} setNavOpen={setMenuOpen} dark={dark} setDark={setDark} />

      <main id="main">
        <Hero />
        <MarqueeStrip />
        <About />
        <Stats />
        <Experience />
        <Skills />
        <Projects />
        <Timeline />
        <Services />
        <WhyHire />
        <Certifications />
        <Contact />
        <PublicComments />
      </main>

      <Footer />
    </div>
  );
}

/* ============================================================
  NAVBAR
   ============================================================ */
function Navbar({ navOpen, setNavOpen, dark, setDark }: { navOpen: boolean; setNavOpen: (v: boolean) => void; dark: boolean; setDark: (v: boolean) => void }) {
  const [scrolled, setScrolled] = useState(false);
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
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">{n.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => setDark(!dark)} className="grid h-11 w-11 place-items-center rounded-lg glass hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            {dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
          <a href="#contact" className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:inline-flex">Let's talk</a>
          <button type="button" aria-label={navOpen ? "Close menu" : "Open menu"} aria-expanded={navOpen ? "true" : "false"}
            aria-controls="mobile-nav" className="grid h-11 w-11 place-items-center rounded-lg glass md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" onClick={() => setNavOpen(!navOpen)}>
            {navOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </motion.header>
      <AnimatePresence>
        {navOpen && (
          <motion.div id="mobile-nav" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-x-4 top-20 z-40 glass-strong rounded-2xl p-4 md:hidden">
            <nav aria-label="Mobile" className="flex flex-col">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} onClick={() => setNavOpen(false)} className="rounded-lg px-4 py-3 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">{n.label}</a>
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
  return (
    <section id="home" aria-labelledby="hero-title" className="relative flex min-h-dvh items-center px-4 pt-32 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.4 }} className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs">
            <span aria-hidden="true" className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
            Intern @ Lumen · Backup &amp; Restore · Bengaluru, IN
          </motion.div>
          <motion.h1 id="hero-title" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.5 }} className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Hi, I'm <span className="text-gradient">Ganesh</span>.<br />
            I build <TypingText words={["full-stack web apps", "clean interfaces", "reliable systems", "IoT that ships"]} />
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.7 }} className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Aspiring Software &amp; Full-Stack Developer working with HTML, CSS, JavaScript, React, Python, Java and Spring Boot. Currently interning on the <span className="text-foreground">Backup &amp; Restore team at Lumen Technologies India</span>.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.85 }} className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton href="#projects">View my work <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></MagneticButton>
            <MagneticButton href="#contact" variant="ghost">Get in touch <ArrowRight aria-hidden="true" className="h-4 w-4" /></MagneticButton>
            <a href={RESUME_URL} download="Ganesh_Kaithoju_Resume.pdf" rel="noopener" className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
              <Download aria-hidden="true" className="h-4 w-4" /> Download Resume
            </a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 2 }} className="mt-10 flex items-center gap-5 text-muted-foreground">
            <a aria-label="LinkedIn profile" href={LINKEDIN} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Linkedin aria-hidden="true" className="h-5 w-5" /></a>
            <a aria-label="GitHub profile" href={GITHUB} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Github aria-hidden="true" className="h-5 w-5" /></a>
            <a aria-label="Send email" href={`mailto:${EMAIL}`} className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Mail aria-hidden="true" className="h-5 w-5" /></a>
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
{`const dev = {
  name: "Kaithoju Ganesh",
  role: "Software & Full-Stack Dev",
  stack: ["React", "Node", "Python",
          "Java", "Spring Boot", "MySQL"],
  focus: "reliable · elegant · fast",
  cgpa: 8.42,
  now: "Intern @ Lumen — Backup & Restore",
  shipping: true,
};`}
            </pre>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[Code2, Server, HardDrive].map((Icon, i) => (
                <motion.div key={i} whileHover={{ y: -4 }} className="glass grid aspect-square place-items-center rounded-xl">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </motion.div>
              ))}
            </div>
            <div className="absolute -right-4 -top-4 animate-float glass rounded-2xl px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> CGPA 8.42</div>
            </div>
            <div className="absolute -bottom-4 -left-4 animate-float glass rounded-2xl px-3 py-2 text-xs" style={{ animationDelay: "1.5s" }}>
              <div className="flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Backup &amp; Restore</div>
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
  return (
    <div aria-hidden="true" className="relative my-12 overflow-hidden border-y border-border/60 py-6">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...MARQUEE, ...MARQUEE].map((t, i) => (
          <span key={i} className="mx-8 font-display text-2xl font-medium text-muted-foreground sm:text-3xl">
            <span className="text-gradient">✦</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   ABOUT
   ============================================================ */
function About() {
  const focus = ["Full-Stack Development", "Backend & APIs", "Database Design", "Embedded / IoT", "Python Automation", "Data Structures & OOP"];
  return (
    <section id="about" aria-labelledby="about-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="about-title" eyebrow="About" title={<>Passionate about <span className="text-gradient">building software that matters</span></>} />
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>I'm <span className="text-foreground">Kaithoju Ganesh</span>, an aspiring Software &amp; Full-Stack Developer pursuing my B.Tech in Electronics &amp; Communication Engineering at Narasimha Reddy Engineering College.</p>
            <p>I enjoy building dynamic, responsive, user-friendly applications — from React front-ends to Java / Spring Boot APIs and MySQL back-ends — and I'm equally at home with Arduino, NodeMCU and Embedded C.</p>
            <p>Right now I'm an <span className="text-foreground">Intern on the Backup &amp; Restore team at Lumen Technologies India</span>, learning enterprise engineering practices and shipping alongside a real product team.</p>
            <p>Outside of coursework I love turning ideas into working prototypes — automating irrigation, building assistive devices, and shipping full-stack side projects.</p>
          </motion.div>
          <motion.ul initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="grid grid-cols-2 gap-4 list-none">
            {focus.map((f, i) => (
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
   STATS
   ============================================================ */
function Stats() {
  return (
    <section aria-label="Key numbers" className="px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
        {ACHIEVEMENTS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="card-premium p-6 text-center">
            <div className="font-display text-4xl font-bold text-gradient sm:text-5xl">
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   EXPERIENCE
   ============================================================ */
function Experience() {
  const roles = [
    {
      title: "Intern — Backup & Restore",
      company: "Lumen Technologies India",
      period: "2026 — Present",
      location: "Bengaluru, IN",
      current: true,
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
      current: false,
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
      current: false,
      icon: Terminal,
      bullets: [
        "Learned core Python concepts and standard libraries",
        "Built projects like Tic-Tac-Toe and Rock-Paper-Scissors",
        "Strengthened programming fundamentals and problem-solving",
      ],
    },
  ];
  return (
    <section id="experience" aria-labelledby="experience-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="experience-title" eyebrow="Experience" title={<>Where I've been <span className="text-gradient">learning &amp; shipping</span></>} />
        <div className="space-y-6">
          {roles.map((r, i) => (
            <motion.article key={r.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.05 }} className="relative overflow-hidden card-premium p-8 sm:p-10">
              {r.current && <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full" style={{ background: "radial-gradient(circle, oklch(0.85 0.18 165 / 0.25), transparent 60%)" }} />}
              <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr]">
                <div aria-hidden="true" className="grid h-20 w-20 place-items-center rounded-2xl" style={{ background: "var(--gradient-text)" }}>
                  <r.icon className="h-9 w-9 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-display text-2xl font-bold sm:text-3xl">{r.title}</h3>
                    {r.current && <span className="rounded-full glass px-3 py-1 text-xs text-primary">Current</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-muted-foreground">
                    <span className="font-medium text-foreground">{r.company}</span>
                    <span aria-hidden="true" className="text-xs">•</span>
                    <span className="text-sm">{r.period}</span>
                    <span aria-hidden="true" className="text-xs">•</span>
                    <span className="inline-flex items-center gap-1 text-sm"><MapPin aria-hidden="true" className="h-3.5 w-3.5" /> {r.location}</span>
                  </div>
                  <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {r.bullets.map((b) => (
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

        {/* Education */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { title: "B.Tech — Electronics & Communication", where: "Narasimha Reddy Engineering College · 2022 – 2026", score: "CGPA 8.42 / 10" },
            { title: "Intermediate", where: "Trinity Junior College, Karimnagar · 2020 – 2022", score: "83.9%" },
            { title: "SSC", where: "Z.P.H.S Chimanpally, Nizamabad · 2019 – 2020", score: "CGPA 10 / 10" },
          ].map((e) => (
            <div key={e.title} className="card-premium p-6">
              <div className="mb-3 flex items-center gap-3">
                <div aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl glass"><GraduationCap className="h-5 w-5 text-primary" /></div>
                <h4 className="font-display text-base font-semibold">{e.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{e.where}</p>
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
  return (
    <section id="skills" aria-labelledby="skills-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="skills-title" eyebrow="Skills" title={<>My <span className="text-gradient">technical toolbox</span></>} subtitle="Languages, frameworks, and hardware I use to ship real software." />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((s, gi) => (
            <motion.div key={s.group} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: gi * 0.05 }} whileHover={{ y: -6 }} className="card-premium group relative overflow-hidden p-6">
              <div aria-hidden="true" className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100" style={{ background: "oklch(0.85 0.18 165 / 0.35)" }} />
              <div className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <div aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-lg glass"><s.icon className="h-5 w-5 text-primary" /></div>
                  <h3 className="font-display text-lg font-semibold">{s.group}</h3>
                </div>
                <div className="space-y-3">
                  {s.items.map((it) => (
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
  return (
    <section id="projects" aria-labelledby="projects-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="projects-title" eyebrow="Projects" title={<>Selected <span className="text-gradient">work</span></>} subtitle="A handful of things I've designed, built, and shipped." />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PROJECTS.map((p, i) => (
            <motion.article key={p.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }} whileHover={{ y: -8 }} className="card-premium group relative flex flex-col overflow-hidden">
              <div aria-hidden="true" className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br ${p.accent}`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="glass-strong grid h-20 w-20 place-items-center rounded-2xl">
                    <p.icon className="h-9 w-9 text-white/95" />
                  </div>
                </div>
                <span className="absolute left-4 top-4 rounded-full glass-strong px-3 py-1 text-xs">{p.tag}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span key={t} className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                  <span className="inline-flex items-center gap-1 text-muted-foreground"><Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Academic Project</span>
                  {p.embedded ? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground/80"><CircuitBoard aria-hidden="true" className="h-3.5 w-3.5" /> Hardware Build</span>
                  ) : (
                    <a href={GITHUB} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded" aria-label={`View ${p.title} related work on GitHub`}>GitHub <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" /></a>
                  )}
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
  return (
    <section id="timeline" aria-labelledby="timeline-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeading id="timeline-title" eyebrow="Timeline" title={<>The <span className="text-gradient">journey so far</span></>} />
        <ol className="relative list-none">
          <div aria-hidden="true" className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent md:left-1/2 md:-translate-x-1/2" />
          {TIMELINE.map((t, i) => {
            const left = i % 2 === 0;
            return (
              <motion.li key={t.year + t.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 * i }} className={`relative mb-10 flex flex-col md:flex-row ${left ? "md:justify-start" : "md:justify-end"}`}>
                <div aria-hidden="true" className={`absolute left-4 top-4 h-4 w-4 -translate-x-1/2 rounded-full ring-4 ring-background md:left-1/2 animate-pulse-glow`} style={{ background: "var(--gradient-text)" }} />
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${left ? "md:pr-8 md:text-right" : "md:ml-auto md:pl-8"}`}>
                  <div className="card-premium p-6">
                    <div className={`mb-2 flex items-center gap-2 ${left ? "md:justify-end" : ""}`}>
                      <t.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span className="font-mono text-sm text-primary">{t.year}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold">{t.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
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
  return (
    <section id="services" aria-labelledby="services-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="services-title" eyebrow="Services" title={<>How I can <span className="text-gradient">help</span></>} subtitle="From landing pages to full products and hardware prototypes." />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
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
  return (
    <section aria-labelledby="why-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="why-title" eyebrow="Why hire me" title={<>Reasons I might be a <span className="text-gradient">good fit</span></>} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_HIRE.map((w, i) => (
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
  return (
    <section aria-labelledby="certs-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeading id="certs-title" eyebrow="Certifications" title={<>Credentials &amp; <span className="text-gradient">learning</span></>} />
        <ul className="grid grid-cols-1 gap-5 list-none">
          {CERTIFICATIONS.map((c, i) => (
            <motion.li key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="card-premium flex items-center gap-5 p-6">
              <div aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-text)" }}>
                <c.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.platform} · Issued {c.date}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================
    CONTACT (wired to Lovable Cloud)
   ============================================================ */
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof z.infer<typeof contactSchema>, string>>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const formElement = e.currentTarget;
    const fd = new FormData(formElement);
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
      // Store in Supabase
      const { error } = await supabase.from("contact_messages").insert(parsed.data);
      if (error) throw error;

      // Send to WhatsApp Cloud API via Google Apps Script
      const gasUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
      if (gasUrl) {
        const whatsappResult = await sendToWhatsApp(parsed.data, gasUrl);
        if (!whatsappResult.success) {
          console.warn("WhatsApp notification failed:", whatsappResult.error);
        }
      }

      // Clear form and errors
      setErrors({});
      formElement.reset();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Contact submission failed", err);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section id="contact" aria-labelledby="contact-title" className="relative px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="contact-title" eyebrow="Contact" title={<>Let's build <span className="text-gradient">something great</span></>} subtitle="Have a project, a role, or just want to say hi? My inbox is open." />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
                { icon: Phone, label: "Phone", value: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` },
                { icon: MapPin, label: "Location", value: "Hyderabad, Telangana, India", href: "https://www.google.com/maps/place/Hyderabad" },
                { icon: Linkedin, label: "LinkedIn", value: "/in/ganesh-kaithoju", href: LINKEDIN },
                { icon: Download, label: "Resume", value: "Download PDF", href: RESUME_URL },
              ].map((c) => (
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
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="card-premium relative w-full max-w-md p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              aria-hidden="true"
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
            >
              <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </motion.div>

            <h3 className="mb-3 font-display text-2xl font-bold">Thank You!</h3>
            <p className="mb-8 text-base leading-relaxed text-muted-foreground">
              Thank you for sending message. I appreciate your time and efforts. I have successfully received your message.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-[0_0_40px_oklch(0.85_0.18_165/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="card-premium relative w-full max-w-md p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              aria-hidden="true"
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20"
            >
              <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </motion.div>

            <h3 className="mb-3 font-display text-2xl font-bold">Oops!</h3>
            <p className="mb-8 text-base leading-relaxed text-muted-foreground">
              There is a failure occurred while sharing your message, please try after some time.
            </p>

            <button
              onClick={() => setShowErrorModal(false)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-[0_0_40px_oklch(0.85_0.18_165/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}

function Field({ label, name, type = "text", placeholder, required, textarea, maxLength, error }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; textarea?: boolean; maxLength?: number; error?: string }) {
  const id = `field-${name}`;
  const errId = `${id}-error`;
  const cls = `w-full rounded-xl border ${error ? "border-red-400/70" : "border-white/10"} bg-white/3 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition`;
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
          <a aria-label="LinkedIn" href={LINKEDIN} target="_blank" rel="noreferrer" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Linkedin aria-hidden="true" className="h-5 w-5" /></a>
          <a aria-label="GitHub" href={GITHUB} target="_blank" rel="noreferrer" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Github aria-hidden="true" className="h-5 w-5" /></a>
          <a aria-label="Email" href={`mailto:${EMAIL}`} className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Mail aria-hidden="true" className="h-5 w-5" /></a>
          <a aria-label="Download resume" href={RESUME_URL} download="Ganesh_Kaithoju_Resume.pdf" rel="noopener" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"><Download aria-hidden="true" className="h-5 w-5" /></a>
        </nav>
        <div className="text-center text-xs text-muted-foreground md:text-right">
          <div>© {new Date().getFullYear()} Kaithoju Ganesh. All rights reserved.</div>
          <div className="mt-1">Designed &amp; developed by <span className="text-gradient font-medium">Kaithoju Ganesh</span></div>
        </div>
      </div>
    </footer>
  );
}
