import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, LayoutDashboard, Settings, Type, User, Code2, 
  Briefcase, GraduationCap, Wrench, Star, Award, 
  Medal, MessageCircle, FileImage, ShieldCheck, AlignLeft, Globe,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Module components
import { MessagesTab } from "@/components/dashboard/MessagesTab";
import { SiteSettingsTab } from "@/components/dashboard/SiteSettingsTab";
import { HeroTab } from "@/components/dashboard/HeroTab";
import { AboutTab } from "@/components/dashboard/AboutTab";
import { SkillsTab } from "@/components/dashboard/SkillsTab";
import { ProjectsTab } from "@/components/dashboard/ProjectsTab";
import { ExperienceTab } from "@/components/dashboard/ExperienceTab";
import { EducationTab } from "@/components/dashboard/EducationTab";
import { ServicesTab } from "@/components/dashboard/ServicesTab";
import { WhyHireTab } from "@/components/dashboard/WhyHireTab";
import { AchievementsTab } from "@/components/dashboard/AchievementsTab";
import { CertificationsTab } from "@/components/dashboard/CertificationsTab";
import { MarqueeTab } from "@/components/dashboard/MarqueeTab";
import { SectionsTab } from "@/components/dashboard/SectionsTab";
import { NavigationTab } from "@/components/dashboard/NavigationTab";
import { MediaTab } from "@/components/dashboard/MediaTab";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { AccountTab } from "@/components/dashboard/AccountTab";
import { ResumeTab } from "@/components/dashboard/ResumeTab";

export const Route = createFileRoute("/owner-dashboard")({
  component: OwnerDashboard,
});

function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      navigate({ to: "/owner-login" });
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      navigate({ to: "/" });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  }

  const navGroups = [
    {
      title: "Dashboard",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
      ]
    },
    {
      title: "Portfolio CMS",
      items: [
        { id: "site-settings", label: "Site Settings", icon: Settings },
        { id: "hero", label: "Hero", icon: Type },
        { id: "about", label: "About", icon: User },
        { id: "skills", label: "Skills", icon: Code2 },
        { id: "projects", label: "Projects", icon: Briefcase },
        { id: "experience", label: "Experience", icon: Briefcase },
        { id: "education", label: "Education", icon: GraduationCap },
        { id: "services", label: "Services", icon: Wrench },
        { id: "why-hire", label: "Why Hire Me", icon: Star },
        { id: "achievements", label: "Achievements", icon: Award },
        { id: "certifications", label: "Certifications", icon: Medal },
        { id: "marquee", label: "Marquee", icon: AlignLeft },
        { id: "resume", label: "Resume", icon: FileText },
      ]
    },
    {
      title: "Website",
      items: [
        { id: "sections", label: "Sections", icon: Globe },
        { id: "media", label: "Media Assets", icon: FileImage },
      ]
    },
    {
      title: "Interactions",
      items: [
        { id: "messages", label: "Messages", icon: MessageCircle },
        { id: "chat-logs", label: "Chat Logs", icon: MessageCircle },
      ]
    },
    {
      title: "Account",
      items: [
        { id: "account", label: "Admin Account", icon: ShieldCheck },
      ]
    }
  ];

  function renderContent() {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "account":
        return <AccountTab />;
      case "messages":
        return <MessagesTab />;
      case "site-settings":
        return <SiteSettingsTab />;
      case "hero":
        return <HeroTab />;
      case "about":
        return <AboutTab />;
      case "skills":
        return <SkillsTab />;
      case "projects":
        return <ProjectsTab />;
      case "experience":
        return <ExperienceTab />;
      case "education":
        return <EducationTab />;
      case "services":
        return <ServicesTab />;
      case "why-hire":
        return <WhyHireTab />;
      case "achievements":
        return <AchievementsTab />;
      case "certifications":
        return <CertificationsTab />;
      case "marquee":
        return <MarqueeTab />;
      case "resume":
        return <ResumeTab />;
      case "sections":
        return <SectionsTab onNavigateTab={(tab) => setActiveTab(tab)} />;
      case "navigation":
        return <NavigationTab />;
      case "media":
        return <MediaTab />;
      default:
        return (
          <div className="card-premium p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[50vh]">
            <Settings className="h-12 w-12 mb-4 opacity-20" />
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">Module Under Construction</h2>
            <p>The {activeTab} CMS module is currently being built.</p>
          </div>
        );
    }
  }

  return (
    <div className="min-h-dvh bg-background flex">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border/60 bg-background/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:block flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-lg font-display text-sm font-bold text-primary-foreground"
              style={{ background: "var(--gradient-text)" }}
            >
              OD
            </div>
            <div>
              <div className="font-display font-semibold">CMS Admin</div>
              <div className="text-xs text-muted-foreground">Portfolio Platform</div>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 scrollbar-none">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h3>
              <nav className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${activeTab === item.id ? "text-primary" : "opacity-70"}`} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 -ml-2 text-muted-foreground" onClick={() => setSidebarOpen(true)}>
              ☰
            </button>
            <h1 className="text-xl font-display font-semibold capitalize">
              {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label}
            </h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

