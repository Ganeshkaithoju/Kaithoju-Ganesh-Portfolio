import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Loader2, Save, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: number;
  title: string;
  description: string;
  icon_name: string | null;
  display_order: number;
  is_visible: boolean;
}

export function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Omit<Service, "id">>();

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(service?: Service) {
    if (service) {
      setEditingService(service);
      reset({
        title: service.title,
        description: service.description,
        icon_name: service.icon_name || "",
        display_order: service.display_order,
        is_visible: service.is_visible
      });
    } else {
      setEditingService(null);
      reset({
        title: "",
        description: "",
        icon_name: "Globe",
        display_order: services.length > 0 ? Math.max(...services.map(s => s.display_order)) + 1 : 1,
        is_visible: true
      });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingService(null);
    reset();
  }

  async function onSubmit(data: Omit<Service, "id">) {
    try {
      const formattedData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(formattedData)
          .eq('id', editingService.id);
        if (error) throw error;
        toast.success("Service updated successfully");
      } else {
        const { error } = await supabase
          .from('services')
          .insert([formattedData]);
        if (error) throw error;
        toast.success("Service added successfully");
      }
      closeModal();
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    }
  }

  async function deleteService(id: number) {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      toast.success("Service deleted");
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    }
  }

  async function toggleVisibility(id: number, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Service ${!currentVisibility ? "is now visible" : "hidden"} successfully`);
      fetchServices();
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
          <h2 className="text-xl font-display font-semibold">Services Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage the services you offer.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div 
            key={service.id} 
            className={`card-premium p-5 flex flex-col justify-between gap-4 transition-all ${!service.is_visible ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <h3 className="font-semibold text-lg leading-tight">{service.title}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground pl-6 line-clamp-3">{service.description}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <div className="text-xs text-muted-foreground">Order: {service.display_order}</div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleVisibility(service.id, service.is_visible)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                  title={service.is_visible ? "Hide" : "Show"}
                >
                  <div className={`h-2.5 w-2.5 rounded-full ${service.is_visible ? 'bg-green-500' : 'bg-gray-500'}`} />
                </button>
                <button
                  onClick={() => openModal(service)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteService(service.id)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="col-span-full card-premium p-12 text-center text-muted-foreground">
            <p>No services found. Add your first service to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-2">
              <h3 className="text-lg font-semibold">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Title</label>
                <input
                  {...register("title", { required: "Title is required" })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Frontend Development"
                />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...register("description", { required: "Description is required" })}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Brief description of the service..."
                />
                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon Name (Lucide)</label>
                  <input
                    {...register("icon_name")}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Globe"
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
