import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Post {
  id: string;
  title: string;
  category_id: string | null;
  status: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export default function PostsList() {
  const { role } = useAuth();
  const isViewer = role === "viewer";
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchData = async () => {
    const [postsRes, catsRes] = await Promise.all([
      supabase.from("posts").select("id, title, category_id, status, created_at").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
    ]);
    if (postsRes.data) setPosts(postsRes.data);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getCategoryName = (catId: string | null) => categories.find((c) => c.id === catId)?.name || "—";

  // Compute unique months for the date filter
  const availableDates = useMemo(() => {
    const dates = posts.map(p => format(new Date(p.created_at), 'MMMM yyyy'));
    return Array.from(new Set(dates));
  }, [posts]);

  // Filtering logic
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryId === "all" || post.category_id === selectedCategoryId;
      const matchesDate = selectedDate === "all" || format(new Date(post.created_at), 'MMMM yyyy') === selectedDate;
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [posts, searchQuery, selectedCategoryId, selectedDate]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setPosts(posts.filter((p) => p.id !== id));
    setSelectedIds(selectedIds.filter(sid => sid !== id));
    toast.success("Post deleted");
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} posts?`)) return;

    const { error } = await supabase.from("posts").delete().in("id", selectedIds);
    if (error) { toast.error("Failed to delete selected posts"); return; }
    
    setPosts(posts.filter(p => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    toast.success(`${selectedIds.length} posts deleted successfully`);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">All Posts</h1>
        {!isViewer && (
          <Link to="/cms/posts/new">
            <Button><Plus className="h-4 w-4 mr-2" /> Add Post</Button>
          </Link>
        )}
      </div>

      {/* WordPress-style Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search posts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {availableDates.map(date => (
              <SelectItem key={date} value={date}>{date}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedIds.length > 0 && !isViewer && (
          <div className="flex items-center gap-2 border-l border-border pl-4 ml-auto">
            <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete}
              className="h-8"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Bulk Delete
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[40px] px-4">
                {!isViewer && (
                  <Checkbox 
                    checked={filteredPosts.length > 0 && selectedIds.length === filteredPosts.length}
                    onCheckedChange={toggleSelectAll}
                  />
                )}
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {posts.length === 0 ? "No posts yet" : "No posts matching your filters"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id} className={selectedIds.includes(post.id) ? "bg-primary/5" : ""}>
                  <TableCell className="px-4">
                    {!isViewer && (
                      <Checkbox 
                        checked={selectedIds.includes(post.id)}
                        onCheckedChange={() => toggleSelect(post.id)}
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    <Link to={`/cms/posts/${post.id}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{getCategoryName(post.category_id)}</TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Link to={`/cms/posts/${post.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                          {isViewer ? <Search className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
                        </Button>
                      </Link>
                      {!isViewer && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" 
                          onClick={() => handleDelete(post.id)}
                        >
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
