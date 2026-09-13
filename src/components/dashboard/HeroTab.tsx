import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Save, Loader2, Plus, Trash2, Code } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface HeroFormData {
  hero_name: string;
  hero_subtitles: { value: string }[];
  hero_bio: string;
  hero_code_card: string; // We'll store it as a JSON string in the form and parse/stringify it
}

export function HeroTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<HeroFormData>({
    defaultValues: {
      hero_subtitles: [{ value: "" }]
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
        reset({
          hero_name: data.hero_name || "",
          hero_bio: data.hero_bio || "",
          hero_subtitles: Array.isArray(data.hero_subtitles) 
            ? data.hero_subtitles.map((t: string) => ({ value: t }))
            : [],
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
      
      // Parse the JSON string for the code card
      let parsedCodeCard = null;
      try {
        if (data.hero_code_card && data.hero_code_card.trim() !== "") {
          parsedCodeCard = JSON.parse(data.hero_code_card);
        }
      } catch (e) {
        toast.error("Invalid JSON format in Code Card");
        return;
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
      
      toast.success("Hero section updated successfully");
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
          <h2 className="text-xl font-display font-semibold">Hero Section</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update the introduction content that appears at the very top of your portfolio.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <input
              {...register("hero_name", { required: "Name is required" })}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g., Ganesh"
            />
            {errors.hero_name && <p className="text-xs text-red-400">{errors.hero_name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Animated Subtitles</label>
            <p className="text-xs text-muted-foreground mb-2">These roles will type out sequentially in the hero header.</p>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    {...register(`hero_subtitles.${index}.value` as const, { required: true })}
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., Full-Stack Developer"
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Hero Bio / Introduction</label>
            <textarea
              {...register("hero_bio")}
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="A short introductory paragraph..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" /> 
              Interactive Code Card (JSON)
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              This powers the floating code snippet element. Ensure it is valid JSON.
            </p>
            <textarea
              {...register("hero_code_card")}
              rows={8}
              className="w-full font-mono rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={`{\n  "name": "...",\n  "role": "..."\n}`}
            />
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
