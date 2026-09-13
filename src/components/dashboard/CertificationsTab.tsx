import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Loader2, Save, X, GripVertical, Image as ImageIcon, Video, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Certification {
  id: number;
  title: string;
  platform: string;
  date: string | null;
  url: string | null;
  icon_name: string | null;
  image_url: string | null;
  media_type: 'image' | 'video';
  display_order: number;
  is_visible: boolean;
}

export function CertificationsTab() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<Omit<Certification, "id">>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const watchImageUrl = watch("image_url");
  const watchMediaType = watch("media_type");

  useEffect(() => {
    fetchCertifications();
  }, []);

  async function fetchCertifications() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setCertifications(data || []);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      toast.error("Failed to load certifications");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(cert?: Certification) {
    if (cert) {
      setEditingCert(cert);
      reset({
        title: cert.title,
        platform: cert.platform,
        date: cert.date || "",
        url: cert.url || "",
        icon_name: cert.icon_name || "",
        image_url: cert.image_url || "",
        media_type: cert.media_type || "image",
        display_order: cert.display_order,
        is_visible: cert.is_visible
      });
    } else {
      setEditingCert(null);
      reset({
        title: "",
        platform: "",
        date: "",
        url: "",
        icon_name: "Award",
        image_url: "",
        media_type: "image",
        display_order: certifications.length > 0 ? Math.max(...certifications.map(c => c.display_order)) + 1 : 1,
        is_visible: true
      });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingCert(null);
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
      
      const fileName = `cert_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `certifications/${fileName}`;

      setUploadingImage(true);

      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);

      setValue('image_url', data.publicUrl);
      toast.success("Certificate image uploaded successfully");
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

  async function onSubmit(data: Omit<Certification, "id">) {
    try {
      const formattedData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      if (editingCert) {
        const { error } = await supabase
          .from('certifications')
          .update(formattedData)
          .eq('id', editingCert.id);
        if (error) throw error;
        toast.success("Certification updated successfully");
      } else {
        const { error } = await supabase
          .from('certifications')
          .insert([formattedData]);
        if (error) throw error;
        toast.success("Certification added successfully");
      }
      closeModal();
      fetchCertifications();
    } catch (error: any) {
      console.error("Error saving certification:", error);
      toast.error(error.message || "Failed to save certification");
    }
  }

  async function deleteCertification(id: number) {
    if (!confirm("Are you sure you want to delete this certification?")) return;
    
    try {
      const { error } = await supabase.from('certifications').delete().eq('id', id);
      if (error) throw error;
      toast.success("Certification deleted");
      fetchCertifications();
    } catch (error: any) {
      console.error("Error deleting certification:", error);
      toast.error(error.message || "Failed to delete certification");
    }
  }

  async function toggleVisibility(id: number, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('certifications')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Certification ${!currentVisibility ? "is now visible" : "hidden"} successfully`);
      fetchCertifications();
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
          <h2 className="text-xl font-display font-semibold">Certifications Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your certificates, licenses, and professional credentials.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Certification
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert) => (
          <div 
            key={cert.id} 
            className={`card-premium overflow-hidden flex flex-col transition-all ${!cert.is_visible ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}
          >
            {cert.image_url && (
              <div className="h-32 w-full border-b border-border/60 bg-black/40 relative">
                <img 
                  src={cert.image_url} 
                  alt={cert.title} 
                  className="w-full h-full object-contain p-2"
                />
              </div>
            )}
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move flex-shrink-0" />
                  <h3 className="font-semibold leading-tight line-clamp-2" title={cert.title}>
                    {cert.title}
                  </h3>
                </div>
              </div>
              
              <div className="space-y-1 mb-4 flex-1">
                <div className="text-sm text-muted-foreground">{cert.platform}</div>
                {cert.date && <div className="text-xs font-medium text-primary">{cert.date}</div>}
                
                {cert.url && (
                  <a 
                    href={cert.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
                  >
                    <ExternalLink className="h-3 w-3" /> Verify Credential
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <div className="text-xs text-muted-foreground">Order: {cert.display_order}</div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleVisibility(cert.id, cert.is_visible)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                    title={cert.is_visible ? "Hide" : "Show"}
                  >
                    <div className={`h-2.5 w-2.5 rounded-full ${cert.is_visible ? 'bg-green-500' : 'bg-gray-500'}`} />
                  </button>
                  <button
                    onClick={() => openModal(cert)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCertification(cert.id)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {certifications.length === 0 && (
          <div className="col-span-full card-premium p-12 text-center text-muted-foreground">
            <p>No certifications found. Add your first certification to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-border/60 bg-card p-6 shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto scrollbar-none">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-card z-10 pb-2 border-b border-border/60">
              <h3 className="text-lg font-semibold">{editingCert ? 'Edit Certification' : 'Add New Certification'}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Certification Name</label>
                  <input
                    {...register("title", { required: "Name is required" })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., AWS Certified Solutions Architect"
                  />
                  {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Issuing Organization</label>
                  <input
                    {...register("platform", { required: "Platform/Issuer is required" })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., Amazon Web Services"
                  />
                  {errors.platform && <p className="text-xs text-red-400">{errors.platform.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date / Validity</label>
                  <input
                    {...register("date")}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., Issued Jun 2023 · Expires Jun 2026"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Credential URL</label>
                  <input
                    {...register("url")}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="https://www.credly.com/badges/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Certificate Media (Optional)</label>
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
                    <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                      {watchMediaType === 'video' ? (
                        <div className="flex flex-col items-center">
                          <Video className="h-6 w-6 text-primary mb-1" />
                          <span className="text-[10px]">Video Uploaded</span>
                        </div>
                      ) : (
                        <img src={watchImageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
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
                    <div className="w-32 h-24 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-muted-foreground bg-white/[0.02]">
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
                        placeholder={`Or paste ${watchMediaType} URL`}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Uploads to portfolio-assets bucket</p>
                  </div>
                </div>
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
                  Save Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
