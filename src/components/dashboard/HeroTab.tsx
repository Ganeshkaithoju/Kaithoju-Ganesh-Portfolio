import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Save, Loader2, Plus, Trash2, Code, Star, Sparkles, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface HeroFormData {
  hero_name: string;
  hero_subtitles: { value: string }[];
  hero_bio: string;
  // Structured Code Card & Badge Fields
  card_cgpa: string;
  card_now: string;
  card_role: string;
  card_focus: string;
  card_stack: string;
  card_badge_bottom: string;
  // Raw JSON fallback
  hero_code_card?: string;
}

export function HeroTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvancedJson, setShowAdvancedJson] = useState(false);
  
  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<HeroFormData>({
    defaultValues: {
      hero_subtitles: [{ value: "" }],
      card_cgpa: "8.42",
      card_now: "Intern @ Lumen — Backup & Restore",
      card_role: "Software & Full-Stack Dev",
      card_focus: "reliable · elegant · fast",
      card_stack: "React, Node, Python, Java, Spring Boot, MySQL",
      card_badge_bottom: "Backup & Restore",
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "hero_subtitles"
  });

  useEffect(() => {
    fetchHeroData();
  }, []);

  async function fetchHeroData() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('hero_name, hero_subtitles, hero_bio, hero_code_card')
        .eq('id', true)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const card = (data.hero_code_card as any) || {};
        reset({
          hero_name: data.hero_name || "Kaithoju Ganesh",
          hero_bio: data.hero_bio || "",
          hero_subtitles: Array.isArray(data.hero_subtitles) && data.hero_subtitles.length > 0
            ? data.hero_subtitles.map((t: string) => ({ value: t }))
            : [{ value: "full-stack web apps" }, { value: "clean interfaces" }, { value: "reliable systems" }],
          card_cgpa: card.cgpa !== undefined ? String(card.cgpa) : "8.42",
          card_now: card.now || "Intern @ Lumen — Backup & Restore",
          card_role: card.role || "Software & Full-Stack Dev",
          card_focus: card.focus || "reliable · elegant · fast",
          card_stack: Array.isArray(card.stack) ? card.stack.join(", ") : "React, Node, Python, Java, Spring Boot, MySQL",
          card_badge_bottom: card.badge_bottom || "Backup & Restore",
          hero_code_card: data.hero_code_card ? JSON.stringify(data.hero_code_card, null, 2) : "{}"
        });
      }
    } catch (error) {
      console.error("Error fetching hero data:", error);
      toast.error("Failed to load hero section data");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: HeroFormData) {
    try {
      setIsSaving(true);
      
      let parsedCodeCard: Record<string, any> = {};

      if (showAdvancedJson && data.hero_code_card && data.hero_code_card.trim() !== "") {
        try {
          parsedCodeCard = JSON.parse(data.hero_code_card);
        } catch (e) {
          toast.error("Invalid JSON in Advanced Code Card editor");
          return;
        }
      } else {
        // Build the code card cleanly from the friendly form inputs
        const parsedCgpa = parseFloat(data.card_cgpa);
        parsedCodeCard = {
          name: data.hero_name || "Kaithoju Ganesh",
          now: data.card_now || "Intern @ Lumen — Backup & Restore",
          cgpa: isNaN(parsedCgpa) ? data.card_cgpa : parsedCgpa,
          role: data.card_role || "Software & Full-Stack Dev",
          focus: data.card_focus || "reliable · elegant · fast",
          stack: data.card_stack
            ? data.card_stack.split(",").map(s => s.trim()).filter(Boolean)
            : ["React", "Node", "Python", "Java", "Spring Boot", "MySQL"],
          badge_bottom: data.card_badge_bottom || "Backup & Restore",
          shipping: true
        };
      }

      const updateData = {
        hero_name: data.hero_name,
        hero_bio: data.hero_bio,
        hero_subtitles: data.hero_subtitles.map(s => s.value).filter(s => s.trim() !== ""),
        hero_code_card: parsedCodeCard
      };

      const { error } = await supabase
        .from('site_settings')
        .update(updateData)
        .eq('id', true);
        
      if (error) throw error;
      
      // Update the JSON field in state as well
      setValue("hero_code_card", JSON.stringify(parsedCodeCard, null, 2));
      toast.success("Hero section and CGPA updated successfully");
    } catch (error) {
      console.error("Error updating hero data:", error);
      toast.error("Failed to update hero section");
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
          <h2 className="text-xl font-display font-semibold">Hero Section & Code Card</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update your name, bio, roles, CGPA, and the interactive code card on the hero banner.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Display Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name (Hero Heading)</label>
              <input
                {...register("hero_name", { required: "Name is required" })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g., Kaithoju Ganesh"
              />
              {errors.hero_name && <p className="text-xs text-red-400">{errors.hero_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Star className="h-4 w-4 text-primary" />
                CGPA Score (Floating Badge & Code Card)
              </label>
              <input
                {...register("card_cgpa", { required: "CGPA is required" })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-primary focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g., 8.42 or 9.0"
              />
            </div>
          </div>

          {/* Animated Subtitles */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Animated Rotating Roles / Subtitles</label>
            <p className="text-xs text-muted-foreground mb-2">These phrases cycle sequentially after "I build ...".</p>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    {...register(`hero_subtitles.${index}.value` as const, { required: true })}
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., full-stack web apps, clean interfaces"
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => append({ value: "" })}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/20 px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Subtitle
            </button>
          </div>

          {/* Bio / Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hero Bio / Introduction</label>
            <textarea
              {...register("hero_bio")}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Aspiring Software & Full-Stack Developer working with..."
            />
          </div>

          {/* Interactive Code Card & Badge Settings */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Code className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Interactive Code Card & Badges</h3>
                <p className="text-xs text-muted-foreground">Controls the card on the right side of your hero banner.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Top Status Pill ("now")</label>
                <input
                  {...register("card_now")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Intern @ Lumen — Backup & Restore"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Role Title ("role")</label>
                <input
                  {...register("card_role")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Software & Full-Stack Dev"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Focus Tagline ("focus")</label>
                <input
                  {...register("card_focus")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., reliable · elegant · fast"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Bottom Card Badge</label>
                <input
                  {...register("card_badge_bottom")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Backup & Restore"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                Tech Stack List ("stack" - Comma Separated)
              </label>
              <input
                {...register("card_stack")}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="React, Node, Python, Java, Spring Boot, MySQL"
              />
              <p className="text-[11px] text-muted-foreground">Separate technologies with commas.</p>
            </div>

            {/* Advanced JSON Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvancedJson(!showAdvancedJson)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAdvancedJson ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showAdvancedJson ? "Hide Raw JSON Editor" : "Show Advanced Raw JSON Editor"}
              </button>

              {showAdvancedJson && (
                <div className="mt-3 space-y-1.5">
                  <textarea
                    {...register("hero_code_card")}
                    rows={8}
                    className="w-full font-mono rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-xs focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={`{\n  "name": "...",\n  "role": "..."\n}`}
                  />
                  <p className="text-[11px] text-muted-foreground">Editing this directly will override the fields above if the raw editor is active.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/60">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save Hero Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
