import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
}

export default function PartnersList() {
  const { role } = useAuth();
  const isViewer = role === "viewer";
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPartners = async () => {
    const { data, error } = await supabase.from("partners").select("*").order("sort_order");
    if (error) { toast.error("Failed to load partners"); return; }
    setPartners((data || []).map(p => ({ ...p, website_url: (p as any).website_url ?? null })));
    setLoading(false);
  };

  useEffect(() => { fetchPartners(); }, []);

  const openDialog = (partner?: Partner) => {
    if (partner) { setEditId(partner.id); setName(partner.name); setLogoUrl(partner.logo_url || ""); setWebsiteUrl(partner.website_url || ""); }
    else { setEditId(null); setName(""); setLogoUrl(""); setWebsiteUrl(""); }
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditId(null); setName(""); setLogoUrl(""); setWebsiteUrl(""); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        const { error } = await supabase.from("partners").update({ name, logo_url: logoUrl || null, website_url: websiteUrl || null } as any).eq("id", editId);
        if (error) throw error;
        toast.success("Partner updated");
      } else {
        const maxOrder = partners.length ? Math.max(...partners.map((p) => p.sort_order)) + 1 : 0;
        const { error } = await supabase.from("partners").insert({ name, logo_url: logoUrl || null, website_url: websiteUrl || null, sort_order: maxOrder } as any);
        if (error) throw error;
        toast.success("Partner added");
      }
      closeDialog();
      fetchPartners();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      const { error } = await supabase.from("partners").delete().eq("id", deleteId);
      if (error) { toast.error("Failed to delete"); return; }
      toast.success("Partner deleted");
      setDeleteId(null);
      fetchPartners();
    }
  };

  const handleReorder = async (id: string, direction: -1 | 1) => {
    const idx = partners.findIndex((p) => p.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= partners.length) return;
    const updated = [...partners];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setPartners(updated);
    await Promise.all([
      supabase.from("partners").update({ sort_order: swapIdx } as any).eq("id", updated[swapIdx].id),
      supabase.from("partners").update({ sort_order: idx } as any).eq("id", updated[idx].id),
    ]);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadMedia(file);
      if (url) setLogoUrl(url);
      else toast.error("Upload failed");
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Partners</h1>
        {!isViewer && <Button onClick={() => openDialog()}><Plus className="h-4 w-4 mr-2" /> Add Partner</Button>}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No partners</TableCell></TableRow>
            ) : (
              partners.map((partner, i) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    {!isViewer && (
                      <div className="flex gap-1">
                        <Button variant="ghost-icon" size="icon" className="h-6 w-6" disabled={i === 0} onClick={() => handleReorder(partner.id, -1)}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost-icon" size="icon" className="h-6 w-6" disabled={i === partners.length - 1} onClick={() => handleReorder(partner.id, 1)}>
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {partner.logo_url ? <img src={partner.logo_url} alt={partner.name} className="h-10 w-10 object-contain rounded" /> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{partner.name}</TableCell>
                  <TableCell>
                    {partner.website_url ? (
                      <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline flex items-center gap-1 text-sm">
                        {partner.website_url} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost-icon" size="icon" className="h-8 w-8" onClick={() => openDialog(partner)}>
                        {isViewer ? <Search className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
                      </Button>
                      {!isViewer && (
                        <Button variant="ghost-icon" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(partner.id)}>
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
          <DialogHeader><DialogTitle>{editId ? "Edit Partner" : "Add Partner"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} disabled={isViewer} /></div>
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" disabled={isViewer} />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={isViewer} />
              {logoUrl && <img src={logoUrl} alt="" className="h-16 w-16 object-contain rounded border border-border" />}
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Partner</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this partner? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
