import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentBlockEditor, ContentBlock } from "@/components/cms/ContentBlockEditor";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SEOEditor, SEOData, emptySEO } from "@/components/cms/SEOEditor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia, slugify } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

interface Category {
  id: string;
  name: string;
}

export default function PostEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const isViewer = role === "viewer";

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState("draft");
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [seo, setSeo] = useState<SEOData>(emptySEO);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { confirmLeave } = useUnsavedChanges(isDirty);

  // Mark dirty on any field change (after initial load)
  const markDirty = () => setIsDirty(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: cats } = await supabase.from("categories").select("id, name");
      if (cats) setCategories(cats);

      if (!isNew) {
        const { data: post } = await supabase.from("posts").select("*").eq("id", id).single();
        if (post) {
          setTitle(post.title);
          setExcerpt(post.excerpt || "");
          setFeaturedImage(post.featured_image || "");
          setCategoryId(post.category_id || "");
          setStatus(post.status);
          setContent(Array.isArray(post.content) ? (post.content as unknown as ContentBlock[]) : []);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id, isNew]);

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const slug = slugify(title);
    const postData = {
      title,
      slug,
      excerpt: excerpt || null,
      featured_image: featuredImage || null,
      category_id: categoryId || null,
      status,
      content: content as any,
      author_id: user?.id || null,
    };

    try {
      if (isNew) {
        const { error } = await supabase.from("posts").insert(postData);
        if (error) throw error;
        toast.success("Post created");
      } else {
        const { error } = await supabase.from("posts").update(postData).eq("id", id);
        if (error) throw error;
        toast.success("Post updated");
      }
      setIsDirty(false);
      navigate("/cms/posts");
    } catch (error: any) {
      toast.error(error.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadMedia(file);
      if (url) setFeaturedImage(url);
      else toast.error("Upload failed");
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => { if (confirmLeave()) navigate("/cms/posts"); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{isNew ? "Add New Post" : "Edit Post"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { if (confirmLeave()) navigate("/cms/posts"); }}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || isViewer}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Post"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => { setTitle(e.target.value); markDirty(); }} placeholder="Post title" disabled={isViewer} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); markDirty(); }} disabled={isViewer}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => { setStatus(v); markDirty(); }} disabled={isViewer}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Excerpt</Label>
          <Textarea value={excerpt} onChange={(e) => { setExcerpt(e.target.value); markDirty(); }} placeholder="Brief description..." rows={3} disabled={isViewer} />
        </div>

        <div className="space-y-2">
          <Label>Featured Image</Label>
          <div className="flex gap-2 items-center">
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isViewer} />
            {featuredImage && <img src={featuredImage} alt="" className="h-16 w-16 rounded object-cover border border-border" />}
          </div>
        </div>

        <div className="space-y-2">
          <SEOEditor seo={seo} onChange={setSeo} titleFallback={title} disabled={isViewer} />
        </div>

        <div className="space-y-2">
          <Label>Content Blocks</Label>
          <ContentBlockEditor blocks={content} onChange={(b) => { setContent(b); markDirty(); }} disabled={isViewer} />
        </div>
      </div>
    </div>
  );
}
