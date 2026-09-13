import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save, Loader2, Link as LinkIcon, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettingsFormData {
  email: string;
  phone_display: string;
  phone_tel: string;
  linkedin_url: string;
  github_url: string;
}

export function SiteSettingsTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SiteSettingsFormData>();

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('email, phone_display, phone_tel, linkedin_url, github_url')
        .eq('id', true)
        .single();
        
      if (error) throw error;
      
      if (data) {
        reset(data);
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
      toast.error("Failed to load site settings");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: SiteSettingsFormData) {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('site_settings')
        .update(data)
        .eq('id', true);
        
      if (error) throw error;
      
      toast.success("Site settings updated successfully");
    } catch (error) {
      console.error("Error updating site settings:", error);
      toast.error("Failed to update site settings");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="card-premium p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-display font-semibold">Global Contact & Links</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update your primary contact information and social links used across the portfolio.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("email", { required: "Email is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 pl-10 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="hello@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone (Display)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("phone_display")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 pl-10 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone (Dial Link)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("phone_tel")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 pl-10 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="+15550000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("linkedin_url")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 pl-10 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("github_url")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 pl-10 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/60">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
