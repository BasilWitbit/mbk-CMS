import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLogo } from "@/contexts/LogoContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/supabase-helpers";
import { Loader2 } from "lucide-react";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useAuth } from "@/contexts/AuthContext";

export default function SiteIdentity() {
  const { role } = useAuth();
  const isViewer = role === "viewer";
  const { logoUrl, setLogoUrl } = useLogo();
  const [faviconUrl, setFaviconUrl] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { confirmLeave } = useUnsavedChanges(isDirty);
  const markDirty = () => setIsDirty(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("cms_settings").select("key, value");
      if (data) {
        data.forEach(({ key, value }) => {
          if (key === "site_title") setSiteTitle(value || "");
          if (key === "site_description") setSiteDescription(value || "");
          if (key === "logo_url") setLogoUrl(value || "");
          if (key === "favicon_url") setFaviconUrl(value || "");
        });
      }
    };
    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase.from("cms_settings").select("id").eq("key", key).single();
    if (existing) {
      await supabase.from("cms_settings").update({ value }).eq("key", key);
    } else {
      await supabase.from("cms_settings").insert({ key, value });
    }
  };


  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting("site_title", siteTitle),
        saveSetting("site_description", siteDescription),
        saveSetting("logo_url", logoUrl),
        saveSetting("favicon_url", faviconUrl),
      ]);
      setIsDirty(false);
      toast.success("Settings saved");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadMedia(file);
      if (url) { setLogoUrl(url); toast.success("Logo updated"); }
      else toast.error("Upload failed");
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadMedia(file);
      if (url) { setFaviconUrl(url); toast.success("Favicon updated"); }
      else toast.error("Upload failed");
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Site Identity</h1>
        <Button onClick={handleSave} disabled={saving || isViewer}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Settings"}
        </Button>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Site Title & Description</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Title</Label>
              <Input value={siteTitle} onChange={(e) => { setSiteTitle(e.target.value); markDirty(); }} placeholder="My Awesome Website" disabled={isViewer} />
            </div>
            <div className="space-y-2">
              <Label>Site Description</Label>
              <Textarea value={siteDescription} onChange={(e) => { setSiteDescription(e.target.value); markDirty(); }} placeholder="A brief description..." rows={3} disabled={isViewer} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Logo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {logoUrl && (
              <div className="flex items-center gap-4">
                <img src={logoUrl} alt="Logo" className="h-16 max-w-[200px] object-contain rounded border border-border" />
                {!isViewer && <Button variant="destructive" size="sm" onClick={() => { setLogoUrl(""); toast.success("Logo removed"); }}>Remove</Button>}
              </div>
            )}
            <div className="space-y-2">
              <Label>Upload Logo</Label>
              <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={isViewer} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Favicon</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {faviconUrl && (
              <div className="flex items-center gap-4">
                <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain rounded border border-border" />
                {!isViewer && <Button variant="destructive" size="sm" onClick={() => { setFaviconUrl(""); toast.success("Favicon removed"); }}>Remove</Button>}
              </div>
            )}
            <div className="space-y-2">
              <Label>Upload Favicon</Label>
              <p className="text-xs text-muted-foreground">Recommended: 32×32 or 64×64 pixels, PNG or ICO format</p>
              <Input type="file" accept="image/png,image/x-icon,image/ico,image/svg+xml" onChange={handleFaviconUpload} disabled={isViewer} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
