import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Loader2, Save, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: number;
  title: string;
  metric: string;
  description: string;
  icon_name: string | null;
  display_order: number;
  is_visible: boolean;
}

export function AchievementsTab() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Omit<Achievement, "id">>();

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(achievement?: Achievement) {
    if (achievement) {
      setEditingAchievement(achievement);
      reset({
        title: achievement.title,
        metric: achievement.metric,
        description: achievement.description,
        icon_name: achievement.icon_name || "",
        display_order: achievement.display_order,
        is_visible: achievement.is_visible
      });
    } else {
      setEditingAchievement(null);
      reset({
        title: "",
        metric: "",
        description: "",
        icon_name: "Award",
        display_order: achievements.length > 0 ? Math.max(...achievements.map(a => a.display_order)) + 1 : 1,
        is_visible: true
      });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingAchievement(null);
    reset();
  }

  async function onSubmit(data: Omit<Achievement, "id">) {
    try {
      const formattedData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      if (editingAchievement) {
        const { error } = await supabase
          .from('achievements')
          .update(formattedData)
          .eq('id', editingAchievement.id);
        if (error) throw error;
        toast.success("Achievement updated successfully");
      } else {
        const { error } = await supabase
          .from('achievements')
          .insert([formattedData]);
        if (error) throw error;
        toast.success("Achievement added successfully");
      }
      closeModal();
      fetchAchievements();
    } catch (error) {
      console.error("Error saving achievement:", error);
      toast.error("Failed to save achievement");
    }
  }

  async function deleteAchievement(id: number) {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    
    try {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) throw error;
      toast.success("Achievement deleted");
      fetchAchievements();
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast.error("Failed to delete achievement");
    }
  }

  async function toggleVisibility(id: number, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Achievement ${!currentVisibility ? "is now visible" : "hidden"} successfully`);
      fetchAchievements();
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
          <h2 className="text-xl font-display font-semibold">Achievements Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your key statistics and professional milestones.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Achievement
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`card-premium p-5 flex flex-col justify-between gap-4 transition-all ${!achievement.is_visible ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">{achievement.metric}</div>
                <div className="font-semibold text-sm leading-tight">{achievement.title}</div>
              </div>
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <div className="text-xs text-muted-foreground">Order: {achievement.display_order}</div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleVisibility(achievement.id, achievement.is_visible)}
                  className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                  title={achievement.is_visible ? "Hide" : "Show"}
                >
                  <div className={`h-2.5 w-2.5 rounded-full ${achievement.is_visible ? 'bg-green-500' : 'bg-gray-500'}`} />
                </button>
                <button
                  onClick={() => openModal(achievement)}
                  className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteAchievement(achievement.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {achievements.length === 0 && (
          <div className="col-span-full card-premium p-12 text-center text-muted-foreground">
            <p>No achievements found. Add your first achievement to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-2">
              <h3 className="text-lg font-semibold">{editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Metric / Value</label>
                  <input
                    {...register("metric", { required: "Metric is required" })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-bold text-primary focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., 50+, 100%"
                  />
                  {errors.metric && <p className="text-xs text-red-400">{errors.metric.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    {...register("title", { required: "Title is required" })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., Projects Delivered"
                  />
                  {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...register("description", { required: "Description is required" })}
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Brief explanation..."
                />
                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon Name (Lucide)</label>
                  <input
                    {...register("icon_name")}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Award"
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
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
