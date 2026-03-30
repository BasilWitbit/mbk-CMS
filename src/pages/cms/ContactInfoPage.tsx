import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
}

export default function ContactInfoPage() {
  const { role } = useAuth();
  const isViewer = role === "viewer";
  const [contactInfoList, setContactInfoList] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase.from("contact_info").select("*").order("sort_order");
    if (data) setContactInfoList(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addContactInfo = async (type: string) => {
    const { error } = await supabase.from("contact_info").insert({ type, label: "", value: "" });
    if (error) { toast.error("Failed to add"); return; }
    fetchData();
  };

  const updateContactInfo = async (id: string, field: string, value: string) => {
    setContactInfoList(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    await supabase.from("contact_info").update({ [field]: value } as any).eq("id", id);
  };

  const deleteContactInfo = async (id: string) => {
    const { error } = await supabase.from("contact_info").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setContactInfoList(prev => prev.filter(c => c.id !== id));
    toast.success("Contact info removed");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Contact Info</h1>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Manage contact information displayed on the Contact Us page.</p>

        {(["address", "email", "phone"] as const).map((type) => (
          <Card key={type}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base capitalize">{type === "phone" ? "Phone Numbers" : type === "email" ? "Email Addresses" : "Addresses"}</CardTitle>
              {!isViewer && (
                <Button variant="outline" size="sm" onClick={() => addContactInfo(type)}>
                  <Plus className="h-3 w-3 mr-1" /> Add {type}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {contactInfoList.filter((c) => c.type === type).map((info) => (
                <div key={info.id} className="flex items-start gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input placeholder="Label (e.g. Main Office)" value={info.label} onChange={(e) => updateContactInfo(info.id, "label", e.target.value)} disabled={isViewer} />
                    <Input placeholder={type === "email" ? "email@example.com" : type === "phone" ? "+1 (555) 123-4567" : "123 Street, City, State"} value={info.value} onChange={(e) => updateContactInfo(info.id, "value", e.target.value)} disabled={isViewer} />
                  </div>
                  {!isViewer && (
                    <Button variant="ghost" size="icon" onClick={() => deleteContactInfo(info.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {contactInfoList.filter((c) => c.type === type).length === 0 && (
                <p className="text-sm text-muted-foreground italic">No {type} entries yet.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
