import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentBlockEditor, ContentBlock } from "@/components/cms/ContentBlockEditor";
import { SEOEditor, SEOData, emptySEO } from "@/components/cms/SEOEditor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, ChevronDown, ChevronRight, Pencil, Check, X, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useAuth } from "@/contexts/AuthContext";

interface PageSection {
  id: string;
  name: string;
  blocks: ContentBlock[];
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function PageEditor() {
  const { role } = useAuth();
  const isViewer = role === "viewer";
  const navigate = useNavigate();
  const { slug } = useParams();
  const [pageId, setPageId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [seo, setSeo] = useState<SEOData>(emptySEO);
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { confirmLeave } = useUnsavedChanges(isDirty);
  const markDirty = () => setIsDirty(true);

  useEffect(() => {
    const fetchPage = async () => {
      const { data: page } = await supabase.from("pages").select("*").eq("slug", slug).single();
      if (page) {
        setPageId(page.id);
        setPageTitle(page.title);
        const content = Array.isArray(page.content) ? (page.content as unknown as PageSection[]) : [];
        setSections(content);
        setOpenSections(content.map((s) => s.id));
      }
      setLoading(false);
    };
    fetchPage();
  }, [slug]);

  const handleSave = async () => {
    if (!pageId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("pages").update({ content: sections as any }).eq("id", pageId);
      if (error) throw error;
      setIsDirty(false);
      toast.success("Page saved");
    } catch (error: any) {
      toast.error(error.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    const newSection: PageSection = { id: generateId(), name: "New Section", blocks: [] };
    setSections([...sections, newSection]);
    setOpenSections([...openSections, newSection.id]);
    markDirty();
    toast.success("Section added");
  };

  const confirmDeleteSection = () => {
    if (deleteSectionId) {
      setSections(sections.filter((s) => s.id !== deleteSectionId));
      toast.success("Section deleted");
      setDeleteSectionId(null);
    }
  };

  const renameSection = (id: string) => {
    setSections(sections.map((s) => s.id === id ? { ...s, name: tempName } : s));
    setRenamingId(null);
    toast.success("Section renamed");
  };

  const updateSectionBlocks = (sectionId: string, blocks: ContentBlock[]) => {
    setSections(sections.map((s) => s.id === sectionId ? { ...s, blocks } : s));
    markDirty();
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!pageId) return <div className="text-muted-foreground">Page not found</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => { if (confirmLeave()) navigate("/cms/pages"); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
        </div>
        <div className="flex gap-2">
          {!isViewer && (
            <Button variant="outline" onClick={addSection}>
              <Plus className="h-4 w-4 mr-1" /> Add Section
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving || isViewer}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Page"}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <SEOEditor seo={seo} onChange={setSeo} titleFallback={pageTitle} disabled={isViewer} />
      </div>

      <div className="space-y-4">
        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No sections yet. Click "Add Section" to start building this page.</p>
        )}

        {sections.map((section) => {
          const isOpen = openSections.includes(section.id);
          return (
            <Card key={section.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSection(section.id)} className="text-muted-foreground hover:text-foreground">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  {renamingId === section.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <Input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") renameSection(section.id); if (e.key === "Escape") setRenamingId(null); }}
                      />
                      <Button variant="ghost-icon" size="icon" className="h-6 w-6" onClick={() => renameSection(section.id)}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost-icon" size="icon" className="h-6 w-6" onClick={() => setRenamingId(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <CardTitle className="text-sm font-semibold">{section.name}</CardTitle>
                      <span className="text-xs text-muted-foreground">({section.blocks.length} blocks)</span>
                      {!isViewer && (
                        <Button variant="ghost-icon" size="icon" className="h-5 w-5" onClick={() => { setRenamingId(section.id); setTempName(section.name); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}

                  {!isViewer && (
                    <Button variant="ghost-icon" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteSectionId(section.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              {isOpen && (
                <CardContent>
                  <ContentBlockEditor
                    blocks={section.blocks as ContentBlock[]}
                    onChange={(blocks) => updateSectionBlocks(section.id, blocks)}
                    disabled={isViewer}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteSectionId} onOpenChange={(open) => !open && setDeleteSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this section and all its blocks? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSection} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
