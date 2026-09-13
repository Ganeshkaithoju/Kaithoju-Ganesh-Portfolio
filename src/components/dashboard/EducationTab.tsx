import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Loader2, Save, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Education {
  id: number;
  title: string;
  institution: string;
  score: string;
  icon_name: string | null;
  display_order: number;
  is_visible: boolean;
}

export function EducationTab() {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Omit<Education, "id">>();

  useEffect(() => {
    fetchEducation();
  }, []);

  async function fetchEducation() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setEducationList(data || []);
    } catch (error) {
      console.error("Error fetching education:", error);
      toast.error("Failed to load education entries");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(education?: Education) {
    if (education) {
      setEditingEducation(education);
      reset({
        title: education.title,
        institution: education.institution,
        score: education.score,
        icon_name: education.icon_name || "",
        display_order: education.display_order,
        is_visible: education.is_visible
      });
    } else {
      setEditingEducation(null);
      reset({
        title: "",
        institution: "",
        score: "",
        icon_name: "GraduationCap",
        display_order: educationList.length > 0 ? Math.max(...educationList.map(e => e.display_order)) + 1 : 1,
        is_visible: true
      });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingEducation(null);
    reset();
  }

  async function onSubmit(data: Omit<Education, "id">) {
    try {
      const formattedData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      if (editingEducation) {
        const { error } = await supabase
          .from('education')
          .update(formattedData)
          .eq('id', editingEducation.id);
        if (error) throw error;
        toast.success("Education entry updated successfully");
      } else {
        const { error } = await supabase
          .from('education')
          .insert([formattedData]);
        if (error) throw error;
        toast.success("Education entry added successfully");
      }
      closeModal();
      fetchEducation();
    } catch (error) {
      console.error("Error saving education:", error);
      toast.error("Failed to save education entry");
    }
  }

  async function deleteEducation(id: number) {
    if (!confirm("Are you sure you want to delete this education entry?")) return;
    
    try {
      const { error } = await supabase.from('education').delete().eq('id', id);
      if (error) throw error;
      toast.success("Education entry deleted");
      fetchEducation();
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error("Failed to delete education entry");
    }
  }

  async function toggleVisibility(id: number, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('education')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);
      if (error) throw error;
      fetchEducation();
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
          <h2 className="text-xl font-display font-semibold">Education Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your academic qualifications and degrees.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Education
        </button>
      </div>

      <div className="grid gap-4">
        {educationList.map((edu) => (
          <div 
            key={edu.id} 
            className={`card-premium p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${!edu.is_visible ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="hidden sm:block">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
              </div>
              
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-lg">{edu.title}</h3>
                <div className="text-sm text-muted-foreground">{edu.institution}</div>
                <div className="text-sm font-medium text-primary mt-1">{edu.score}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground mr-4">Order: {edu.display_order}</div>
              
              <button
                onClick={() => toggleVisibility(edu.id, edu.is_visible)}
                className="rounded p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                title={edu.is_visible ? "Hide" : "Show"}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${edu.is_visible ? 'bg-green-500' : 'bg-gray-500'}`} />
              </button>
              <button
                onClick={() => openModal(edu)}
                className="rounded p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteEducation(edu.id)}
                className="rounded p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {educationList.length === 0 && (
          <div className="card-premium p-12 text-center text-muted-foreground">
            <p>No education entries found. Add your first academic qualification to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border/60 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-2">
              <h3 className="text-lg font-semibold">{editingEducation ? 'Edit Education' : 'Add New Education'}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Degree / Title</label>
                <input
                  {...register("title", { required: "Title is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., B.Tech — Electronics & Communication"
                />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Institution & Duration</label>
                <input
                  {...register("institution", { required: "Institution is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., University Name · 2022 – 2026"
                />
                {errors.institution && <p className="text-xs text-red-400">{errors.institution.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Score / Grade</label>
                <input
                  {...register("score", { required: "Score is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., CGPA 8.42 / 10"
                />
                {errors.score && <p className="text-xs text-red-400">{errors.score.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon Name (Lucide)</label>
                  <input
                    {...register("icon_name")}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="GraduationCap"
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

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_visible"
                  {...register("is_visible")}
                  className="rounded border-white/10 bg-white/[0.03] text-primary focus:ring-primary/60"
                />
                <label htmlFor="is_visible" className="text-sm font-medium">Visible to public</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border/60">
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
                  Save Education
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
