import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/supabase-helpers";
import { VideoUploadWidget, VideoData } from "@/components/cms/VideoUploadWidget";
import { useAuth } from "@/contexts/AuthContext";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

export default function CategoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isViewer = role === "viewer";
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { confirmLeave } = useUnsavedChanges(isDirty);

  const markDirty = () => setIsDirty(true);
  const resetDirty = () => setIsDirty(false);

  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          toast.error("Failed to load category");
          navigate("/cms/categories");
          return;
        }

        if (data) {
          setName(data.name);
          setDescription(data.description || "");
          setVideoData(data.video_data as unknown as VideoData || null);
        }
        setLoading(false);
      };
      fetchCategory();
    }
  }, [id, navigate]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    const categoryData = {
      name,
      slug: slugify(name),
      description: description || null,
      video_data: videoData as any,
    };

    try {
      if (id) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", id);
        if (error) throw error;
        toast.success("Category updated");
      } else {
        const { error } = await supabase
          .from("categories")
          .insert(categoryData);
        if (error) throw error;
        toast.success("Category created");
      }
      resetDirty();
      navigate("/cms/categories");
    } catch (error: any) {
      toast.error(error.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cms/categories")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {id ? "Edit Category" : "New Category"}
          </h1>
        </div>
        {!isViewer && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Category
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); markDirty(); }}
                placeholder="Enter category name"
                disabled={isViewer}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => { setDescription(e.target.value); markDirty(); }}
                placeholder="Brief description"
                disabled={isViewer}
              />
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Video Content</h2>
            <VideoUploadWidget 
              videoData={videoData || undefined} 
              onChange={(data) => { setVideoData(data); markDirty(); }} 
              disabled={isViewer} 
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Status</h2>
            <p className="text-sm text-muted-foreground">
              {id ? "Updating an existing category." : "Creating a new category section."}
            </p>
            <div className="pt-4 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/cms/categories")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
