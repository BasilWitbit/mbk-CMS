import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Copy, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

export interface ContactField {
  id: string;
  type: "address" | "email" | "phone";
  label: string;
  value: string;
}

interface ContactFieldsEditorProps {
  fields: ContactField[];
  onChange: (fields: ContactField[]) => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const fieldConfig = {
  address: { title: "Addresses", placeholder: "123 Street, City, State, ZIP", defaultLabel: "Main Office" },
  email: { title: "Email Addresses", placeholder: "info@company.com", defaultLabel: "General Inquiries" },
  phone: { title: "Phone Numbers", placeholder: "+1 (555) 123-4567", defaultLabel: "Main Line" },
};

function FieldGroup({ type, fields, onUpdate }: { type: ContactField["type"]; fields: ContactField[]; onUpdate: (updated: ContactField[]) => void }) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState("");
  const config = fieldConfig[type];
  const typeFields = fields.filter((f) => f.type === type);

  const add = () => {
    onUpdate([...fields, { id: generateId(), type, label: config.defaultLabel, value: "" }]);
    toast.success(`${type} added`);
  };

  const remove = (id: string) => {
    onUpdate(fields.filter((f) => f.id !== id));
    toast.success(`${type} removed`);
  };

  const duplicate = (id: string) => {
    const original = fields.find((f) => f.id === id);
    if (!original) return;
    const idx = fields.indexOf(original);
    const copy = { ...original, id: generateId(), label: original.label + " (copy)" };
    const updated = [...fields];
    updated.splice(idx + 1, 0, copy);
    onUpdate(updated);
    toast.success(`${type} duplicated`);
  };

  const update = (id: string, key: "label" | "value", value: string) => {
    onUpdate(fields.map((f) => f.id === id ? { ...f, [key]: value } : f));
  };

  const submitRename = (id: string) => {
    update(id, "label", tempLabel);
    setRenamingId(null);
    toast.success("Renamed");
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">{config.title}</CardTitle>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {typeFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No {type} entries yet.</p>
        )}
        {typeFields.map((field) => (
          <div key={field.id} className="border border-border rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2">
              {renamingId === field.id ? (
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    value={tempLabel}
                    onChange={(e) => setTempLabel(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") submitRename(field.id); if (e.key === "Escape") setRenamingId(null); }}
                  />
                  <Button variant="ghost-icon" size="icon" className="h-6 w-6" onClick={() => submitRename(field.id)}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost-icon" size="icon" className="h-6 w-6" onClick={() => setRenamingId(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <Label className="text-sm font-medium">{field.label}</Label>
                  <Button variant="ghost-icon" size="icon" className="h-5 w-5" onClick={() => { setRenamingId(field.id); setTempLabel(field.label); }}>
                    <Pencil className="h-2.5 w-2.5" />
                  </Button>
                </div>
              )}
              <div className="flex gap-1">
                <Button variant="ghost-icon" size="icon" className="h-6 w-6" onClick={() => duplicate(field.id)} title="Duplicate">
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost-icon" size="icon" className="h-6 w-6 text-destructive" onClick={() => remove(field.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Input
              placeholder={config.placeholder}
              value={field.value}
              onChange={(e) => update(field.id, "value", e.target.value)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ContactFieldsEditor({ fields, onChange }: ContactFieldsEditorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h3>
      <FieldGroup type="address" fields={fields} onUpdate={onChange} />
      <FieldGroup type="email" fields={fields} onUpdate={onChange} />
      <FieldGroup type="phone" fields={fields} onUpdate={onChange} />
    </div>
  );
}
