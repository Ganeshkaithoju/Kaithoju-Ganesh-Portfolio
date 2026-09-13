import { useState, useEffect } from "react";
import { Loader2, FolderKanban, Code2, Award, Briefcase, GraduationCap, LayoutPanelLeft, MessageSquare, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function OverviewTab() {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    experience: 0,
    education: 0,
    certifications: 0,
    sections: 0,
    messages: 0,
    unreadMessages: 0,
    media: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const [
          { count: projectsCount },
          { count: skillsCount },
          { count: experienceCount },
          { count: educationCount },
          { count: certsCount },
          { count: sectionsCount },
          { count: messagesCount },
          { count: unreadMessagesCount }
        ] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('skills').select('*', { count: 'exact', head: true }),
          supabase.from('experience').select('*', { count: 'exact', head: true }),
          supabase.from('education').select('*', { count: 'exact', head: true }),
          supabase.from('certifications').select('*', { count: 'exact', head: true }),
          supabase.from('website_sections').select('*', { count: 'exact', head: true }),
          supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
          supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new')
        ]);

        // Note: Counting files recursively via storage.list can be slow/complex in the browser,
        // so we'll just set media to a baseline metric or query a specific folder if needed.
        
        setStats({
          projects: projectsCount || 0,
          skills: skillsCount || 0,
          experience: experienceCount || 0,
          education: educationCount || 0,
          certifications: certsCount || 0,
          sections: sectionsCount || 0,
          messages: messagesCount || 0,
          unreadMessages: unreadMessagesCount || 0,
          media: 0 // Optional placeholder
        });
      } catch (error: any) {
        console.error("Error fetching stats:", error);
        toast.error(error.message || "Failed to fetch stats");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Projects", value: stats.projects, icon: FolderKanban, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Skills", value: stats.skills, icon: Code2, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Certifications", value: stats.certifications, icon: Award, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Experience", value: stats.experience, icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Education", value: stats.education, icon: GraduationCap, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Sections Configured", value: stats.sections, icon: LayoutPanelLeft, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Unread Messages", value: stats.unreadMessages, icon: MessageSquare, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Total Messages", value: stats.messages, icon: MessageSquare, color: "text-muted-foreground", bg: "bg-white/5" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-display font-semibold tracking-tight">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome to your portfolio CMS. Manage all content dynamically from here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card-premium p-6 flex flex-col gap-4 group hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-3xl font-display font-bold">{stat.value}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card-premium p-8 mt-8 border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
        <h3 className="text-lg font-semibold mb-2">Portfolio Architecture Validated</h3>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
          Your portfolio is securely connected to Supabase using a Single-Owner CMS pattern. 
          All modifications made through this dashboard will instantly reflect on the public site without requiring a code rebuild.
        </p>
      </div>
    </div>
  );
}
