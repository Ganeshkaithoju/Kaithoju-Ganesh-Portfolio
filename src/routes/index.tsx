import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue, AnimatePresence, useInView } from "framer-motion";
import {
  Github, Linkedin, Mail, Phone, MapPin, Download, ArrowUpRight, ArrowRight, Code2, Server, Database, Wrench, Brain, Sparkles, Rocket, Award, GraduationCap, Briefcase, ExternalLink, Send, Menu, X, Sun, Moon, Terminal, Layers, Cpu, Globe, Shield, Zap, Star, ChevronDown, Quote,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: PortfolioPage });

/* ============================================================
   DATA
   ============================================================ */
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
  { group: "Languages", icon: Terminal, items: [
    { name: "Python", level: 92 }, { name: "Java", level: 88 }, { name: "JavaScript", level: 90 }, { name: "C", level: 78 }, { name: "SQL", level: 85 },
  ]},
  { group: "Frontend", icon: Layers, items: [
    { name: "React.js", level: 88 }, { name: "HTML5", level: 96 }, { name: "CSS3", level: 92 }, { name: "Tailwind CSS", level: 90 }, { name: "Bootstrap", level: 85 },
  ]},
  { group: "Backend", icon: Server, items: [
    { name: "Node.js", level: 82 }, { name: "Express.js", level: 80 }, { name: "REST APIs", level: 86 },
  ]},
  { group: "Database", icon: Database, items: [
    { name: "MySQL", level: 84 }, { name: "MongoDB", level: 80 },
  ]},
  { group: "Tools", icon: Wrench, items: [
    { name: "Git", level: 88 }, { name: "GitHub", level: 88 }, { name: "VS Code", level: 95 }, { name: "Postman", level: 85 },
  ]},
  { group: "CS Concepts", icon: Brain, items: [
    { name: "Data Structures", level: 86 }, { name: "Algorithms", level: 84 }, { name: "OOP", level: 90 }, { name: "DBMS", level: 85 }, { name: "OS", level: 78 }, { name: "Networks", level: 76 },
  ]},
];

const PROJECTS = [
  { title: "Premium Portfolio Website", tag: "Design + Dev", desc: "A modern responsive portfolio showcasing projects, experience and skills with framer-motion animations and glassmorphism.", tech: ["HTML", "CSS", "JavaScript"], accent: "from-teal-400 to-cyan-500" },
  { title: "Interior Design Website", tag: "Client Work", desc: "Professional site for Styling Space featuring gallery, admin image upload, responsive layout, image preview and contact section.", tech: ["HTML", "CSS", "JavaScript"], accent: "from-fuchsia-400 to-purple-500" },
  { title: "Python Banking System", tag: "Systems", desc: "Console-based banking application implementing OTP verification, exception handling, balance management and secure transactions.", tech: ["Python", "OOP"], accent: "from-amber-400 to-orange-500" },
  { title: "Student Management System", tag: "Full Stack", desc: "CRUD-based application with database integration, form validation and clean admin dashboard.", tech: ["Java", "MySQL"], accent: "from-sky-400 to-indigo-500" },
  { title: "Task Management Web App", tag: "Full Stack", desc: "Full stack task manager built with the MERN stack featuring auth, drag-and-drop and realtime updates.", tech: ["React", "Node.js", "MongoDB"], accent: "from-emerald-400 to-teal-500" },
];

const TIMELINE = [
  { year: "2022", title: "Started B.Tech", desc: "Began Computer Science Engineering at Narsimha Reddy Engineering College.", icon: GraduationCap },
  { year: "2023", title: "Focused on Programming", desc: "Deep dive into Python, Java and DSA. First open-source contributions.", icon: Code2 },
  { year: "2024", title: "Built Full Stack Projects", desc: "Shipped MERN apps, refined backend and DB skills, mastered REST APIs.", icon: Rocket },
  { year: "2025", title: "Cybersecurity Job Simulation", desc: "Completed Tata Group Cybersecurity Analyst simulation on Forage.", icon: Shield },
  { year: "2026", title: "Software Engineering Intern", desc: "Software Engineering Intern at Lumen Technologies India.", icon: Briefcase },
];

const SERVICES = [
  { icon: Globe, title: "Web Development", desc: "End-to-end responsive websites tailored to your brand." },
  { icon: Layers, title: "Frontend Development", desc: "Pixel-perfect UIs with React, Tailwind and modern tooling." },
  { icon: Server, title: "Backend Development", desc: "Robust Node.js / Express APIs and business logic." },
  { icon: Cpu, title: "Python Development", desc: "Automation, scripting, and data-driven applications." },
  { icon: Code2, title: "Java Development", desc: "OOP-based systems, CRUD apps and enterprise services." },
  { icon: Database, title: "Database Design", desc: "SQL & NoSQL schemas that scale with your product." },
  { icon: Zap, title: "API Development", desc: "Fast, secure and well-documented REST APIs." },
  { icon: Sparkles, title: "Responsive Design", desc: "Mobile-first, accessible, delightful on every screen." },
];

const WHY_HIRE = [
  { title: "Quick Learner", desc: "Absorb new stacks fast and ship in days, not weeks." },
  { title: "Team Player", desc: "Communicate clearly, review kindly, ship together." },
  { title: "Strong Fundamentals", desc: "DSA, OOP, DBMS and Networks — well-rounded CS base." },
  { title: "Passionate Developer", desc: "I code for the craft, not just the paycheck." },
  { title: "Problem Solver", desc: "Break big problems into small, testable steps." },
  { title: "Always Learning", desc: "New docs open in a tab, always." },
  { title: "Clean Code", desc: "Readable, tested, refactor-friendly by default." },
  { title: "Professional Communication", desc: "Async-first, structured writing, on-time updates." },
];

const ACHIEVEMENTS = [
  { label: "CGPA", value: "8.49", suffix: "/10" },
  { label: "Projects Shipped", value: "12", suffix: "+" },
  { label: "Technologies", value: "20", suffix: "+" },
  { label: "Certifications", value: "1", suffix: "" },
];

const TESTIMONIALS = [
  { name: "A. Rao", role: "Senior Engineer, MNC", quote: "Ganesh combines strong CS fundamentals with a designer's eye. Rare and refreshing." },
  { name: "P. Sharma", role: "Startup Founder", quote: "He shipped our MVP faster than agencies quoted just for a proposal." },
  { name: "S. Iyer", role: "Product Manager", quote: "Clean code, clear communication, and genuinely cares about the user." },
  { name: "R. Mehta", role: "Tech Lead", quote: "One of the sharpest interns I've had the pleasure of mentoring." },
];

const CERTIFICATIONS = [
  { title: "Tata Group Cybersecurity Analyst Job Simulation", platform: "Forage", date: "January 2025", icon: Shield },
];

const MARQUEE = ["Python", "Java", "React", "Node.js", "TypeScript", "MongoDB", "MySQL", "Express", "Tailwind", "GSAP", "Framer Motion", "Git", "Docker", "REST", "AWS"];

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

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: ReactNode; subtitle?: string }) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary">
        <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.05 }} className="mt-5 text-4xl font-bold sm:text-5xl md:text-6xl">
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
      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
            <div className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} className="mx-auto h-16 w-16 rounded-full border-2 border-transparent" style={{ background: "conic-gradient(from 0deg, transparent, var(--neon), transparent)", WebkitMask: "radial-gradient(closest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))" }} />
              <p className="mt-6 font-mono text-sm text-muted-foreground">Loading portfolio…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom cursor */}
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-difference md:block" style={{ x: cxs, y: cys, background: "oklch(0.95 0 0)" }} />
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[89] hidden h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full md:block" style={{ x: cxs, y: cys, background: "radial-gradient(circle, oklch(0.85 0.18 165 / 0.15), transparent 70%)" }} />

      {/* Scroll progress */}
      <motion.div style={{ scaleX }} className="fixed left-0 right-0 top-0 z-[95] h-[3px] origin-left" >
        <div className="h-full w-full" style={{ background: "var(--gradient-text)" }} />
      </motion.div>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] animate-blob rounded-full opacity-30" style={{ background: "radial-gradient(circle, oklch(0.85 0.18 165 / 0.5), transparent 60%)" }} />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] animate-blob rounded-full opacity-25" style={{ background: "radial-gradient(circle, oklch(0.72 0.2 295 / 0.5), transparent 60%)", animationDelay: "4s" }} />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] animate-blob rounded-full opacity-20" style={{ background: "radial-gradient(circle, oklch(0.7 0.18 220 / 0.5), transparent 60%)", animationDelay: "8s" }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <Navbar navOpen={menuOpen} setNavOpen={setMenuOpen} dark={dark} setDark={setDark} />

      <main>
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
        <Testimonials />
        <Contact />
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
        <a href="#home" className="group flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg font-display text-sm font-bold text-primary-foreground" style={{ background: "var(--gradient-text)" }}>GK</div>
          <span className="hidden font-display text-sm font-semibold sm:inline">Ganesh Kaithoju</span>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">{n.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button aria-label="Toggle theme" onClick={() => setDark(!dark)} className="grid h-9 w-9 place-items-center rounded-lg glass hover:bg-white/10">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a href="#contact" className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] md:inline-flex">Let's talk</a>
          <button aria-label="Menu" className="grid h-9 w-9 place-items-center rounded-lg glass md:hidden" onClick={() => setNavOpen(!navOpen)}>
            {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </motion.header>
      <AnimatePresence>
        {navOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-x-4 top-20 z-40 glass-strong rounded-2xl p-4 md:hidden">
            <div className="flex flex-col">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} onClick={() => setNavOpen(false)} className="rounded-lg px-4 py-3 text-sm hover:bg-white/5">{n.label}</a>
              ))}
            </div>
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
    <span className="text-gradient">{text}<span className="inline-block w-[2px] translate-y-1 animate-pulse bg-primary" style={{ height: "1em" }} /></span>
  );
}

function MagneticButton({ children, href, variant = "primary" }: { children: ReactNode; href: string; variant?: "primary" | "ghost" }) {
  const { ref, x, y } = useMagnetic(0.3);
  const cls = variant === "primary"
    ? "bg-primary text-primary-foreground hover:shadow-[0_0_40px_oklch(0.85_0.18_165/0.5)]"
    : "glass hover:bg-white/10";
  return (
    <motion.a ref={ref as any} href={href} style={{ x, y }} className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-shadow ${cls}`}>
      {children}
    </motion.a>
  );
}

function Hero() {
  return (
    <section id="home" className="relative flex min-h-dvh items-center px-4 pt-32 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.4 }} className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
            Available for opportunities · Hyderabad, IN
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.5 }} className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Hi, I'm <span className="text-gradient">Ganesh</span>.<br />
            I build <TypingText words={["scalable web apps", "clean interfaces", "reliable APIs", "delightful UX"]} />
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.7 }} className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Full Stack Developer & Software Engineer crafting production-grade software with Python, Java, React, and Node.js. Currently interning at <span className="text-foreground">Lumen Technologies India</span>.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.85 }} className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton href="#projects">View my work <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></MagneticButton>
            <MagneticButton href="#contact" variant="ghost">Get in touch <ArrowRight className="h-4 w-4" /></MagneticButton>
            <a href="#" className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground"><Download className="h-4 w-4" /> Resume</a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 2 }} className="mt-10 flex items-center gap-5 text-muted-foreground">
            <a aria-label="LinkedIn" href="https://www.linkedin.com/in/ganesh-kaithoju/" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
            <a aria-label="GitHub" href="#" className="transition-colors hover:text-foreground"><Github className="h-5 w-5" /></a>
            <a aria-label="Email" href="#contact" className="transition-colors hover:text-foreground"><Mail className="h-5 w-5" /></a>
            <div className="ml-2 h-px w-16 bg-border" />
            <span className="font-mono text-xs">scroll ↓</span>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 1.6 }} className="relative mx-auto aspect-square w-full max-w-md">
          {/* 3D-ish orbiting card */}
          <div className="absolute inset-0 rounded-3xl animate-gradient" style={{ background: "conic-gradient(from 0deg, oklch(0.85 0.18 165 / 0.4), oklch(0.72 0.2 295 / 0.4), oklch(0.7 0.18 220 / 0.4), oklch(0.85 0.18 165 / 0.4))", filter: "blur(40px)" }} />
          <motion.div animate={{ rotateY: [0, 6, -6, 0], rotateX: [0, -4, 4, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="relative h-full w-full rounded-3xl card-premium p-6" style={{ transformStyle: "preserve-3d" }}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400/70" /><span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" /><span className="h-2.5 w-2.5 rounded-full bg-green-400/70" /></div>
              <span className="font-mono">ganesh.tsx</span>
            </div>
            <pre className="mt-4 overflow-hidden font-mono text-[13px] leading-relaxed">
{`const dev = {
  name: "Ganesh Kaithoju",
  role: "Full Stack Developer",
  stack: ["React", "Node", "Python",
          "Java", "MongoDB", "MySQL"],
  focus: "scalable · elegant · fast",
  cgpa: 8.49,
  now: "SE Intern @ Lumen",
  shipping: true,
};`}
            </pre>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[Code2, Server, Database].map((Icon, i) => (
                <motion.div key={i} whileHover={{ y: -4 }} className="glass grid aspect-square place-items-center rounded-xl">
                  <Icon className="h-5 w-5 text-primary" />
                </motion.div>
              ))}
            </div>
            <div className="absolute -right-4 -top-4 animate-float glass rounded-2xl px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-primary" /> CGPA 8.49</div>
            </div>
            <div className="absolute -bottom-4 -left-4 animate-float glass rounded-2xl px-3 py-2 text-xs" style={{ animationDelay: "1.5s" }}>
              <div className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Shipping v1.0</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground">
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}

function MarqueeStrip() {
  return (
    <div className="relative my-12 overflow-hidden border-y border-border/60 py-6">
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
  const focus = ["Frontend Development", "Backend Development", "Database Management", "Cloud Technologies", "Cybersecurity", "Data Structures & Algorithms"];
  return (
    <section id="about" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="About" title={<>Passionate about <span className="text-gradient">building software that matters</span></>} />
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>I'm an aspiring <span className="text-foreground">Software Engineer</span> and <span className="text-foreground">Full Stack Developer</span> passionate about building scalable, responsive, and genuinely user-friendly web applications.</p>
            <p>I enjoy solving complex programming problems and continuously deepening my knowledge across the entire stack — from pixel-perfect UI to distributed systems.</p>
            <p>Right now, I'm a <span className="text-foreground">Software Engineering Intern at Lumen Technologies India</span>, learning enterprise engineering practices while pursuing my B.Tech in Computer Science.</p>
            <p>Outside of work I love learning new technologies and turning ideas into impactful software.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="grid grid-cols-2 gap-4">
            {focus.map((f, i) => (
              <motion.div key={f} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} className="card-premium p-5">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg glass"><span className="font-mono text-xs text-primary">0{i + 1}</span></div>
                <div className="font-display font-semibold">{f}</div>
              </motion.div>
            ))}
          </motion.div>
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
    <section className="px-4 py-12 sm:px-6">
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
  const bullets = [
    "Collaborating with software development teams on real-world enterprise systems",
    "Learning production-grade software development practices end-to-end",
    "Building scalable, maintainable applications with modern tooling",
    "Writing clean, well-tested code and taking part in code reviews",
    "Working within Agile ceremonies — standups, sprints, retros",
    "Sharpening debugging, profiling, and problem-solving skills daily",
  ];
  return (
    <section id="experience" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Experience" title={<>Where I'm <span className="text-gradient">shipping right now</span></>} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative overflow-hidden card-premium p-8 sm:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full" style={{ background: "radial-gradient(circle, oklch(0.85 0.18 165 / 0.25), transparent 60%)" }} />
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr]">
            <div className="grid h-20 w-20 place-items-center rounded-2xl" style={{ background: "var(--gradient-text)" }}>
              <Briefcase className="h-9 w-9 text-primary-foreground" />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="font-display text-2xl font-bold sm:text-3xl">Software Engineering Intern</h3>
                <span className="rounded-full glass px-3 py-1 text-xs text-primary">Current</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-muted-foreground">
                <span className="font-medium text-foreground">Lumen Technologies India</span>
                <span className="text-xs">•</span>
                <span className="text-sm">2026 — Present</span>
                <span className="text-xs">•</span>
                <span className="inline-flex items-center gap-1 text-sm"><MapPin className="h-3.5 w-3.5" /> Hyderabad, IN</span>
              </div>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Education card */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="card-premium p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl glass"><GraduationCap className="h-5 w-5 text-primary" /></div>
              <h4 className="font-display text-xl font-semibold">Education</h4>
            </div>
            <p className="text-lg font-semibold">Bachelor of Technology — Computer Science</p>
            <p className="mt-1 text-muted-foreground">Narsimha Reddy Engineering College · 2022 – 2026</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-sm"><Star className="h-3.5 w-3.5 text-primary" /> CGPA 8.49 / 10</div>
          </div>
          <div className="card-premium p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl glass"><Award className="h-5 w-5 text-primary" /></div>
              <h4 className="font-display text-xl font-semibold">Highlights</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" /> Software Engineering Internship</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" /> Cybersecurity Job Simulation (Forage)</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" /> Continuous Learning across the stack</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" /> Strong Academic Performance</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" /> Deep focus on Problem Solving</li>
            </ul>
          </div>
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
    <section id="skills" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Skills" title={<>My <span className="text-gradient">technical toolbox</span></>} subtitle="Languages, frameworks, and CS fundamentals I use to ship production software." />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((s, gi) => (
            <motion.div key={s.group} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: gi * 0.05 }} whileHover={{ y: -6 }} className="card-premium group relative overflow-hidden p-6">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100" style={{ background: "oklch(0.85 0.18 165 / 0.35)" }} />
              <div className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg glass"><s.icon className="h-5 w-5 text-primary" /></div>
                  <h3 className="font-display text-lg font-semibold">{s.group}</h3>
                </div>
                <div className="space-y-3">
                  {s.items.map((it) => (
                    <div key={it.name}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-foreground">{it.name}</span>
                        <span className="font-mono text-muted-foreground">{it.level}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
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
    <section id="projects" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Projects" title={<>Selected <span className="text-gradient">work</span></>} subtitle="A handful of things I've designed, built, and shipped." />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => (
            <motion.article key={p.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }} whileHover={{ y: -8 }} className="card-premium group relative flex flex-col overflow-hidden">
              <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${p.accent}`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="glass rounded-2xl px-5 py-3 font-display text-lg font-semibold text-white/90">{p.title.split(" ")[0]}</div>
                </div>
                <span className="absolute left-4 top-4 rounded-full glass-strong px-3 py-1 text-xs">{p.tag}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                  <a href="#" className="inline-flex items-center gap-1 text-primary hover:gap-2 transition-all">Live <ExternalLink className="h-3.5 w-3.5" /></a>
                  <a href="#" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><Github className="h-3.5 w-3.5" /> Code</a>
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
    <section id="timeline" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeading eyebrow="Timeline" title={<>The <span className="text-gradient">journey so far</span></>} />
        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent md:left-1/2 md:-translate-x-1/2" />
          {TIMELINE.map((t, i) => {
            const left = i % 2 === 0;
            return (
              <motion.div key={t.year} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 * i }} className={`relative mb-10 flex flex-col md:flex-row ${left ? "md:justify-start" : "md:justify-end"}`}>
                <div className={`absolute left-4 top-4 h-4 w-4 -translate-x-1/2 rounded-full ring-4 ring-background md:left-1/2 animate-pulse-glow`} style={{ background: "var(--gradient-text)" }} />
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${left ? "md:pr-8 md:text-right" : "md:ml-auto md:pl-8"}`}>
                  <div className="card-premium p-6">
                    <div className={`mb-2 flex items-center gap-2 ${left ? "md:justify-end" : ""}`}>
                      <t.icon className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm text-primary">{t.year}</span>
                    </div>
                    <h4 className="font-display text-lg font-semibold">{t.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SERVICES
   ============================================================ */
function Services() {
  return (
    <section id="services" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Services" title={<>How I can <span className="text-gradient">help</span></>} subtitle="From landing pages to full products — I've got you covered." />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }} whileHover={{ y: -6 }} className="card-premium group relative overflow-hidden p-6">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl transition-transform group-hover:scale-110" style={{ background: "var(--gradient-text)" }}>
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h4 className="font-display font-semibold">{s.title}</h4>
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
    <section className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Why hire me" title={<>Reasons I might be a <span className="text-gradient">good fit</span></>} />
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
    <section className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeading eyebrow="Certifications" title={<>Credentials & <span className="text-gradient">learning</span></>} />
        <div className="grid grid-cols-1 gap-5">
          {CERTIFICATIONS.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="card-premium flex items-center gap-5 p-6">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-text)" }}>
                <c.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-display text-lg font-semibold">{c.title}</h4>
                <p className="text-sm text-muted-foreground">{c.platform} · Issued {c.date}</p>
              </div>
              <a href="#" className="hidden rounded-full glass px-4 py-2 text-sm hover:bg-white/10 sm:inline-flex">View</a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TESTIMONIALS
   ============================================================ */
function Testimonials() {
  return (
    <section className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Testimonials" title={<>Kind words from <span className="text-gradient">collaborators</span></>} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }} className="card-premium relative p-8">
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/30" />
              <p className="text-lg leading-relaxed">"{t.quote}"</p>
              <footer className="mt-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full font-display font-semibold text-primary-foreground" style={{ background: "var(--gradient-text)" }}>
                  {t.name.split(" ").map((s) => s[0]).join("")}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CONTACT
   ============================================================ */
function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Contact" title={<>Let's build <span className="text-gradient">something great</span></>} subtitle="Have a project, a role, or just want to say hi? My inbox is open." />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "hello@ganeshkaithoju.dev", href: "mailto:hello@ganeshkaithoju.dev" },
              { icon: Phone, label: "Phone", value: "+91 00000 00000", href: "tel:+910000000000" },
              { icon: MapPin, label: "Location", value: "Hyderabad, Telangana, India", href: "#" },
              { icon: Linkedin, label: "LinkedIn", value: "/in/ganesh-kaithoju", href: "https://www.linkedin.com/in/ganesh-kaithoju/" },
            ].map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="card-premium group flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5">
                <div className="grid h-11 w-11 place-items-center rounded-xl glass"><c.icon className="h-5 w-5 text-primary" /></div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
                  <div className="font-medium">{c.value}</div>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
            <div className="card-premium overflow-hidden">
              <div className="relative aspect-[16/9]">
                <div className="absolute inset-0 opacity-40" style={{ background: "linear-gradient(135deg, oklch(0.3 0.1 200), oklch(0.25 0.08 265))" }} />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#5eead4 1px, transparent 1px), linear-gradient(90deg, #5eead4 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div><MapPin className="mx-auto mb-2 h-8 w-8 text-primary" /><div className="font-display font-semibold">Hyderabad, IN</div><div className="text-xs text-muted-foreground">17.3850° N, 78.4867° E</div></div>
                </div>
              </div>
            </div>
          </div>
          <motion.form initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} onSubmit={(e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 3000); }} className="card-premium space-y-4 p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" placeholder="Your name" required />
              <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <Field label="Subject" name="subject" placeholder="What's this about?" required />
            <Field label="Message" name="message" placeholder="Tell me a bit about your project…" textarea required />
            <button type="submit" className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-medium text-primary-foreground transition-all hover:shadow-[0_0_40px_oklch(0.85_0.18_165/0.5)]">
              {sent ? "Message sent ✓" : (<>Send message <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>)}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", placeholder, required, textarea }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; textarea?: boolean }) {
  const cls = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea name={name} placeholder={placeholder} required={required} rows={5} className={cls} />
      ) : (
        <input name={name} type={type} placeholder={placeholder} required={required} className={cls} />
      )}
    </label>
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
          <div className="grid h-10 w-10 place-items-center rounded-lg font-display text-sm font-bold text-primary-foreground" style={{ background: "var(--gradient-text)" }}>GK</div>
          <div>
            <div className="font-display font-semibold">Ganesh Kaithoju</div>
            <div className="text-xs text-muted-foreground">Full Stack Developer · Hyderabad, IN</div>
          </div>
        </div>
        <div className="flex items-center gap-5 text-muted-foreground">
          <a href="https://www.linkedin.com/in/ganesh-kaithoju/" target="_blank" rel="noreferrer" className="hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
          <a href="#" className="hover:text-foreground"><Github className="h-5 w-5" /></a>
          <a href="#contact" className="hover:text-foreground"><Mail className="h-5 w-5" /></a>
        </div>
        <div className="text-center text-xs text-muted-foreground md:text-right">
          <div>© {new Date().getFullYear()} Ganesh Kaithoju. All rights reserved.</div>
          <div className="mt-1">Designed and Developed by <span className="text-gradient font-medium">Ganesh Kaithoju</span></div>
        </div>
      </div>
    </footer>
  );
}
