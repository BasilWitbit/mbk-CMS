import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, CheckCircle, CheckSquare, Square } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMedia } from "@/contexts/MediaContext";
import { uploadMedia } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

export default function MediaLibrary() {
  const { role } = useAuth();
  const isViewer = role === "viewer";
  const { media, addMedia, deleteMedia, loading } = useMedia();
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const url = await uploadMedia(file);
      if (url) addMedia({ name: file.name, url });
    }
    toast.success(`${files.length} file(s) uploaded`);
    e.target.value = "";
    setUploading(false);
  };

  const toggleSelect = (url: string) => {
    setSelectedFiles((prev) => {
      if (isViewer) return prev;
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const toggleAll = () => {
    if (isViewer) return;
    if (selectedFiles.size === media.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(media.map((f) => f.url)));
    }
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)?`)) return;
    for (const url of selectedFiles) {
      await deleteMedia(url);
    }
    toast.success(`${selectedFiles.size} file(s) deleted`);
    setSelectedFiles(new Set());
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
          {media.length > 0 && !isViewer && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card">
              <Checkbox 
                checked={selectedFiles.size === media.length && media.length > 0} 
                onCheckedChange={toggleAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All
              </label>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedFiles.size > 0 && !isViewer && (
            <Button variant="destructive" size="sm" onClick={deleteSelected} className="animate-in fade-in zoom-in duration-200">
              <Trash2 className="h-4 w-4 mr-1" /> Delete ({selectedFiles.size})
            </Button>
          )}
          {!isViewer && (
            <label>
              <Button asChild size="sm" disabled={uploading}>
                <span><Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload Files"}</span>
              </Button>
              <Input type="file" accept="image/*,video/*,image/svg+xml,image/gif" multiple onChange={handleUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>
      {!isViewer && <p className="text-sm text-muted-foreground mb-4">Click an image or its checkbox to select. Total files: {media.length}</p>}
      {media.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No media files. Upload some to get started.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((file) => {
            const isSelected = selectedFiles.has(file.url);
            return (
               <button
                key={file.url}
                onClick={() => toggleSelect(file.url)}
                className={`group relative rounded-lg border-2 overflow-hidden bg-card text-left transition-all ${
                  isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <div className="relative">
                  <img src={file.url} alt={file.name} className="w-full h-32 object-cover" />
                  <div className={`absolute top-2 left-2 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <Checkbox checked={isSelected} onCheckedChange={() => {}} className="bg-white/90 data-[state=checked]:bg-primary" />
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                  )}
                </div>
                <div className="p-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground truncate font-medium">{file.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
