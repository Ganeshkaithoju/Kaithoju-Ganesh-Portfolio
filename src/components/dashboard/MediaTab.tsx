import { useState, useEffect, useRef } from "react";
import { Trash2, Loader2, Upload, FileImage, File, ExternalLink, Copy, Check, AlertCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export function MediaTab() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  // Video Processing State
  const [videoToProcess, setVideoToProcess] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processOptions, setProcessOptions] = useState({ removeAudio: true, compress: false });
  const [processedFile, setProcessedFile] = useState<{file: File, originalSize: number} | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    try {
      setIsLoading(true);
      const foldersToScan = ['', 'projects', 'certifications', 'achievements', 'experience', 'education', 'services', 'uploads', 'resume'];
      let allFiles: StorageFile[] = [];

      for (const folder of foldersToScan) {
        const { data, error } = await supabase.storage
          .from('portfolio-assets')
          .list(folder, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
          });

        if (error) throw error;
        
        if (data) {
          const validFiles = data
            .filter(f => f.name !== '.emptyFolderPlaceholder' && f.id !== null && f.metadata !== null)
            .map(f => ({
              ...f,
              name: folder ? `${folder}/${f.name}` : f.name
            }));
          allFiles = [...allFiles, ...validFiles as unknown as StorageFile[]];
        }
      }

      // Sort all files by created_at descending
      allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setFiles(allFiles);
    } catch (error: any) {
      console.error("Error fetching files:", error);
      toast.error(error.message || "Failed to load media files");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      // Allow videos up to 100MB to be processed locally by FFmpeg
      if (isVideo && file.size > 100 * 1024 * 1024) {
        toast.error("Video exceeds 100MB. Please pre-compress using Clipchamp or HandBrake before uploading.");
        return;
      }
      
      if (isImage && file.size > 10 * 1024 * 1024) {
        toast.error("Image file size must be less than 10MB.");
        return;
      }

      if (isVideo) {
        // Automatically ensure compression is enabled if file is > 50MB
        setProcessOptions(prev => ({
          ...prev,
          compress: true
        }));
        setVideoToProcess(file);
        setProcessedFile(null);
      } else {
        await executeUpload(file);
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
    
    ffmpeg.on('progress', ({ progress, time }) => {
      setProcessingProgress(Math.round(progress * 100));
    });
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    return ffmpeg;
  };

  async function processVideo() {
    if (!videoToProcess) return;
    
    try {
      setIsProcessing(true);
      setProcessingProgress(0);
      toast.loading("Initializing video processor...", { id: "video-process" });
      
      const ffmpeg = await loadFFmpeg();
      toast.loading("Optimizing video in browser...", { id: "video-process" });
      
      const inputName = 'input' + (videoToProcess.name.match(/\.[^.]+$/)?.[0] || '.mp4');
      const outputName = 'output.mp4';
      
      await ffmpeg.writeFile(inputName, await fetchFile(videoToProcess));
      
      const args = ['-i', inputName];
      
      if (processOptions.removeAudio) {
        args.push('-an'); // Remove audio
      }
      
      // If the file is > 50MB, compression is strictly enforced
      const shouldCompress = processOptions.compress || videoToProcess.size > 50 * 1024 * 1024;
      
      if (shouldCompress) {
        // High quality web compression: H.264, max 1080p width, CRF 28, fast preset, yuv420p for universal browser playback
        args.push(
          '-vcodec', 'libx264',
          '-crf', '28',
          '-preset', 'fast',
          '-vf', "scale='min(1920,iw)':-2",
          '-pix_fmt', 'yuv420p'
        );
      } else {
        args.push('-c:v', 'copy'); // Copy video stream (super fast)
      }
      
      args.push(outputName);
      
      await ffmpeg.exec(args);
      
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as any], { type: 'video/mp4' });
      
      const fileExt = videoToProcess.name.split('.').pop() || 'mp4';
      const baseName = videoToProcess.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9]/g, '_');
      const finalName = `${baseName}_optimized.mp4`;
      
      const newFile = new (window as any).File([blob], finalName, { type: 'video/mp4' });
      
      setProcessedFile({
        file: newFile,
        originalSize: videoToProcess.size
      });

      if (newFile.size > 50 * 1024 * 1024) {
        toast.warning(`Video processed, but size (${formatBytes(newFile.size)}) still exceeds Supabase's 50MB limit. Remove audio or pre-compress with Clipchamp/HandBrake.`, { id: "video-process", duration: 6000 });
      } else {
        toast.success("Optimization complete! Ready to upload.", { id: "video-process" });
      }
      
    } catch (error) {
      console.error("FFmpeg error:", error);
      toast.error("Failed to process video. Consider compressing with Clipchamp or HandBrake.", { id: "video-process" });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }

  async function executeUpload(file: File) {
    try {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File size (${formatBytes(file.size)}) exceeds Supabase's 50MB storage limit. Please optimize or compress it further.`);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const baseName = file.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${baseName}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      setIsUploading(true);
      toast.loading("Uploading file...", { id: "media-upload" });

      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('exceeded')) {
           throw new Error("File exceeded maximum allowed size configured on server (50MB).");
        }
        throw uploadError;
      }

      toast.success("File uploaded successfully", { id: "media-upload" });
      setVideoToProcess(null);
      setProcessedFile(null);
      fetchFiles();
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Failed to upload file", { id: "media-upload" });
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteFile(filePath: string) {
    if (!confirm("Are you sure you want to delete this file? This might break images currently used on the site.")) return;
    
    try {
      const { error } = await supabase.storage
        .from('portfolio-assets')
        .remove([filePath]);
        
      if (error) throw error;
      
      toast.success("File deleted");
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
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

  function getPublicUrl(path: string) {
    const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(path);
    return data.publicUrl;
  }

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedUrl(null), 2000);
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
      {videoToProcess && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background border border-border/60 rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
              {isProcessing && (
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${processingProgress}%` }}
                />
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-display font-semibold">Video Optimization</h3>
              <p className="text-sm text-muted-foreground mt-1">Process your video locally before uploading.</p>
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg text-sm space-y-2 border border-white/10">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original File:</span>
                <span className="font-medium truncate max-w-[200px]" title={videoToProcess.name}>{videoToProcess.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Size:</span>
                <span className="font-medium">{formatBytes(videoToProcess.size)}</span>
              </div>
              
              {processedFile && (
                <>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between text-primary">
                    <span>Processed Size:</span>
                    <span className="font-medium">{formatBytes(processedFile.file.size)}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Space Saved:</span>
                    <span className="font-medium">
                      {Math.round(((processedFile.originalSize - processedFile.file.size) / processedFile.originalSize) * 100)}%
                    </span>
                  </div>

                  {processedFile.file.size > 50 * 1024 * 1024 ? (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 space-y-1 mt-2">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" /> Exceeds Supabase 50MB Limit
                      </div>
                      <p>
                        Optimized size is <strong>{formatBytes(processedFile.file.size)}</strong>. Supabase blocks uploads larger than 50MB. Click "Change Settings" below to remove audio, or pre-compress with Clipchamp/HandBrake.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 mt-2">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Optimized under 50MB! 100% ready for Supabase upload.</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {!processedFile && (
              <div className="space-y-3">
                {videoToProcess.size > 50 * 1024 * 1024 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>This video is {formatBytes(videoToProcess.size)}. Compression is required to fit within Supabase's 50MB upload limit.</span>
                  </div>
                )}

                <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={processOptions.removeAudio}
                    onChange={(e) => setProcessOptions(prev => ({...prev, removeAudio: e.target.checked}))}
                    className="rounded border-white/20 bg-black/50 text-primary focus:ring-primary/50"
                  />
                  <div>
                    <div className="text-sm font-medium">Remove Audio Track</div>
                    <div className="text-xs text-muted-foreground">Significantly reduces file size for portfolio background & demo videos.</div>
                  </div>
                </label>
                
                <label className={`flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 transition-colors ${videoToProcess.size > 50 * 1024 * 1024 ? 'opacity-90' : 'cursor-pointer hover:bg-white/10'}`}>
                  <input 
                    type="checkbox" 
                    checked={videoToProcess.size > 50 * 1024 * 1024 ? true : processOptions.compress}
                    disabled={videoToProcess.size > 50 * 1024 * 1024}
                    onChange={(e) => setProcessOptions(prev => ({...prev, compress: e.target.checked}))}
                    className="rounded border-white/20 bg-black/50 text-primary focus:ring-primary/50"
                  />
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      Compress & Scale Video
                      {videoToProcess.size > 50 * 1024 * 1024 && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">Required (&gt;50MB)</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Re-encodes with H.264 & web optimization to reduce size.</div>
                  </div>
                </label>
              </div>
            )}
            
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setVideoToProcess(null);
                  setProcessedFile(null);
                }}
                disabled={isProcessing || isUploading}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              {!processedFile ? (
                <button
                  onClick={processVideo}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isProcessing ? 'Optimizing Video...' : 'Optimize Video'}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setProcessedFile(null)}
                    disabled={isUploading}
                    className="px-3 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-50"
                  >
                    Change Settings
                  </button>
                  <button
                    onClick={() => executeUpload(processedFile.file)}
                    disabled={isUploading || processedFile.file.size > 50 * 1024 * 1024}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isUploading ? 'Uploading...' : processedFile.file.size > 50 * 1024 * 1024 ? 'Exceeds 50MB Limit' : 'Upload Processed Video'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold">Media Library</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage images and assets uploaded to your portfolio.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple={false}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {isUploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {files.map((file) => {
          const publicUrl = getPublicUrl(file.name);
          const isImage = file.metadata?.mimetype?.startsWith('image/');
          const isVideo = file.metadata?.mimetype?.startsWith('video/');
          const isCopied = copiedUrl === publicUrl;
          
          return (
            <div key={file.id} className="card-premium overflow-hidden group flex flex-col">
              <div className="aspect-video w-full bg-black/40 relative flex items-center justify-center border-b border-border/60 overflow-hidden">
                {isImage ? (
                  <img 
                    src={publicUrl} 
                    alt={file.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : isVideo ? (
                  <video 
                    src={publicUrl} 
                    className="w-full h-full object-cover" 
                    muted 
                    playsInline 
                  />
                ) : (
                  <File className="h-10 w-10 text-muted-foreground opacity-50" />
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  <button
                    onClick={() => copyToClipboard(publicUrl)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Copy URL"
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => deleteFile(file.name)}
                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-200 transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-3 flex-1 flex flex-col">
                <div className="text-sm font-medium truncate mb-1" title={file.name}>
                  {file.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-auto">
                  <span>{file.metadata ? formatBytes(file.metadata.size) : 'Unknown size'}</span>
                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
        {files.length === 0 && (
          <div className="col-span-full card-premium p-12 text-center text-muted-foreground">
            <div className="flex flex-col items-center justify-center">
              <FileImage className="h-12 w-12 opacity-20 mb-4" />
              <p>No media files found in the storage bucket.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Upload your first image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
