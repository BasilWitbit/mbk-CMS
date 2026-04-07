import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  video_data: any;
  created_at: string;
}

export default function CategoriesList() {
  const { role } = useAuth();
  const isViewer = role === "viewer";
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("created_at");
    if (error) { toast.error("Failed to load categories"); return; }
    setCategories((data as unknown as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
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
        {!isViewer && (
          <Button asChild>
            <Link to="/cms/categories/new">
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Link>
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Video</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No categories</TableCell></TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.description || '—'}</TableCell>
                  <TableCell>
                    {cat.video_data?.url ? (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Video className="h-3 w-3" /> Video
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost-icon" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/cms/categories/${cat.id}`}>
                          {isViewer ? <Search className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
                        </Link>
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
    </div>
  );
}
