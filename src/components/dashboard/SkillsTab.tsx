import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Loader2, Save, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Skill {
  id: number;
  group_name: string;
  name: string;
  level: number;
  icon_name: string | null;
  display_order: number;
  is_visible: boolean;
}

export function SkillsTab() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Omit<Skill, "id">>();

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchSkills() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Failed to load skills");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(skill?: Skill) {
    if (skill) {
      setEditingSkill(skill);
      reset({
        group_name: skill.group_name,
        name: skill.name,
        level: skill.level,
        icon_name: skill.icon_name || "",
        display_order: skill.display_order,
        is_visible: skill.is_visible
      });
    } else {
      setEditingSkill(null);
      reset({
        group_name: "Frontend",
        name: "",
        level: 80,
        icon_name: "Layers",
        display_order: skills.length > 0 ? Math.max(...skills.map(s => s.display_order)) + 1 : 1,
        is_visible: true
      });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingSkill(null);
    reset();
  }

  async function onSubmit(data: Omit<Skill, "id">) {
    try {
      if (editingSkill) {
        const { error } = await supabase
          .from('skills')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingSkill.id);
        if (error) throw error;
        toast.success("Skill updated successfully");
      } else {
        const { error } = await supabase
          .from('skills')
          .insert([data]);
        if (error) throw error;
        toast.success("Skill added successfully");
      }
      closeModal();
      fetchSkills();
    } catch (error: any) {
      console.error("Error saving skill:", error);
      toast.error(error.message || "Failed to save skill");
    }
  }

  async function deleteSkill(id: number) {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    
    try {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) throw error;
      toast.success("Skill deleted");
      fetchSkills();
    } catch (error: any) {
      console.error("Error deleting skill:", error);
      toast.error(error.message || "Failed to delete skill");
    }
  }

  async function toggleVisibility(id: number, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('skills')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);
      if (error) throw error;
      fetchSkills();
    } catch (error: any) {
      console.error("Error toggling visibility:", error);
      toast.error(error.message || "Failed to update visibility");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group skills by category for display
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.group_name]) {
      acc[skill.group_name] = [];
    }
    acc[skill.group_name].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold">Skills Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage the skills displayed in your portfolio.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Skill
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(groupedSkills).map(([group, groupSkills]) => (
          <div key={group} className="card-premium p-6">
            <h3 className="mb-4 text-lg font-semibold">{group}</h3>
            <div className="space-y-3">
              {groupSkills.map((skill) => (
                <div 
                  key={skill.id} 
                  className={`flex items-center justify-between rounded-lg border border-white/10 p-3 transition-colors ${!skill.is_visible ? 'opacity-50 grayscale' : 'bg-white/[0.02]'}`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <div>
                      <div className="font-medium text-sm">{skill.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <span>{skill.level}%</span>
                        <span>•</span>
                        <span>Order: {skill.display_order}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(skill.id, skill.is_visible)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                      title={skill.is_visible ? "Hide skill" : "Show skill"}
                    >
                      <div className={`h-2.5 w-2.5 rounded-full ${skill.is_visible ? 'bg-green-500' : 'bg-gray-500'}`} />
                    </button>
                    <button
                      onClick={() => openModal(skill)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {skills.length === 0 && (
          <div className="col-span-2 card-premium p-12 text-center text-muted-foreground">
            <p>No skills found. Add your first skill to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name</label>
                <input
                  {...register("group_name", { required: "Group name is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Frontend, Backend, Tools"
                  list="skill-groups"
                />
                <datalist id="skill-groups">
                  {Object.keys(groupedSkills).map(g => <option key={g} value={g} />)}
                </datalist>
                {errors.group_name && <p className="text-xs text-red-400">{errors.group_name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Skill Name</label>
                <input
                  {...register("name", { required: "Skill name is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., React, Python"
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Proficiency (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    {...register("level", { 
                      required: true, 
                      valueAsNumber: true,
                      min: 0,
                      max: 100
                    })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Lucide Icon Name</label>
                <input
                  {...register("icon_name")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Layers, Server, Code2"
                />
                <p className="text-xs text-muted-foreground">Name of the Lucide icon to use.</p>
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
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
