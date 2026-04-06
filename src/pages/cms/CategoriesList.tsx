import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";
import { VideoUploadWidget, VideoData } from "@/components/cms/VideoUploadWidget";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  video_data: VideoData | null;
  created_at: string;
}

export default function CategoriesList() {
  const { role } = useAuth();
  const isViewer = role === "viewer";
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("created_at");
    if (error) { toast.error("Failed to load categories"); return; }
    setCategories((data as unknown as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openDialog = (cat?: Category) => {
    if (cat) { setEditId(cat.id); setName(cat.name); setDescription(cat.description || ""); setVideoData(cat.video_data); }
    else { setEditId(null); setName(""); setDescription(""); setVideoData(null); }
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditId(null); setName(""); setDescription(""); setVideoData(null); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (editId) {
        const { error } = await supabase.from("categories").update({ name, slug: slugify(name), description: description || null, video_data: videoData as any }).eq("id", editId);
        if (error) throw error;
        toast.success("Category updated");
      } else {
        const { error } = await supabase.from("categories").insert({ name, slug: slugify(name), description: description || null, video_data: videoData as any });
        if (error) throw error;
        toast.success("Category created");
      }
      closeDialog();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setCategories(categories.filter((c) => c.id !== id));
    toast.success("Category deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        {!isViewer && <Button onClick={() => openDialog()}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No categories</TableCell></TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.description || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost-icon" size="icon" className="h-8 w-8" onClick={() => openDialog(cat)}>
                        {isViewer ? <Search className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
                      </Button>
                      {!isViewer && (
                        <Button variant="ghost-icon" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} disabled={isViewer} /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} disabled={isViewer} /></div>
            <div className="space-y-2">
              <Label>Video Content</Label>
              <VideoUploadWidget 
                videoData={videoData || undefined} 
                onChange={setVideoData} 
                disabled={isViewer} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            {!isViewer && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
