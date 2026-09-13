import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Loader2, Save, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NavigationLink {
  id: number;
  label: string;
  path: string;
  icon_name: string | null;
  display_order: number;
  is_visible: boolean;
}

export function NavigationTab() {
  const [links, setLinks] = useState<NavigationLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<NavigationLink | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Omit<NavigationLink, "id">>();

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('navigation_links')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching navigation links:", error);
      toast.error("Failed to load navigation configuration");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(link?: NavigationLink) {
    if (link) {
      setEditingLink(link);
      reset({
        label: link.label,
        path: link.path,
        icon_name: link.icon_name || "",
        display_order: link.display_order,
        is_visible: link.is_visible
      });
    } else {
      setEditingLink(null);
      reset({
        label: "",
        path: "#",
        icon_name: "Link",
        display_order: links.length > 0 ? Math.max(...links.map(l => l.display_order)) + 1 : 1,
        is_visible: true
      });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingLink(null);
    reset();
  }

  async function onSubmit(data: Omit<NavigationLink, "id">) {
    try {
      const formattedData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      if (editingLink) {
        const { error } = await supabase
          .from('navigation_links')
          .update(formattedData)
          .eq('id', editingLink.id);
        if (error) throw error;
        toast.success("Navigation link updated successfully");
      } else {
        const { error } = await supabase
          .from('navigation_links')
          .insert([formattedData]);
        if (error) throw error;
        toast.success("Navigation link added successfully");
      }
      closeModal();
      fetchLinks();
    } catch (error) {
      console.error("Error saving navigation link:", error);
      toast.error("Failed to save navigation link");
    }
  }

  async function deleteLink(id: number) {
    if (!confirm("Are you sure you want to delete this navigation link?")) return;
    
    try {
      const { error } = await supabase.from('navigation_links').delete().eq('id', id);
      if (error) throw error;
      toast.success("Navigation link deleted");
      fetchLinks();
    } catch (error) {
      console.error("Error deleting navigation link:", error);
      toast.error("Failed to delete navigation link");
    }
  }

  async function toggleVisibility(id: number, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('navigation_links')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);
      if (error) throw error;
      fetchLinks();
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
          <h2 className="text-xl font-display font-semibold">Navigation Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage the links in your top navigation bar.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Link
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <div 
            key={link.id} 
            className={`card-premium p-4 flex items-center justify-between gap-4 transition-all ${!link.is_visible ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move flex-shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-sm truncate">{link.label}</div>
                <div className="text-xs text-muted-foreground truncate">{link.path}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-xs text-muted-foreground mr-2">Order: {link.display_order}</div>
              
              <button
                onClick={() => toggleVisibility(link.id, link.is_visible)}
                className="rounded p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                title={link.is_visible ? "Hide" : "Show"}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${link.is_visible ? 'bg-green-500' : 'bg-gray-500'}`} />
              </button>
              <button
                onClick={() => openModal(link)}
                className="rounded p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteLink(link.id)}
                className="rounded p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {links.length === 0 && (
          <div className="col-span-full card-premium p-12 text-center text-muted-foreground">
            <p>No navigation links found. Add your first link to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-2">
              <h3 className="text-lg font-semibold">{editingLink ? 'Edit Link' : 'Add New Link'}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Label</label>
                <input
                  {...register("label", { required: "Label is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., About, Projects"
                />
                {errors.label && <p className="text-xs text-red-400">{errors.label.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Path / Anchor URL</label>
                <input
                  {...register("path", { required: "Path is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., #about, /blog"
                />
                {errors.path && <p className="text-xs text-red-400">{errors.path.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Icon Name (Optional)</label>
                <input
                  {...register("icon_name")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="User"
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
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
