import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Save, Loader2, Plus, Trash2, Star, Tag, ChevronDown, ChevronUp, Upload, Image as ImageIcon, Sparkles, HardDrive, Bot, Brain, Cpu, Terminal, Code2, Rocket, Zap, Shield, Layers, Globe, Award } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { iconMap } from "@/hooks/usePortfolioData";

interface HeroFormData {
  hero_name: string;
  hero_subtitles: { value: string }[];
  hero_bio: string;
  // Hero Image
  card_image_url: string;
  // Structured Code Card & Badge Fields
  card_cgpa: string;
  card_now: string;
  card_role: string;
  card_focus: string;
  card_stack: string;
  card_badge_bottom: string;
  card_badge_bottom_icon: string;
  // Raw JSON fallback
  hero_code_card?: string;
}

const DEFAULT_HERO_IMAGE = "https://jdictbtlalwlmfvdddiv.supabase.co/storage/v1/object/public/portfolio-assets/uploads/ganesh_portrait.jpg";

const POPULAR_BADGE_ICONS = [
  "Bot", "Brain", "Sparkles", "Cpu", "HardDrive", "Terminal", "Code2", "Rocket", "Zap", "Shield", "Star", "Layers", "Globe", "Award"
];

export function HeroTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showAdvancedJson, setShowAdvancedJson] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<HeroFormData>({
    defaultValues: {
      hero_subtitles: [{ value: "" }],
      card_image_url: DEFAULT_HERO_IMAGE,
      card_cgpa: "8.44",
      card_now: "Intern @ Lumen — Backup & Restore",
      card_role: "Software & Full-Stack Dev",
      card_focus: "reliable · elegant · fast",
      card_stack: "React, Node, Python, Java, Spring Boot, MySQL",
      card_badge_bottom: "Gen Ai",
      card_badge_bottom_icon: "Bot",
    }
  });

  const currentImageUrl = watch("card_image_url") || DEFAULT_HERO_IMAGE;
  const currentBadgeIcon = watch("card_badge_bottom_icon") || "Bot";
  const ActiveBadgeIcon = iconMap[currentBadgeIcon] || HardDrive;
  const currentBadgeBottom = watch("card_badge_bottom") || "Gen Ai";
  const currentCgpa = watch("card_cgpa") || "8.44";

  const { fields, append, remove } = useFieldArray({
    control,
    name: "hero_subtitles"
  });

  useEffect(() => {
    fetchHeroData();
  }, []);

  async function fetchHeroData() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('hero_name, hero_subtitles, hero_bio, hero_code_card')
        .eq('id', true)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const card = (data.hero_code_card as any) || {};
        reset({
          hero_name: data.hero_name || "Kaithoju Ganesh",
          hero_bio: data.hero_bio || "",
          hero_subtitles: Array.isArray(data.hero_subtitles) && data.hero_subtitles.length > 0
            ? data.hero_subtitles.map((t: string) => ({ value: t }))
            : [{ value: "full-stack web apps" }, { value: "clean interfaces" }, { value: "reliable systems" }],
          card_image_url: card.image_url || (data as any).hero_image_url || DEFAULT_HERO_IMAGE,
          card_cgpa: card.cgpa !== undefined ? String(card.cgpa) : "8.44",
          card_now: card.now || "Intern @ Lumen — Backup & Restore",
          card_role: card.role || "Software & Full-Stack Dev",
          card_focus: card.focus || "reliable · elegant · fast",
          card_stack: Array.isArray(card.stack) ? card.stack.join(", ") : "React, Node, Python, Java, Spring Boot, MySQL",
          card_badge_bottom: card.badge_bottom || "Gen Ai",
          card_badge_bottom_icon: card.badge_bottom_icon || card.icon || "Bot",
          hero_code_card: data.hero_code_card ? JSON.stringify(data.hero_code_card, null, 2) : "{}"
        });
      }
    } catch (error) {
      console.error("Error fetching hero data:", error);
      toast.error("Failed to load hero section data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be less than 10MB");
      return;
    }

    try {
      setIsUploadingImage(true);
      toast.loading("Uploading portrait image to Supabase Storage...", { id: "hero-img-upload" });

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `hero_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: pubData } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);

      const uploadedUrl = pubData.publicUrl;
      setValue("card_image_url", uploadedUrl);
      toast.success("Portrait image uploaded successfully! Click Save to publish.", { id: "hero-img-upload" });
    } catch (error: any) {
      console.error("Error uploading hero image:", error);
      toast.error(error.message || "Failed to upload image to Supabase", { id: "hero-img-upload" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onSubmit(data: HeroFormData) {
    try {
      setIsSaving(true);
      
      let parsedCodeCard: Record<string, any> = {};

      if (showAdvancedJson && data.hero_code_card && data.hero_code_card.trim() !== "") {
        try {
          parsedCodeCard = JSON.parse(data.hero_code_card);
          if (data.card_image_url) {
            parsedCodeCard.image_url = data.card_image_url;
          }
          if (data.card_badge_bottom) {
            parsedCodeCard.badge_bottom = data.card_badge_bottom;
          }
          if (data.card_badge_bottom_icon) {
            parsedCodeCard.badge_bottom_icon = data.card_badge_bottom_icon;
          }
        } catch (e) {
          toast.error("Invalid JSON in Advanced Code Card editor");
          return;
        }
      } else {
        const parsedCgpa = parseFloat(data.card_cgpa);
        parsedCodeCard = {
          name: data.hero_name || "Kaithoju Ganesh",
          image_url: data.card_image_url || DEFAULT_HERO_IMAGE,
          now: data.card_now || "Intern @ Lumen — Backup & Restore",
          cgpa: isNaN(parsedCgpa) ? data.card_cgpa : parsedCgpa,
          role: data.card_role || "Software & Full-Stack Dev",
          focus: data.card_focus || "reliable · elegant · fast",
          stack: data.card_stack
            ? data.card_stack.split(",").map(s => s.trim()).filter(Boolean)
            : ["React", "Node", "Python", "Java", "Spring Boot", "MySQL"],
          badge_bottom: data.card_badge_bottom || "Gen Ai",
          badge_bottom_icon: data.card_badge_bottom_icon || "Bot",
          shipping: true
        };
      }

      const updateData = {
        hero_name: data.hero_name,
        hero_bio: data.hero_bio,
        hero_subtitles: data.hero_subtitles.map(s => s.value).filter(s => s.trim() !== ""),
        hero_code_card: parsedCodeCard
      };

      const { error } = await supabase
        .from('site_settings')
        .update(updateData)
        .eq('id', true);
        
      if (error) throw error;
      
      setValue("hero_code_card", JSON.stringify(parsedCodeCard, null, 2));
      toast.success("Hero section, portrait image & settings updated successfully");
    } catch (error) {
      console.error("Error updating hero data:", error);
      toast.error("Failed to update hero section");
    } finally {
      setIsSaving(false);
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
    <div className="max-w-4xl space-y-6">
      <div className="card-premium p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-display font-semibold">Hero Section & Portrait Card</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update your portrait photo, name, bio, roles, CGPA, and hero banner details stored in Supabase.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Display Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name (Hero Heading)</label>
              <input
                {...register("hero_name", { required: "Name is required" })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g., Kaithoju Ganesh"
              />
              {errors.hero_name && <p className="text-xs text-red-400">{errors.hero_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Star className="h-4 w-4 text-primary" />
                CGPA Score (Floating Badge)
              </label>
              <input
                {...register("card_cgpa", { required: "CGPA is required" })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-primary focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g., 8.44 or 9.0"
              />
            </div>
          </div>

          {/* Hero Portrait Photo Management */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Hero Portrait Image</h3>
                  <p className="text-xs text-muted-foreground">Managed in Supabase Storage with interactive hover glow on the homepage.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Preview Thumbnail */}
              <div className="relative w-36 h-44 shrink-0 rounded-xl overflow-hidden border border-white/15 bg-black/60 shadow-lg group">
                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt="Hero Preview"
                    className="w-full h-full object-cover object-top transition-all duration-300 group-hover:brightness-125"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
                {/* Floating Preview Badges */}
                <div className="absolute top-1.5 right-1.5 bg-black/85 backdrop-blur-sm border border-white/20 rounded-md px-1.5 py-0.5 text-[10px] text-primary flex items-center gap-1 font-semibold shadow">
                  <Star className="h-2.5 w-2.5 fill-primary/40" />
                  <span>{currentCgpa}</span>
                </div>
                <div className="absolute bottom-1.5 left-1.5 bg-black/85 backdrop-blur-sm border border-white/20 rounded-md px-1.5 py-0.5 text-[10px] text-foreground flex items-center gap-1 font-medium max-w-[90%] truncate shadow">
                  <ActiveBadgeIcon className="h-2.5 w-2.5 text-primary shrink-0" />
                  <span className="truncate">{currentBadgeBottom}</span>
                </div>
              </div>

              {/* Upload & URL Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Image URL (Supabase Storage)</label>
                  <input
                    {...register("card_image_url")}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-mono text-xs focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="https://...supabase.co/.../ganesh_portrait.jpg"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {isUploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : <Upload className="h-3.5 w-3.5 text-primary" />}
                    {isUploadingImage ? "Uploading to Supabase..." : "Upload New Image from PC"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue("card_image_url", DEFAULT_HERO_IMAGE)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Reset to Default
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Supported formats: JPG, PNG, WebP (up to 10MB). Uploads directly to Supabase bucket <code className="text-primary">portfolio-assets/uploads/</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Animated Subtitles */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Animated Rotating Roles / Subtitles</label>
            <p className="text-xs text-muted-foreground mb-2">These phrases cycle sequentially after "I build ...".</p>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    {...register(`hero_subtitles.${index}.value` as const, { required: true })}
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., full-stack web apps, clean interfaces"
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => append({ value: "" })}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/20 px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Subtitle
            </button>
          </div>

          {/* Bio / Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hero Bio / Introduction</label>
            <textarea
              {...register("hero_bio")}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Aspiring Software & Full-Stack Developer working with..."
            />
          </div>

          {/* Card Badges & Info Settings */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Floating Badges & Card Details</h3>
                <p className="text-xs text-muted-foreground">Controls the floating chips and metadata on your hero portrait card.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Top Status Pill ("now")</label>
                <input
                  {...register("card_now")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Intern @ Lumen — Backup & Restore"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Role Title ("role")</label>
                <input
                  {...register("card_role")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Software & Full-Stack Dev"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Focus Tagline ("focus")</label>
                <input
                  {...register("card_focus")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., reliable · elegant · fast"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Bottom Card Badge Text</label>
                <input
                  {...register("card_badge_bottom")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Gen Ai, Backup & Restore"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Bottom Card Badge Icon</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    <ActiveBadgeIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{currentBadgeIcon}</span>
                  </span>
                </label>
                <input
                  {...register("card_badge_bottom_icon")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-mono focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g., Bot, Brain, Sparkles, Cpu, HardDrive, Terminal"
                />
              </div>
            </div>

            {/* Quick Icon Selector Chips */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-medium text-muted-foreground">Quick Select Popular Icons:</label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_BADGE_ICONS.map((iconName) => {
                  const IconCmp = iconMap[iconName] || HardDrive;
                  const isSelected = currentBadgeIcon.toLowerCase() === iconName.toLowerCase();
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setValue("card_badge_bottom_icon", iconName)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary font-semibold"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/10"
                      }`}
                    >
                      <IconCmp className="h-3 w-3 shrink-0" />
                      <span>{iconName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                Tech Stack List ("stack" - Comma Separated)
              </label>
              <input
                {...register("card_stack")}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="React, Node, Python, Java, Spring Boot, MySQL"
              />
              <p className="text-[11px] text-muted-foreground">Separate technologies with commas.</p>
            </div>

            {/* Advanced JSON Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvancedJson(!showAdvancedJson)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAdvancedJson ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showAdvancedJson ? "Hide Raw JSON Editor" : "Show Advanced Raw JSON Editor"}
              </button>

              {showAdvancedJson && (
                <div className="mt-3 space-y-1.5">
                  <textarea
                    {...register("hero_code_card")}
                    rows={8}
                    className="w-full font-mono rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-xs focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={`{\n  "name": "...",\n  "role": "..."\n}`}
                  />
                  <p className="text-[11px] text-muted-foreground">Editing this directly will override the fields above if the raw editor is active.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/60">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save Hero Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
