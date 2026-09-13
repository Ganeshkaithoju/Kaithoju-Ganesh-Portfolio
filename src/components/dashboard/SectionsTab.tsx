import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Loader2, Save, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Section {
  id: string; // The section ID (e.g., "about", "projects")
  title: string;
  subtitle: string | null;
  display_order: number;
  is_visible: boolean;
}

export function SectionsTab() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Section>();

  useEffect(() => {
    fetchSections();
  }, []);

  async function fetchSections() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('website_sections')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Failed to load section configuration");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(section?: Section) {
    if (section) {
      setEditingSection(section);
      reset({
        id: section.id,
        title: section.title,
        subtitle: section.subtitle || "",
        display_order: section.display_order,
        is_visible: section.is_visible
      });
    } else {
      setEditingSection(null);
      reset({
        id: "",
        title: "",
        subtitle: "",
        display_order: sections.length > 0 ? Math.max(...sections.map(s => s.display_order)) + 1 : 1,
        is_visible: true
      });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingSection(null);
    reset();
  }

  async function onSubmit(data: Section) {
    try {
      const formattedData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      // Ensure id doesn't contain spaces and is lowercase
      formattedData.id = formattedData.id.toLowerCase().replace(/\s+/g, '-');

      if (editingSection) {
        // We might be updating the ID, but usually it's best not to.
        // For safety, we update based on the original ID.
        const { error } = await supabase
          .from('website_sections')
          .update({
            title: formattedData.title,
            subtitle: formattedData.subtitle,
            display_order: formattedData.display_order,
            is_visible: formattedData.is_visible,
            updated_at: formattedData.updated_at
          })
          .eq('id', editingSection.id);
        if (error) throw error;
        toast.success("Section updated successfully");
      } else {
        const { error } = await supabase
          .from('website_sections')
          .insert([formattedData]);
        if (error) throw error;
        toast.success("Section added successfully");
      }
      closeModal();
      fetchSections();
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error("Failed to save section");
    }
  }

  async function toggleVisibility(id: string, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('website_sections')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);
      if (error) throw error;
      fetchSections();
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
          <h2 className="text-xl font-display font-semibold">Section Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage titles, subtitles, ordering, and visibility of main portfolio sections.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Section
        </button>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <div 
            key={section.id} 
            className={`card-premium p-4 flex items-center justify-between gap-4 transition-all ${!section.is_visible ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}
          >
            <div className="flex items-center gap-4 flex-1">
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                  <span className="font-mono text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    id: {section.id}
                  </span>
                </div>
                {section.subtitle && (
                  <div className="text-sm text-muted-foreground">{section.subtitle}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground mr-4">Order: {section.display_order}</div>
              
              <button
                onClick={() => toggleVisibility(section.id, section.is_visible)}
                className="rounded p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                title={section.is_visible ? "Hide section from portfolio" : "Show section in portfolio"}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${section.is_visible ? 'bg-green-500' : 'bg-gray-500'}`} />
              </button>
              <button
                onClick={() => openModal(section)}
                className="rounded p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <div className="card-premium p-12 text-center text-muted-foreground">
            <p>No sections found. Add your sections to control layout and visibility.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-2">
              <h3 className="text-lg font-semibold">{editingSection ? 'Edit Section' : 'Add New Section'}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Section ID</label>
                <input
                  {...register("id", { required: "ID is required" })}
                  disabled={!!editingSection}
                  className="w-full font-mono rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  placeholder="e.g., about, projects, experience"
                />
                {!editingSection && <p className="text-xs text-muted-foreground">This ID maps to the hardcoded section in your React code.</p>}
                {errors.id && <p className="text-xs text-red-400">{errors.id.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Display Title</label>
                <input
                  {...register("title", { required: "Title is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., About Me"
                />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subtitle</label>
                <input
                  {...register("subtitle")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Get to know me better"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <input
                  type="number"
                  {...register("display_order", { required: true, valueAsNumber: true })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
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
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
