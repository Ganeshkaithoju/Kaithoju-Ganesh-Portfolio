import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Edit2, Trash2, Loader2, Save, X, GripVertical, Image as ImageIcon, Video, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: number;
  title: string;
  tag: string;
  description: string;
  tech: string[];
  icon_name: string | null;
  accent_class: string | null;
  is_embedded: boolean;
  image_url: string | null;
  media_type: 'image' | 'video';
  display_order: number;
  is_visible: boolean;
  featured: boolean;
}

interface ProjectFormData extends Omit<Project, 'id' | 'tech'> {
  tech: { value: string }[];
}

export function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProjectFormData>();

  const { fields: techFields, append: appendTech, remove: removeTech } = useFieldArray({
    control,
    name: "tech"
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const watchImageUrl = watch("image_url");
  const watchMediaType = watch("media_type");

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(project?: Project) {
    if (project) {
      setEditingProject(project);
      reset({
        title: project.title,
        tag: project.tag || "",
        description: project.description || "",
        tech: project.tech ? project.tech.map(t => ({ value: t })) : [],
        icon_name: project.icon_name || "",
        accent_class: project.accent_class || "",
        is_embedded: project.is_embedded,
        image_url: project.image_url || "",
        media_type: project.media_type || "image",
        display_order: project.display_order,
        is_visible: project.is_visible,
        featured: project.featured
      });
    } else {
      setEditingProject(null);
      reset({
        title: "",
        tag: "",
        description: "",
        tech: [],
        icon_name: "Folder",
        accent_class: "from-blue-500 to-cyan-400",
        is_embedded: false,
        image_url: "",
        media_type: "image",
        display_order: projects.length > 0 ? Math.max(...projects.map(p => p.display_order)) + 1 : 1,
        is_visible: true,
        featured: false
      });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProject(null);
    reset();
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      if (watchMediaType === 'video' && !['mp4', 'webm'].includes(fileExt || '')) {
        toast.error("Invalid video format. Please upload .mp4 or .webm");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Supabase limits files to 50MB. Please use the Media Library tab to optimize it below 50MB.`);
        return;
      }
      
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      setUploadingImage(true);

      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);

      setValue('image_url', data.publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function onSubmit(data: ProjectFormData) {
    try {
      const formattedData = {
        ...data,
        tech: data.tech.map(t => t.value).filter(t => t.trim() !== ""),
        updated_at: new Date().toISOString()
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(formattedData)
          .eq('id', editingProject.id);
        if (error) throw error;
        toast.success("Project updated successfully");
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([formattedData]);
        if (error) throw error;
        toast.success("Project added successfully");
      }
      closeModal();
      fetchProjects();
    } catch (error: any) {
      console.error("Error saving project:", error);
      toast.error(error.message || "Failed to save project");
    }
  }

  async function deleteProject(id: number) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      toast.success("Project deleted");
      fetchProjects();
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error(error.message || "Failed to delete project");
    }
  }

  async function toggleVisibility(id: number, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Project ${!currentVisibility ? "is now visible" : "hidden"} successfully`);
      fetchProjects();
    } catch (error: any) {
      console.error("Error toggling visibility:", error);
      toast.error(error.message || "Failed to update visibility");
    }
  }
  
  async function toggleFeatured(id: number, currentFeatured: boolean) {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ featured: !currentFeatured })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Project ${!currentFeatured ? "marked as featured" : "unmarked as featured"}`);
      fetchProjects();
    } catch (error: any) {
      console.error("Error toggling featured:", error);
      toast.error(error.message || "Failed to update featured status");
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
          <h2 className="text-xl font-display font-semibold">Projects Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your portfolio projects and case studies.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className={`card-premium p-5 flex flex-col transition-all ${!project.is_visible ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <h3 className="font-semibold leading-tight line-clamp-1" title={project.title}>
                  {project.title}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                {project.featured && <span title="Featured Project"><Star className="h-4 w-4 text-primary fill-primary" /></span>}
                {!project.is_visible && <div className="h-2 w-2 rounded-full bg-red-500" title="Hidden" />}
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-4">
              {project.tech?.slice(0, 3).map((t, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                  {t}
                </span>
              ))}
              {project.tech?.length > 3 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                  +{project.tech.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <div className="text-xs text-muted-foreground">Order: {project.display_order}</div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleFeatured(project.id, project.featured)}
                  className={`rounded p-1.5 transition-colors ${project.featured ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-white/10'}`}
                  title={project.featured ? "Unfeature" : "Feature"}
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleVisibility(project.id, project.is_visible)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                  title={project.is_visible ? "Hide project" : "Show project"}
                >
                  <div className={`h-2.5 w-2.5 rounded-full ${project.is_visible ? 'bg-green-500' : 'bg-gray-500'}`} />
                </button>
                <button
                  onClick={() => openModal(project)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full card-premium p-12 text-center text-muted-foreground">
            <p>No projects found. Add your first project to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-border/60 bg-card p-6 shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto scrollbar-none">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-card z-10 pb-2 border-b border-border/60">
              <h3 className="text-lg font-semibold">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    {...register("title", { required: "Title is required" })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category Tag</label>
                  <input
                    {...register("tag")}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., Full Stack, IoT"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...register("description", { required: "Description is required" })}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Technologies</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {techFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-sm">
                      <input
                        {...register(`tech.${index}.value` as const, { required: true })}
                        className="bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-24 text-sm"
                        placeholder="React..."
                      />
                      <button
                        type="button"
                        onClick={() => removeTech(index)}
                        className="text-muted-foreground hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendTech({ value: "" })}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/20 px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add Tech
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon Name (Lucide)</label>
                  <input
                    {...register("icon_name")}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Folder"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Accent Class</label>
                  <input
                    {...register("accent_class")}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="from-blue-500 to-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Project Media</label>
                  <select
                    {...register("media_type")}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="flex items-start gap-4">
                  {watchImageUrl ? (
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                      {watchMediaType === 'video' ? (
                        <div className="flex flex-col items-center">
                          <Video className="h-6 w-6 text-primary mb-1" />
                          <span className="text-[10px]">Video Uploaded</span>
                        </div>
                      ) : (
                        <img src={watchImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => setValue('image_url', '')}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-20 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-muted-foreground bg-white/[0.02]">
                      {watchMediaType === 'video' ? <Video className="h-6 w-6 mb-1 opacity-50" /> : <ImageIcon className="h-6 w-6 mb-1 opacity-50" />}
                      <span className="text-[10px]">No {watchMediaType}</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <input
                      type="file"
                      accept={watchMediaType === 'video' ? "video/mp4,video/webm" : "image/*"}
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium transition-all hover:bg-white/10 disabled:opacity-50"
                      >
                        {uploadingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : (watchMediaType === 'video' ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />)}
                        Upload {watchMediaType === 'video' ? 'Video' : 'Image'}
                      </button>
                      
                      <input
                        {...register("image_url")}
                        className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder={`Or paste ${watchMediaType} URL directly`}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Uploads to portfolio-assets bucket</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Display Order</label>
                  <input
                    type="number"
                    {...register("display_order", { required: true, valueAsNumber: true })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                
                <div className="col-span-2 flex flex-col justify-center space-y-3 pl-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_visible"
                      {...register("is_visible")}
                      className="rounded border-white/10 bg-white/[0.03] text-primary focus:ring-primary/60"
                    />
                    <label htmlFor="is_visible" className="text-sm font-medium">Visible to public</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      {...register("featured")}
                      className="rounded border-white/10 bg-white/[0.03] text-primary focus:ring-primary/60"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-primary">Featured Project</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_embedded"
                      {...register("is_embedded")}
                      className="rounded border-white/10 bg-white/[0.03] text-primary focus:ring-primary/60"
                    />
                    <label htmlFor="is_embedded" className="text-sm font-medium">Is Embedded Hardware</label>
                  </div>
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
                  disabled={isSubmitting || uploadingImage}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
