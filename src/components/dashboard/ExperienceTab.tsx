import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Edit2, Trash2, Loader2, Save, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  location: string;
  is_current: boolean;
  bullets: string[];
  icon_name: string | null;
  display_order: number;
  is_visible: boolean;
}

interface ExperienceFormData extends Omit<Experience, 'id' | 'bullets'> {
  bullets: { value: string }[];
}

export function ExperienceTab() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<ExperienceFormData>();

  const { fields: bulletFields, append: appendBullet, remove: removeBullet } = useFieldArray({
    control,
    name: "bullets"
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  async function fetchExperiences() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      toast.error("Failed to load experiences");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(experience?: Experience) {
    if (experience) {
      setEditingExperience(experience);
      reset({
        title: experience.title,
        company: experience.company,
        period: experience.period,
        location: experience.location,
        is_current: experience.is_current,
        bullets: experience.bullets ? experience.bullets.map(b => ({ value: b })) : [{ value: "" }],
        icon_name: experience.icon_name || "",
        display_order: experience.display_order,
        is_visible: experience.is_visible
      });
    } else {
      setEditingExperience(null);
      reset({
        title: "",
        company: "",
        period: "",
        location: "",
        is_current: false,
        bullets: [{ value: "" }],
        icon_name: "Briefcase",
        display_order: experiences.length > 0 ? Math.max(...experiences.map(e => e.display_order)) + 1 : 1,
        is_visible: true
      });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingExperience(null);
    reset();
  }

  async function onSubmit(data: ExperienceFormData) {
    try {
      const formattedData = {
        ...data,
        bullets: data.bullets.map(b => b.value).filter(b => b.trim() !== ""),
        updated_at: new Date().toISOString()
      };

      if (editingExperience) {
        const { error } = await supabase
          .from('experience')
          .update(formattedData)
          .eq('id', editingExperience.id);
        if (error) throw error;
        toast.success("Experience updated successfully");
      } else {
        const { error } = await supabase
          .from('experience')
          .insert([formattedData]);
        if (error) throw error;
        toast.success("Experience added successfully");
      }
      closeModal();
      fetchExperiences();
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error("Failed to save experience");
    }
  }

  async function deleteExperience(id: number) {
    if (!confirm("Are you sure you want to delete this experience entry?")) return;
    
    try {
      const { error } = await supabase.from('experience').delete().eq('id', id);
      if (error) throw error;
      toast.success("Experience deleted");
      fetchExperiences();
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error("Failed to delete experience");
    }
  }

  async function toggleVisibility(id: number, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('experience')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);
      if (error) throw error;
      fetchExperiences();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to update visibility");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold">Experience Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your work history and professional experience.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Experience
        </button>
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <div 
            key={exp.id} 
            className={`card-premium p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all ${!exp.is_visible ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1 hidden sm:block">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{exp.title}</h3>
                  {exp.is_current && <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">Current</span>}
                </div>
                
                <div className="text-sm font-medium text-primary">{exp.company}</div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Period:</span> {exp.period}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Location:</span> {exp.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Order:</span> {exp.display_order}
                  </div>
                </div>
                
                <ul className="mt-3 list-disc pl-4 space-y-1">
                  {exp.bullets?.slice(0, 2).map((bullet, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground">{bullet}</li>
                  ))}
                  {exp.bullets?.length > 2 && (
                    <li className="text-xs text-muted-foreground italic">+{exp.bullets.length - 2} more...</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
              <button
                onClick={() => toggleVisibility(exp.id, exp.is_visible)}
                className="rounded p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                title={exp.is_visible ? "Hide" : "Show"}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${exp.is_visible ? 'bg-green-500' : 'bg-gray-500'}`} />
              </button>
              <button
                onClick={() => openModal(exp)}
                className="rounded p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteExperience(exp.id)}
                className="rounded p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {experiences.length === 0 && (
          <div className="card-premium p-12 text-center text-muted-foreground">
            <p>No experiences found. Add your first experience to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-border/60 bg-card p-6 shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto scrollbar-none">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-card z-10 pb-2 border-b border-border/60">
              <h3 className="text-lg font-semibold">{editingExperience ? 'Edit Experience' : 'Add New Experience'}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Title</label>
                  <input
                    {...register("title", { required: "Title is required" })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., Senior Developer"
                  />
                  {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <input
                    {...register("company", { required: "Company is required" })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., Tech Corp"
                  />
                  {errors.company && <p className="text-xs text-red-400">{errors.company.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Period</label>
                  <input
                    {...register("period", { required: "Period is required" })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., Jan 2020 - Present"
                  />
                  {errors.period && <p className="text-xs text-red-400">{errors.period.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    {...register("location", { required: "Location is required" })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., New York, NY"
                  />
                  {errors.location && <p className="text-xs text-red-400">{errors.location.message}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Bullet Points</label>
                {bulletFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <textarea
                      {...register(`bullets.${index}.value` as const, { required: true })}
                      rows={2}
                      className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder={`Bullet point ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeBullet(index)}
                      className="mt-1 text-muted-foreground hover:text-red-400 p-1 rounded hover:bg-white/5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendBullet({ value: "" })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/20 px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Bullet Point
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon Name</label>
                  <input
                    {...register("icon_name")}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Briefcase"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Order</label>
                  <input
                    type="number"
                    {...register("display_order", { required: true, valueAsNumber: true })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="flex gap-6 py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    {...register("is_current")}
                    className="rounded border-white/10 bg-white/[0.03] text-primary focus:ring-primary/60"
                  />
                  <label htmlFor="is_current" className="text-sm font-medium text-primary">Current Role</label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_visible"
                    {...register("is_visible")}
                    className="rounded border-white/10 bg-white/[0.03] text-primary focus:ring-primary/60"
                  />
                  <label htmlFor="is_visible" className="text-sm font-medium">Visible to public</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border/60 sticky bottom-0 bg-card pb-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
