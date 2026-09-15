import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Layers, Server, Database, Terminal, CircuitBoard, Wrench, 
  Leaf, Utensils, Hospital, CreditCard, GraduationCap, Code2, 
  Rocket, Briefcase, HardDrive, Globe, Cpu, Zap, Sparkles, 
  Shield, Award 
} from "lucide-react";

export const iconMap: Record<string, any> = {
  Layers, Server, Database, Terminal, CircuitBoard, Wrench,
  Leaf, Utensils, Hospital, CreditCard, GraduationCap, Code2,
  Rocket, Briefcase, HardDrive, Globe, Cpu, Zap, Sparkles,
  Shield, Award
};

export function usePortfolioData() {
  const { data: siteSettings, isLoading: loadingSettings } = useQuery({
    queryKey: ['site_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').single();
      if (error) {
        console.error("Error fetching site_settings:", error);
        return null;
      }
      return data;
    }
  });

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').eq('is_visible', true).order('display_order');
      if (error) {
        console.error("Error fetching projects:", error);
        return [];
      }
      return data.map(p => {
        const isEmbedded = p.is_embedded ?? p.embedded ?? false;
        return {
          ...p,
          embedded: isEmbedded,
          is_embedded: isEmbedded,
          has_github: p.has_github !== undefined ? p.has_github : !isEmbedded,
          github_url: p.github_url || null,
          icon: iconMap[p.icon_name || 'Code2'] || Code2
        };
      });
    }
  });

  const { data: skills, isLoading: loadingSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await supabase.from('skills').select('*').eq('is_visible', true).order('display_order');
      if (error) {
        console.error("Error fetching skills:", error);
        return [];
      }
      
      // Group skills by group_name
      const groups = new Map();
      for (const skill of data) {
        if (!groups.has(skill.group_name)) {
          groups.set(skill.group_name, {
            group: skill.group_name,
            icon: iconMap[skill.icon_name || 'Layers'] || Layers,
            items: []
          });
        }
        groups.get(skill.group_name).items.push({ name: skill.name, level: skill.level });
      }
      return Array.from(groups.values());
    }
  });

  const { data: experience, isLoading: loadingExperience } = useQuery({
    queryKey: ['experience'],
    queryFn: async () => {
      const { data, error } = await supabase.from('experience').select('*').eq('is_visible', true).order('display_order');
      if (error) {
        console.error("Error fetching experience:", error);
        return [];
      }
      return data.map(t => ({
        ...t,
        icon: iconMap[t.icon_name || 'Briefcase'] || Briefcase
      }));
    }
  });

  const { data: education, isLoading: loadingEducation } = useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      const { data, error } = await supabase.from('education').select('*').eq('is_visible', true).order('display_order');
      if (error) {
        console.error("Error fetching education:", error);
        return [];
      }
      return data;
    }
  });

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').eq('is_visible', true).order('display_order');
      if (error) {
        console.error("Error fetching services:", error);
        return [];
      }
      return data.map(s => ({
        ...s,
        desc: s.description,
        icon: iconMap[s.icon_name || 'Globe'] || Globe
      }));
    }
  });


  const { data: whyHire, isLoading: loadingWhyHire } = useQuery({
    queryKey: ['why_hire'],
    queryFn: async () => {
      const { data, error } = await supabase.from('why_hire_reasons').select('*').eq('is_visible', true).order('display_order');
      if (error) return [];
      return data.map(w => ({
        ...w,
        desc: w.description
      }));
    }
  });

  const { data: achievements, isLoading: loadingAchievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('achievements').select('*').eq('is_visible', true).order('display_order');
      if (error) return [];
      return data.map(a => {
        const match = a.metric.match(/^([0-9.]+)(.*)$/);
        return {
          ...a,
          label: a.title,
          value: match ? match[1] : a.metric,
          suffix: match ? match[2] : ""
        };
      });
    }
  });

  const { data: certifications, isLoading: loadingCertifications } = useQuery({
    queryKey: ['certifications'],
    queryFn: async () => {
      const { data, error } = await supabase.from('certifications').select('*').eq('is_visible', true).order('display_order');
      if (error) {
        console.error("Error fetching certifications:", error);
        return [];
      }
      return data.map(c => ({
        ...c,
        title: c.title || c.name,
        platform: c.platform || c.issuer,
        icon: iconMap[c.icon_name || 'Award'] || Award
      }));
    }
  });

  const { data: marquee, isLoading: loadingMarquee } = useQuery({
    queryKey: ['marquee'],
    queryFn: async () => {
      const { data, error } = await supabase.from('marquee_items').select('*').eq('is_visible', true).order('display_order');
      if (error) return [];
      return data.map(m => m.text);
    }
  });

  const { data: timeline, isLoading: loadingTimeline } = useQuery({
    queryKey: ['timeline'],
    queryFn: async () => {
      // 1. Try fetching from public.timeline table first
      try {
        const { data, error } = await supabase
          .from('timeline')
          .select('*')
          .eq('is_visible', true)
          .order('display_order');
          
        if (!error && data && data.length > 0) {
          return data.map(t => ({
            ...t,
            desc: t.description || t.desc,
            icon: iconMap[t.icon_name || 'GraduationCap'] || GraduationCap
          }));
        }
      } catch (err) {
        // Table might not exist yet, proceed to fallback
      }

      // 2. Fall back to website_sections content column for 'timeline'
      try {
        const { data: secData } = await supabase
          .from('website_sections')
          .select('content')
          .eq('id', 'timeline')
          .single();
          
        if (secData?.content) {
          const parsed = JSON.parse(secData.content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
              .filter((t: any) => t.is_visible !== false)
              .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
              .map((t: any) => ({
                ...t,
                desc: t.description || t.desc,
                icon: iconMap[t.icon_name || 'GraduationCap'] || GraduationCap
              }));
          }
        }
      } catch (err) {
        // Continue to static fallback
      }

      // 3. Fallback to default portfolio journey
      return [
        { year: "2020", title: "Completed SSC", desc: "Z.P.H.S Chimanpally, Nizamabad — CGPA 10/10.", icon: GraduationCap },
        { year: "2022", title: "Completed Intermediate", desc: "Trinity Junior College, Karimnagar — 83.9%.", icon: GraduationCap },
        { year: "2022", title: "Started B.Tech (ECE)", desc: "Began Electronics & Communication Engineering at Narasimha Reddy Engineering College.", icon: Code2 },
        { year: "2025", title: "Python Intern @ YBI Foundation", desc: "Built projects like Tic-Tac-Toe and Rock-Paper-Scissors while learning core Python.", icon: Rocket },
        { year: "2025", title: "Summer Intern @ BHEL", desc: "Team member on a thermal power systems project — analysed PLC and CNC processes at BHEL Hyderabad.", icon: Briefcase },
        { year: "2026", title: "Intern @ Lumen Technologies", desc: "Intern on the Backup & Restore team at Lumen Technologies India — Bengaluru.", icon: HardDrive },
      ];
    }
  });

  const { data: sections, isLoading: loadingSections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const { data, error } = await supabase.from('website_sections').select('*').eq('is_visible', true).order('display_order');
      if (error) return [];
      return data;
    }
  });

  const { data: navigation, isLoading: loadingNavigation } = useQuery({
    queryKey: ['navigation'],
    queryFn: async () => {
      const { data, error } = await supabase.from('navigation_links').select('*').order('display_order');
      if (error) return [];
      return data;
    }
  });

  return {
    siteSettings,
    projects,
    skills,
    experience,
    education,
    timeline,
    services,
    whyHire,
    achievements,
    certifications,
    marquee,
    sections,
    navigation,
    isLoading: loadingSettings || loadingProjects || loadingSkills || loadingExperience || loadingEducation || loadingTimeline || loadingServices || loadingWhyHire || loadingAchievements || loadingCertifications || loadingMarquee || loadingSections || loadingNavigation
  };
}

