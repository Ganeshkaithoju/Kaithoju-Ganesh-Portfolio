import { useState, useEffect, useRef } from "react";
import { FileText, Loader2, Upload, Trash2, Eye, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function ResumeTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeInfo, setResumeInfo] = useState<{ name: string; size: number; updated_at: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchResume();
  }, []);

  async function fetchResume() {
    try {
      setIsLoading(true);
      // Fetch the site settings resume url
      const { data, error } = await supabase
        .from('site_settings')
        .select('resume_url')
        .eq('id', true)
        .single();
        
      if (error) throw error;
      
      if (data?.resume_url) {
        setResumeUrl(data.resume_url);
        // Try to fetch file metadata if it's stored in our bucket
        if (data.resume_url.includes('portfolio-assets/resume/')) {
          const urlParts = data.resume_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          // We can't directly list a specific file easily, but we can list the folder
          const { data: files } = await supabase.storage.from('portfolio-assets').list('resume');
          const file = files?.find(f => f.name === fileName);
          if (file) {
            setResumeInfo({
              name: file.name,
              size: file.metadata?.size || 0,
              updated_at: file.updated_at
            });
          } else {
            // Fallback if metadata not found
            setResumeInfo({
              name: fileName,
              size: 0,
              updated_at: new Date().toISOString()
            });
          }
        } else {
          // External URL or different bucket
          setResumeInfo({
            name: "External Resume",
            size: 0,
            updated_at: new Date().toISOString()
          });
        }
      } else {
        setResumeUrl(null);
        setResumeInfo(null);
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
      toast.error("Failed to load resume information");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      if (!['pdf', 'doc', 'docx'].includes(fileExt || '')) {
        toast.error("Please upload a PDF or DOC/DOCX file.");
        return;
      }
      
      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        return;
      }
      
      setIsUploading(true);
      toast.loading("Uploading resume...", { id: "resume-upload" });
      
      const fileName = `Ganesh_Kaithoju_Resume_${Date.now()}.${fileExt}`;
      const filePath = `resume/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);

      // Update site_settings
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ resume_url: data.publicUrl })
        .eq('id', true);
        
      if (updateError) throw updateError;

      toast.success("Resume uploaded successfully", { id: "resume-upload" });
      fetchResume();
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Failed to upload resume", { id: "resume-upload" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to remove your resume? It will no longer be available for download on the public site.")) {
      return;
    }
    
    try {
      setIsLoading(true);
      // Remove from site settings
      const { error } = await supabase
        .from('site_settings')
        .update({ resume_url: null })
        .eq('id', true);
        
      if (error) throw error;
      
      setResumeUrl(null);
      setResumeInfo(null);
      toast.success("Resume removed successfully");
      
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to remove resume");
    } finally {
      setIsLoading(false);
    }
  }

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  if (isLoading && !resumeUrl) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-display font-semibold">Resume Management</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and manage your primary resume. This will be the single source of truth for all "Download Resume" buttons on the public portfolio.
        </p>
      </div>

      <div className="card-premium p-6 sm:p-8">
        {!resumeUrl ? (
          <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/5 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Resume Uploaded</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              You haven't uploaded a resume yet. Upload a PDF or DOC file (max 5MB) to make it available on your portfolio.
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isUploading ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">
                Your resume is currently live and available for download on your public portfolio.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-xl border border-white/10 bg-white/[0.02] items-start sm:items-center">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-8 w-8" />
              </div>
              
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-lg">{resumeInfo?.name || "Active Resume"}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {resumeInfo?.size ? <span>{formatBytes(resumeInfo.size)}</span> : null}
                  {resumeInfo?.updated_at && (
                    <span>Updated: {new Date(resumeInfo.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <a 
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-white/10 border border-white/5 px-4 py-2 text-sm font-medium transition-all hover:bg-white/20"
                >
                  <Eye className="h-4 w-4" /> Preview
                </a>
                <a 
                  href={resumeUrl}
                  download
                  className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-white/10 border border-white/5 px-4 py-2 text-sm font-medium transition-all hover:bg-white/20"
                >
                  <Download className="h-4 w-4" /> Download
                </a>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isUploading ? "Uploading..." : "Replace Resume"}
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 text-red-400 px-4 py-2 text-sm font-medium transition-all hover:bg-red-500/20 disabled:opacity-50 ml-auto"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
