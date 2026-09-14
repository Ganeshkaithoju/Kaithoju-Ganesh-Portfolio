import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Loader2, Save, X, GripVertical, FileEdit, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Section {
  id: string; // The section ID (e.g., "about", "projects")
  title: string;
  subtitle: string | null;
  content?: string | null;
  display_order: number;
  is_visible: boolean;
}

interface SectionsTabProps {
  onNavigateTab?: (tabId: string) => void;
}

const CORE_SECTION_TAB_MAP: Record<string, { tab: string; label: string }> = {
  hero: { tab: "hero", label: "Hero Banner & CGPA" },
  about: { tab: "about", label: "About Bio & Focus" },
  skills: { tab: "skills", label: "Skills & Levels" },
  projects: { tab: "projects", label: "Projects & Tech" },
  experience: { tab: "experience", label: "Experience & Roles" },
  education: { tab: "education", label: "Education & Scores" },
  timeline: { tab: "timeline", label: "Timeline & Milestones" },
  services: { tab: "services", label: "Services & Offerings" },
  "why-hire": { tab: "why-hire", label: "Why Hire Me Cards" },
  achievements: { tab: "achievements", label: "Key Stats & Numbers" },
  certifications: { tab: "certifications", label: "Certifications & Links" },
  marquee: { tab: "marquee", label: "Marquee Rolling Text" },
  resume: { tab: "resume", label: "Resume PDF Upload" },
  contact: { tab: "site-settings", label: "Contact Information" },
};

export function SectionsTab({ onNavigateTab }: SectionsTabProps) {
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
        content: section.content || "",
        display_order: section.display_order,
        is_visible: section.is_visible
      });
    } else {
      setEditingSection(null);
      reset({
        id: "",
        title: "",
        subtitle: "",
        content: "",
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
      const formattedId = data.id.toLowerCase().replace(/\s+/g, '-');
      const formattedData: any = {
        title: data.title,
        subtitle: data.subtitle || null,
        display_order: Number(data.display_order) || 1,
        is_visible: Boolean(data.is_visible),
        updated_at: new Date().toISOString()
      };

      if (data.content !== undefined && data.content !== null) {
        formattedData.content = data.content;
      }

      if (editingSection) {
        let updateRes = await supabase
          .from('website_sections')
          .update(formattedData)
          .eq('id', editingSection.id);
          
        if (updateRes.error && updateRes.error.message?.includes('content')) {
          delete formattedData.content;
          updateRes = await supabase
            .from('website_sections')
            .update(formattedData)
            .eq('id', editingSection.id);
        }

        if (updateRes.error) throw updateRes.error;
        toast.success("Section updated successfully");
      } else {
        formattedData.id = formattedId;
        formattedData.show_in_nav = true;

        let insertRes = await supabase
          .from('website_sections')
          .insert([formattedData]);

        if (insertRes.error && insertRes.error.message?.includes('content')) {
          delete formattedData.content;
          insertRes = await supabase
            .from('website_sections')
            .insert([formattedData]);
        }

        if (insertRes.error) throw insertRes.error;
        toast.success("New section added successfully");
      }
      closeModal();
      fetchSections();
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error("Failed to save section");
    }
  }

  async function handleDeleteSection(id: string, title: string) {
    if (CORE_SECTION_TAB_MAP[id]) {
      toast.error("Core portfolio sections cannot be deleted. You can toggle their visibility off instead.");
      return;
    }

    if (!confirm(`Are you sure you want to delete the custom section "${title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('website_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(`Section "${title}" removed successfully`);
      fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Failed to delete section");
    }
  }

  async function toggleVisibility(id: string, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('website_sections')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Section ${!currentVisibility ? "is now visible" : "hidden"} successfully`);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold">Section Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Reorder, toggle visibility, and directly manage content for each portfolio section.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add Section
        </button>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => {
          const coreConfig = CORE_SECTION_TAB_MAP[section.id];
          const isCore = !!coreConfig;

          return (
            <div 
              key={section.id} 
              className={`card-premium p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${!section.is_visible ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}
            >
              <div className="flex items-center gap-4 flex-1">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move shrink-0" />
                
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold text-base sm:text-lg text-foreground">{section.title}</h3>
                    <span className="font-mono text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      id: {section.id}
                    </span>
                    {isCore ? (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary/80 bg-primary/10 px-2 py-0.5 rounded">
                        Core System
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded">
                        Custom Section
                      </span>
                    )}
                  </div>
                  {section.subtitle && (
                    <div className="text-sm text-muted-foreground truncate">{section.subtitle}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                <div className="text-xs text-muted-foreground mr-2">Order: {section.display_order}</div>
                
                {/* Edit Content Button for Core Sections */}
                {isCore && onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab(coreConfig.tab)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                    title={`Open ${coreConfig.label} Editor`}
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    Edit Content
                  </button>
                )}

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => toggleVisibility(section.id, section.is_visible)}
                  className="rounded p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                  title={section.is_visible ? "Section is visible on portfolio. Click to hide." : "Section is hidden. Click to show."}
                >
                  <div className={`h-2.5 w-2.5 rounded-full ${section.is_visible ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`} />
                </button>

                {/* Edit Settings Modal */}
                <button
                  type="button"
                  onClick={() => openModal(section)}
                  className="rounded p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                  title="Configure title & details"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                {/* Delete for Custom Sections */}
                {!isCore && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(section.id, section.title)}
                    className="rounded p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    title="Delete custom section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {sections.length === 0 && (
          <div className="card-premium p-12 text-center text-muted-foreground">
            <p>No sections found. Add your sections to control layout and visibility.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {editingSection ? `Edit Section: ${editingSection.title}` : 'Add New Section'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure display titles, order, and section content.
                </p>
              </div>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* If Core Section, provide a direct shortcut banner */}
            {editingSection && CORE_SECTION_TAB_MAP[editingSection.id] && onNavigateTab && (
              <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Core System Section:</span> All items, cards, and data are managed in the specialized tab.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    onNavigateTab(CORE_SECTION_TAB_MAP[editingSection.id].tab);
                  }}
                  className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Open Editor <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Section ID</label>
                  <input
                    {...register("id", { required: "ID is required" })}
                    disabled={!!editingSection}
                    className="w-full font-mono rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                    placeholder="e.g., volunteer, awards"
                  />
                  {errors.id && <p className="text-xs text-red-400">{errors.id.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Display Order</label>
                  <input
                    type="number"
                    {...register("display_order", { required: true, valueAsNumber: true })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Eyebrow / Header Title</label>
                <input
                  {...register("title", { required: "Title is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Volunteer Work"
                />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Subtitle / Heading Tagline</label>
                <input
                  {...register("subtitle")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Community initiatives and hackathon mentorship"
                />
              </div>

              {/* Content textarea for custom sections */}
              {(!editingSection || !CORE_SECTION_TAB_MAP[editingSection.id]) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Section Content (Text / Paragraphs)</label>
                  <textarea
                    {...register("content")}
                    rows={5}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Add details, bullet points, or paragraphs for this section..."
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This content will automatically render on your public portfolio page.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_visible"
                  {...register("is_visible")}
                  className="rounded border-white/10 bg-white/[0.03] text-primary focus:ring-primary/60"
                />
                <label htmlFor="is_visible" className="text-xs font-medium cursor-pointer">
                  Visible on Public Portfolio
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-border/60">
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
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
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
