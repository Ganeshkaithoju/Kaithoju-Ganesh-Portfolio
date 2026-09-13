import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AboutFormData {
  about_paragraphs: { value: string }[];
  about_focus_areas: { value: string }[];
}

export function AboutTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<AboutFormData>({
    defaultValues: {
      about_paragraphs: [{ value: "" }],
      about_focus_areas: [{ value: "" }]
    }
  });

  const { fields: pFields, append: pAppend, remove: pRemove } = useFieldArray({
    control,
    name: "about_paragraphs"
  });

  const { fields: fFields, append: fAppend, remove: fRemove } = useFieldArray({
    control,
    name: "about_focus_areas"
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  async function fetchAboutData() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('about_paragraphs, about_focus_areas')
        .eq('id', true)
        .single();
        
      if (error) throw error;
      
      if (data) {
        reset({
          about_paragraphs: Array.isArray(data.about_paragraphs) 
            ? data.about_paragraphs.map((t: string) => ({ value: t }))
            : [],
          about_focus_areas: Array.isArray(data.about_focus_areas) 
            ? data.about_focus_areas.map((t: string) => ({ value: t }))
            : []
        });
      }
    } catch (error) {
      console.error("Error fetching about data:", error);
      toast.error("Failed to load about section data");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: AboutFormData) {
    try {
      setIsSaving(true);
      
      const updateData = {
        about_paragraphs: data.about_paragraphs.map(p => p.value).filter(p => p.trim() !== ""),
        about_focus_areas: data.about_focus_areas.map(f => f.value).filter(f => f.trim() !== "")
      };

      const { error } = await supabase
        .from('site_settings')
        .update(updateData)
        .eq('id', true);
        
      if (error) throw error;
      
      toast.success("About section updated successfully");
    } catch (error) {
      console.error("Error updating about data:", error);
      toast.error("Failed to update about section");
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
          <h2 className="text-xl font-display font-semibold">About Section</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update your personal story and core focus areas.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">About Paragraphs</label>
              <p className="text-xs text-muted-foreground mb-3">
                Each entry represents a separate paragraph in your about section.
              </p>
            </div>
            
            <div className="space-y-4">
              {pFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <textarea
                    {...register(`about_paragraphs.${index}.value` as const, { required: true })}
                    rows={3}
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Write your paragraph..."
                  />
                  <button
                    type="button"
                    onClick={() => pRemove(index)}
                    className="mt-2 rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => pAppend({ value: "" })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/20 px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Paragraph
            </button>
          </div>

          <div className="border-t border-border/60 pt-8 space-y-4">
            <div>
              <label className="text-sm font-medium">Focus Areas</label>
              <p className="text-xs text-muted-foreground mb-3">
                Short phrases describing your main areas of expertise (e.g. "Full-Stack Development").
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    {...register(`about_focus_areas.${index}.value` as const, { required: true })}
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., Database Design"
                  />
                  <button
                    type="button"
                    onClick={() => fRemove(index)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => fAppend({ value: "" })}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/20 px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Focus Area
            </button>
          </div>

          <div className="flex justify-end pt-6 border-t border-border/60">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save About Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
