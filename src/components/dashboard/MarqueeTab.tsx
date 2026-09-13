import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Loader2, Save, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MarqueeItem {
  id: number;
  text: string;
  icon_name: string | null;
  display_order: number;
  is_visible: boolean;
}

export function MarqueeTab() {
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarqueeItem | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Omit<MarqueeItem, "id">>();

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('marquee_items')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching marquee items:", error);
      toast.error("Failed to load marquee items");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(item?: MarqueeItem) {
    if (item) {
      setEditingItem(item);
      reset({
        text: item.text,
        icon_name: item.icon_name || "",
        display_order: item.display_order,
        is_visible: item.is_visible
      });
    } else {
      setEditingItem(null);
      reset({
        text: "",
        icon_name: "",
        display_order: items.length > 0 ? Math.max(...items.map(i => i.display_order)) + 1 : 1,
        is_visible: true
      });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingItem(null);
    reset();
  }

  async function onSubmit(data: Omit<MarqueeItem, "id">) {
    try {
      const formattedData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      if (editingItem) {
        const { error } = await supabase
          .from('marquee_items')
          .update(formattedData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success("Item updated successfully");
      } else {
        const { error } = await supabase
          .from('marquee_items')
          .insert([formattedData]);
        if (error) throw error;
        toast.success("Item added successfully");
      }
      closeModal();
      fetchItems();
    } catch (error: any) {
      console.error("Error saving marquee item:", error);
      toast.error(error.message || "Failed to save marquee item");
    }
  }

  async function deleteItem(id: number) {
    if (!confirm("Are you sure you want to delete this marquee item?")) return;
    
    try {
      const { error } = await supabase.from('marquee_items').delete().eq('id', id);
      if (error) throw error;
      toast.success("Marquee item deleted");
      fetchItems();
    } catch (error: any) {
      console.error("Error deleting marquee item:", error);
      toast.error(error.message || "Failed to delete marquee item");
    }
  }

  async function toggleVisibility(id: number, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('marquee_items')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);
      if (error) throw error;
      fetchItems();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold">Marquee Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage the technologies scrolling in the infinite marquee.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`card-premium p-4 flex items-center justify-between gap-4 transition-all ${!item.is_visible ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move flex-shrink-0" />
              <div className="flex-1 truncate">
                <div className="font-semibold text-lg">{item.text}</div>
                <div className="text-[10px] text-muted-foreground">Order: {item.display_order}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => toggleVisibility(item.id, item.is_visible)}
                className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                title={item.is_visible ? "Hide" : "Show"}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${item.is_visible ? 'bg-green-500' : 'bg-gray-500'}`} />
              </button>
              <button
                onClick={() => openModal(item)}
                className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full card-premium p-12 text-center text-muted-foreground">
            <p>No marquee items found. Add your first item to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-2">
              <h3 className="text-lg font-semibold">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Text / Technology Name</label>
                <input
                  {...register("text", { required: "Text is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., React, Node.js"
                />
                {errors.text && <p className="text-xs text-red-400">{errors.text.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Icon Name (Lucide)</label>
                <input
                  {...register("icon_name")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Code"
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
