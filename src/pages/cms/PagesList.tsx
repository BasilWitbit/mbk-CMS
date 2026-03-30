import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";

interface Page {
  id: string;
  slug: string;
  title: string;
  status: string;
  created_at: string;
}

export default function PagesList() {
  const { role } = useAuth();
  const isViewer = role === "viewer";
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPages = async () => {
    const { data, error } = await supabase.from("pages").select("id, slug, title, status, created_at").order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load pages"); return; }
    setPages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setPages(pages.filter((p) => p.id !== id));
    toast.success("Page deleted");
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const slug = newSlug.trim() || slugify(newTitle);
      const { error } = await supabase.from("pages").insert({ title: newTitle.trim(), slug, status: "draft" });
      if (error) throw error;
      setNewTitle("");
      setNewSlug("");
      setShowAdd(false);
      toast.success("Page created");
      fetchPages();
    } catch (error: any) {
      toast.error(error.message || "Failed to create page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Pages</h1>
        {!isViewer && (
          <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" /> Add Page</Button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No pages yet</TableCell></TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium text-foreground">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                  <TableCell>
                    <Badge variant={page.status === "published" ? "default" : "secondary"}>{page.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(page.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link to={`/cms/pages/${page.slug}`}>
                        <Button variant="ghost-icon" size="icon" className="h-8 w-8">
                          {isViewer ? <Search className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
                        </Button>
                      </Link>
                      {!isViewer && (
                        <Button variant="ghost-icon" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(page.id)}>
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

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Page</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Page Title</label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. About Us" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Slug (optional)</label>
              <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="auto-generated from title" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
