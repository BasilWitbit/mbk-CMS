import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { availableSocialPlatforms } from "@/lib/static-data";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  custom_icon_url: string | null;
}

export default function SocialMedia() {
  const { role } = useAuth();
  const isViewer = role === "viewer";
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    const { data } = await supabase.from("social_links").select("*").order("sort_order");
    if (data) setSocialLinks(data);
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const addSocialLink = async () => {
    const maxOrder = socialLinks.length ? Math.max(...socialLinks.map((s: any) => s.sort_order ?? 0)) + 1 : 0;
    const { error } = await supabase.from("social_links").insert({ platform: "Facebook", url: "", icon: "facebook", sort_order: maxOrder });
    if (error) { toast.error("Failed to add"); return; }
    fetchLinks();
  };

  const updateSocialLink = async (id: string, field: string, value: string) => {
    setSocialLinks(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    await supabase.from("social_links").update({ [field]: value } as any).eq("id", id);
  };

  const deleteSocialLink = async (id: string) => {
    const { error } = await supabase.from("social_links").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setSocialLinks(prev => prev.filter(s => s.id !== id));
    toast.success("Social link removed");
  };

  const handleSocialIconUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadMedia(file);
      if (url) {
        updateSocialLink(id, "custom_icon_url", url);
        toast.success("Icon uploaded");
      } else toast.error("Upload failed");
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Social Media</h1>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Manage your social media links and icons.</p>
          {!isViewer && <Button onClick={addSocialLink} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Platform</Button>}
        </div>
        {socialLinks.map((link) => (
          <Card key={link.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Platform</Label>
                      <Select value={link.platform} onValueChange={(v) => updateSocialLink(link.id, "platform", v)} disabled={isViewer}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {availableSocialPlatforms.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">URL</Label>
                      <Input placeholder="https://..." value={link.url} onChange={(e) => updateSocialLink(link.id, "url", e.target.value)} disabled={isViewer} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Custom Icon (optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="image/svg+xml,image/png,image/jpg" onChange={(e) => handleSocialIconUpload(link.id, e)} className="flex-1" disabled={isViewer} />
                      {link.custom_icon_url && (
                        <img src={link.custom_icon_url} alt={link.platform} className="h-6 w-6 object-contain" />
                      )}
                    </div>
                  </div>
                </div>
                {!isViewer && (
                  <Button variant="ghost" size="icon" onClick={() => deleteSocialLink(link.id)} className="text-destructive hover:text-destructive mt-5">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
