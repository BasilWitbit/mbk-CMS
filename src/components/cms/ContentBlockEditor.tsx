import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Copy, Pencil, Check, X, Upload, Image as ImageIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MediaPickerDialog } from "./MediaPickerDialog";

export interface ContentBlock {
  id: string;
  type: "heading" | "text" | "textbox" | "html" | "image" | "button" | "icon";
  data: Record<string, string>;
}

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  disabled?: boolean;
}

const blockTypes = [
  { value: "heading", label: "Heading" },
  { value: "text", label: "Text / Paragraph" },
  { value: "textbox", label: "Text Box (Heading + Subtext)" },
  { value: "html", label: "HTML Block" },
  { value: "image", label: "Image Block" },
  { value: "button", label: "Button / CTA" },
  { value: "icon", label: "Icon" },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function BlockEditor({ block, onChange, onDelete, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast, disabled }: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempLabel, setTempLabel] = useState(block.data.label || "");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string>("url");

  const updateData = (key: string, value: string) => {
    onChange({ ...block, data: { ...block.data, [key]: value } });
  };

  const handleRenameSubmit = () => {
    updateData("label", tempLabel);
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setTempLabel(block.data.label || "");
    setIsRenaming(false);
  };

  const handleImageUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData(key, URL.createObjectURL(file));
    }
  };

  const blockLabel = block.data.label || blockTypes.find((t) => t.value === block.type)?.label || block.type;

  return (
    <Card className="relative group">
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                className="h-6 text-xs py-0"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") handleRenameCancel(); }}
              />
              <Button variant="ghost-icon" size="icon" onClick={handleRenameSubmit} className="h-6 w-6">
                <Check className="h-3 w-3" />
              </Button>
              <Button variant="ghost-icon" size="icon" onClick={handleRenameCancel} className="h-6 w-6">
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground truncate">
                {blockLabel}
              </CardTitle>
              <span className="text-[10px] text-muted-foreground/60 uppercase">
                ({blockTypes.find((t) => t.value === block.type)?.label})
              </span>
              <Button variant="ghost-icon" size="icon" onClick={() => { setTempLabel(block.data.label || ""); setIsRenaming(true); }} className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" disabled={disabled}>
                <Pencil className="h-2.5 w-2.5" />
              </Button>
            </>
          )}
        </div>
        {!disabled && (
          <div className="flex gap-1">
            <Button variant="ghost-icon" size="icon" onClick={onMoveUp} disabled={isFirst} className="h-6 w-6">
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost-icon" size="icon" onClick={onMoveDown} disabled={isLast} className="h-6 w-6">
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button variant="ghost-icon" size="icon" onClick={onDuplicate} className="h-6 w-6" title="Duplicate">
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost-icon" size="icon" onClick={onDelete} className="h-6 w-6 text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {block.type === "heading" && (
          <>
            <Select value={block.data.level || "h2"} onValueChange={(v) => updateData("level", v)} disabled={disabled}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1</SelectItem>
                <SelectItem value="h2">H2</SelectItem>
                <SelectItem value="h3">H3</SelectItem>
                <SelectItem value="h4">H4</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Heading text" value={block.data.text || ""} onChange={(e) => updateData("text", e.target.value)} disabled={disabled} />
          </>
        )}
        {block.type === "text" && (
          <Textarea placeholder="Paragraph text..." value={block.data.text || ""} onChange={(e) => updateData("text", e.target.value)} rows={4} disabled={disabled} />
        )}
        {block.type === "textbox" && (
          <>
            <Input placeholder="Heading" value={block.data.heading || ""} onChange={(e) => updateData("heading", e.target.value)} disabled={disabled} />
            <Textarea placeholder="Subtext" value={block.data.subtext || ""} onChange={(e) => updateData("subtext", e.target.value)} rows={3} disabled={disabled} />
          </>
        )}
        {block.type === "html" && (
          <Textarea placeholder="<div>HTML content...</div>" value={block.data.html || ""} onChange={(e) => updateData("html", e.target.value)} rows={6} className="font-mono text-xs" disabled={disabled} />
        )}
        {block.type === "image" && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">Upload Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload("url", e)} disabled={disabled} />
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => { setMediaPickerTarget("url"); setMediaPickerOpen(true); }} disabled={disabled}>
                <ImageIcon className="h-4 w-4 mr-1" /> Choose from Media Library
              </Button>
            </div>
            <Input placeholder="Alt text" value={block.data.alt || ""} onChange={(e) => updateData("alt", e.target.value)} disabled={disabled} />
            {block.data.url && <img src={block.data.url} alt={block.data.alt || ""} className="max-h-40 rounded border border-border object-cover" />}
          </>
        )}
        {block.type === "button" && (
          <>
            <Input placeholder="Button text" value={block.data.text || ""} onChange={(e) => updateData("text", e.target.value)} disabled={disabled} />
            <Input placeholder="Link URL" value={block.data.url || ""} onChange={(e) => updateData("url", e.target.value)} disabled={disabled} />
            <Select value={block.data.variant || "primary"} onValueChange={(v) => updateData("variant", v)} disabled={disabled}>
              <SelectTrigger><SelectValue placeholder="Button style" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={block.data.size || "default"} onValueChange={(v) => updateData("size", v)} disabled={disabled}>
              <SelectTrigger><SelectValue placeholder="Button size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Open in new tab</label>
              <input type="checkbox" checked={block.data.newTab === "true"} onChange={(e) => updateData("newTab", e.target.checked ? "true" : "false")} disabled={disabled} />
            </div>
          </>
        )}
        {block.type === "icon" && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">Icon SVG Code</Label>
              <Textarea
                placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>'
                value={block.data.svg || ""}
                onChange={(e) => updateData("svg", e.target.value)}
                rows={4}
                className="font-mono text-xs"
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Or Upload Icon</Label>
              <Input type="file" accept="image/svg+xml,image/png,image/jpg,image/jpeg,image/gif" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.type === "image/svg+xml") {
                    const reader = new FileReader();
                    reader.onload = () => updateData("svg", reader.result as string);
                    reader.readAsText(file);
                  } else {
                    updateData("uploadedUrl", URL.createObjectURL(file));
                  }
                }
              }} disabled={disabled} />
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => { setMediaPickerTarget("uploadedUrl"); setMediaPickerOpen(true); }} disabled={disabled}>
                <ImageIcon className="h-4 w-4 mr-1" /> Choose from Media Library
              </Button>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Icon Size (px)</Label>
              <Input placeholder="24" value={block.data.size || "24"} onChange={(e) => updateData("size", e.target.value)} disabled={disabled} />
              <p className="text-xs text-muted-foreground">Width and height in pixels (e.g. 24, 32, 48)</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Icon Color</Label>
              <Input placeholder="#7E25E9" value={block.data.color || ""} onChange={(e) => updateData("color", e.target.value)} disabled={disabled} />
              <p className="text-xs text-muted-foreground">Hex color code. Only applies to SVG icons.</p>
            </div>
            {block.data.svg && (
              <div className="p-3 border border-border rounded bg-muted/30 flex items-center justify-center">
                <div dangerouslySetInnerHTML={{ __html: block.data.svg }} style={{ width: Number(block.data.size || 24), height: Number(block.data.size || 24), color: block.data.color || "currentColor" }} />
              </div>
            )}
            {block.data.uploadedUrl && !block.data.svg && (
              <div className="p-3 border border-border rounded bg-muted/30 flex items-center justify-center">
                <img src={block.data.uploadedUrl} alt="Icon" style={{ width: Number(block.data.size || 24), height: Number(block.data.size || 24) }} />
              </div>
            )}
          </>
        )}
      </CardContent>
      <MediaPickerDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => updateData(mediaPickerTarget, url)}
      />
    </Card>
  );
}

export function ContentBlockEditor({ blocks, onChange, disabled }: ContentBlockEditorProps) {
  const [addType, setAddType] = useState<string>("heading");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const addBlock = () => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type: addType as ContentBlock["type"],
      data: {},
    };
    onChange([...blocks, newBlock]);
    toast.success("Block added");
  };

  const updateBlock = (index: number, block: ContentBlock) => {
    const updated = [...blocks];
    updated[index] = block;
    onChange(updated);
  };

  const confirmDeleteBlock = () => {
    if (deleteIndex !== null) {
      onChange(blocks.filter((_, i) => i !== deleteIndex));
      toast.success("Block deleted");
      setDeleteIndex(null);
    }
  };

  const duplicateBlock = (index: number) => {
    const original = blocks[index];
    const duplicate: ContentBlock = {
      ...original,
      id: generateId(),
      data: { ...original.data, label: (original.data.label || "") + " (copy)" },
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, duplicate);
    onChange(updated);
    toast.success("Block duplicated");
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const updated = [...blocks];
    const newIndex = index + direction;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <BlockEditor
          key={block.id}
          block={block}
          onChange={(b) => updateBlock(i, b)}
          onDelete={() => setDeleteIndex(i)}
          onDuplicate={() => duplicateBlock(i)}
          onMoveUp={() => moveBlock(i, -1)}
          onMoveDown={() => moveBlock(i, 1)}
          isFirst={i === 0}
          isLast={i === blocks.length - 1}
          disabled={disabled}
        />
      ))}

      {!disabled && (
        <div className="flex gap-2 items-center pt-2">
          <Select value={addType} onValueChange={setAddType}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {blockTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addBlock} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Block
          </Button>
        </div>
      )}

      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Block</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this block? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBlock} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
