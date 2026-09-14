import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Loader2, Save, X, GripVertical, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { iconMap } from "@/hooks/usePortfolioData";

interface TimelineItem {
  id: number;
  year: string;
  title: string;
  description: string;
  icon_name: string | null;
  display_order: number;
  is_visible: boolean;
}

const DEFAULT_TIMELINE_ITEMS: TimelineItem[] = [
  { id: 1, year: "2020", title: "Completed SSC", description: "Z.P.H.S Chimanpally, Nizamabad — CGPA 10/10.", icon_name: "GraduationCap", display_order: 1, is_visible: true },
  { id: 2, year: "2022", title: "Completed Intermediate", description: "Trinity Junior College, Karimnagar — 83.9%.", icon_name: "GraduationCap", display_order: 2, is_visible: true },
  { id: 3, year: "2022", title: "Started B.Tech (ECE)", description: "Began Electronics & Communication Engineering at Narasimha Reddy Engineering College.", icon_name: "Code2", display_order: 3, is_visible: true },
  { id: 4, year: "2025", title: "Python Intern @ YBI Foundation", description: "Built projects like Tic-Tac-Toe and Rock-Paper-Scissors while learning core Python.", icon_name: "Rocket", display_order: 4, is_visible: true },
  { id: 5, year: "2025", title: "Summer Intern @ BHEL", description: "Team member on a thermal power systems project — analysed PLC and CNC processes at BHEL Hyderabad.", icon_name: "Briefcase", display_order: 5, is_visible: true },
  { id: 6, year: "2026", title: "Intern @ Lumen Technologies", description: "Intern on the Backup & Restore team at Lumen Technologies India — Bengaluru.", icon_name: "HardDrive", display_order: 6, is_visible: true },
];

export function TimelineTab() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Omit<TimelineItem, "id">>();

  useEffect(() => {
    fetchTimeline();
  }, []);

  async function fetchTimeline() {
    try {
      setIsLoading(true);
      
      // 1. Try fetching from public.timeline table first
      try {
        const { data, error } = await supabase
          .from('timeline')
          .select('*')
          .order('display_order', { ascending: true });
          
        if (!error && data && data.length > 0) {
          setTimelineItems(data);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // Table may not exist yet
      }

      // 2. Try fetching from website_sections content for 'timeline'
      const { data: secData } = await supabase
        .from('website_sections')
        .select('content')
        .eq('id', 'timeline')
        .single();
        
      if (secData?.content) {
        try {
          const parsed = JSON.parse(secData.content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTimelineItems(parsed.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing timeline content JSON:", e);
        }
      }

      // 3. Fallback to default items
      setTimelineItems(DEFAULT_TIMELINE_ITEMS);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      setTimelineItems(DEFAULT_TIMELINE_ITEMS);
      toast.error("Failed to load timeline entries from database, using defaults");
    } finally {
      setIsLoading(false);
    }
  }

  // Dual sync helper to keep website_sections content in sync
  async function syncToSectionContent(items: TimelineItem[]) {
    try {
      await supabase
        .from('website_sections')
        .update({
          content: JSON.stringify(items),
          updated_at: new Date().toISOString()
        })
        .eq('id', 'timeline');
    } catch (e) {
      console.error("Error syncing timeline to website_sections content:", e);
    }
  }

  function openModal(item?: TimelineItem) {
    if (item) {
      setEditingItem(item);
      reset({
        year: item.year,
        title: item.title,
        description: item.description,
        icon_name: item.icon_name || "GraduationCap",
        display_order: item.display_order,
        is_visible: item.is_visible
      });
    } else {
      setEditingItem(null);
      reset({
        year: new Date().getFullYear().toString(),
        title: "",
        description: "",
        icon_name: "GraduationCap",
        display_order: timelineItems.length > 0 ? Math.max(...timelineItems.map(t => t.display_order)) + 1 : 1,
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

  async function onSubmit(data: Omit<TimelineItem, "id">) {
    try {
      const formattedData = {
        year: data.year.trim(),
        title: data.title.trim(),
        description: data.description.trim(),
        icon_name: data.icon_name || "GraduationCap",
        display_order: Number(data.display_order) || 1,
        is_visible: Boolean(data.is_visible),
        updated_at: new Date().toISOString()
      };

      let updatedList = [...timelineItems];

      if (editingItem) {
        // Try DB update
        try {
          await supabase
            .from('timeline')
            .update(formattedData)
            .eq('id', editingItem.id);
        } catch (e) {
          // Fall through
        }

        updatedList = updatedList.map(t => t.id === editingItem.id ? { ...t, ...formattedData } : t);
        toast.success("Timeline milestone updated successfully");
      } else {
        const nextId = timelineItems.length > 0 ? Math.max(...timelineItems.map(t => t.id)) + 1 : 1;
        
        // Try DB insert
        try {
          const { data: inserted } = await supabase
            .from('timeline')
            .insert([formattedData])
            .select();
          if (inserted && inserted[0]) {
            updatedList.push(inserted[0]);
          } else {
            updatedList.push({ id: nextId, ...formattedData });
          }
        } catch (e) {
          updatedList.push({ id: nextId, ...formattedData });
        }
        
        toast.success("Timeline milestone added successfully");
      }

      updatedList.sort((a, b) => a.display_order - b.display_order);
      setTimelineItems(updatedList);
      await syncToSectionContent(updatedList);

      closeModal();
      fetchTimeline();
    } catch (error) {
      console.error("Error saving timeline entry:", error);
      toast.error("Failed to save timeline milestone");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this timeline milestone?")) return;
    try {
      try {
        await supabase
          .from('timeline')
          .delete()
          .eq('id', id);
      } catch (e) {
        // Fall through
      }

      const updatedList = timelineItems.filter(t => t.id !== id);
      setTimelineItems(updatedList);
      await syncToSectionContent(updatedList);
      toast.success("Timeline milestone deleted");
    } catch (error) {
      console.error("Error deleting timeline milestone:", error);
      toast.error("Failed to delete milestone");
    }
  }

  async function toggleVisibility(item: TimelineItem) {
    try {
      const nextVisible = !item.is_visible;
      try {
        await supabase
          .from('timeline')
          .update({ is_visible: nextVisible, updated_at: new Date().toISOString() })
          .eq('id', item.id);
      } catch (e) {
        // Fall through
      }

      const updatedList = timelineItems.map(t => t.id === item.id ? { ...t, is_visible: nextVisible } : t);
      setTimelineItems(updatedList);
      await syncToSectionContent(updatedList);
      toast.success(`Milestone ${nextVisible ? 'visible' : 'hidden'}`);
    } catch (error) {
      console.error("Error toggling milestone visibility:", error);
      toast.error("Failed to update visibility");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold">Timeline Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your career progression, education journey, and professional milestones.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" /> Add Milestone
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : timelineItems.length === 0 ? (
        <div className="card-premium p-12 text-center text-muted-foreground">
          <Clock className="mx-auto h-12 w-12 opacity-30 mb-3" />
          <p>No timeline milestones found. Click "Add Milestone" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timelineItems.map((item) => {
            const IconCmp = (item.icon_name && iconMap[item.icon_name]) || Clock;
            return (
              <div
                key={item.id}
                className={`card-premium p-5 flex flex-col justify-between transition-all ${
                  !item.is_visible ? "opacity-60 bg-white/[0.01]" : ""
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-9 w-9 place-items-center rounded-lg glass text-primary">
                        <IconCmp className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                          {item.year}
                        </span>
                        <h3 className="font-display font-semibold text-base mt-1">{item.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal(item)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors"
                        title="Edit milestone"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete milestone"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Order: {item.display_order}</span>
                  <div className="flex items-center gap-2">
                    <span className={item.is_visible ? "text-emerald-400" : "text-muted-foreground"}>
                      {item.is_visible ? "Visible" : "Hidden"}
                    </span>
                    <button
                      onClick={() => toggleVisibility(item)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.is_visible ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                          item.is_visible ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="card-premium w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
              <h3 className="font-display font-semibold text-lg">
                {editingItem ? "Edit Milestone" : "Add Timeline Milestone"}
              </h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                    Year / Period *
                  </label>
                  <input
                    {...register("year", { required: "Year is required" })}
                    placeholder="e.g. 2026 or 2024 — Present"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  {errors.year && <p className="text-red-400 text-xs mt-1">{errors.year.message}</p>}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    {...register("display_order", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  Milestone Title *
                </label>
                <input
                  {...register("title", { required: "Title is required" })}
                  placeholder="e.g. Intern @ Lumen Technologies"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  Description *
                </label>
                <textarea
                  {...register("description", { required: "Description is required" })}
                  rows={3}
                  placeholder="Details about this stage of your journey..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  Icon
                </label>
                <select
                  {...register("icon_name")}
                  className="w-full rounded-xl border border-white/10 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="GraduationCap">GraduationCap (Education)</option>
                  <option value="Code2">Code2 (Engineering/Programming)</option>
                  <option value="Rocket">Rocket (Launch/Growth/Projects)</option>
                  <option value="Briefcase">Briefcase (Internship/Work)</option>
                  <option value="HardDrive">HardDrive (Infrastructure/Storage)</option>
                  <option value="Award">Award (Achievement/Honor)</option>
                  <option value="Shield">Shield (Security/Certification)</option>
                  <option value="Terminal">Terminal (Scripting/CLI)</option>
                  <option value="Globe">Globe (Web/Global)</option>
                  <option value="Server">Server (Backend)</option>
                  <option value="Layers">Layers (Full Stack)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_visible"
                  {...register("is_visible")}
                  className="rounded border-white/10 bg-white/[0.03] text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="is_visible" className="text-sm font-medium">
                  Visible on public website
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
