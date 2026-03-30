import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { MediaPickerDialog } from "./MediaPickerDialog";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  focusKeyword: string;
  noIndex: boolean;
  noFollow: boolean;
  structuredDataType: string;
}

export const emptySEO: SEOData = {
  metaTitle: "",
  metaDescription: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  canonicalUrl: "",
  focusKeyword: "",
  noIndex: false,
  noFollow: false,
  structuredDataType: "",
};

interface SEOEditorProps {
  seo: SEOData;
  onChange: (seo: SEOData) => void;
  titleFallback?: string;
  disabled?: boolean;
}

export function SEOEditor({ seo, onChange, titleFallback, disabled }: SEOEditorProps) {
  const [open, setOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  const update = (key: keyof SEOData, value: string | boolean) => {
    onChange({ ...seo, [key]: value });
  };

  const metaTitle = seo.metaTitle || titleFallback || "";
  const metaTitleLen = metaTitle.length;
  const metaDescLen = seo.metaDescription.length;

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <Search className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">SEO Settings</CardTitle>
          {!open && metaTitle && (
            <span className="text-xs text-muted-foreground truncate ml-2 max-w-[300px]">{metaTitle}</span>
          )}
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-5">
          {/* Preview snippet */}
          <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Google Preview</p>
            <p className="text-[#1a0dab] text-base font-medium truncate">{metaTitle || "Page Title"}</p>
            <p className="text-[#006621] text-xs truncate">{seo.canonicalUrl || "https://yoursite.com/page-url"}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{seo.metaDescription || "Add a meta description to see how this page will appear in search results..."}</p>
          </div>

          {/* Meta Title */}
          <div className="space-y-1">
            <Label className="text-sm">Meta Title</Label>
            <Input
              placeholder={titleFallback || "Enter meta title"}
              value={seo.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
              disabled={disabled}
            />
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground">Recommended: 50–60 characters for optimal display in search results.</p>
              <span className={`text-xs ${metaTitleLen > 60 ? "text-destructive" : metaTitleLen >= 50 ? "text-green-600" : "text-muted-foreground"}`}>
                {metaTitleLen}/60
              </span>
            </div>
          </div>

          {/* Meta Description */}
          <div className="space-y-1">
            <Label className="text-sm">Meta Description</Label>
            <Textarea
              placeholder="Brief description for search engines..."
              value={seo.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              rows={3}
              disabled={disabled}
            />
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground">Recommended: 120–160 characters. Include your focus keyword naturally.</p>
              <span className={`text-xs ${metaDescLen > 160 ? "text-destructive" : metaDescLen >= 120 ? "text-green-600" : "text-muted-foreground"}`}>
                {metaDescLen}/160
              </span>
            </div>
          </div>

          {/* Focus Keyword */}
          <div className="space-y-1">
            <Label className="text-sm">Focus Keyword</Label>
            <Input
              placeholder="e.g. web development services"
              value={seo.focusKeyword}
              onChange={(e) => update("focusKeyword", e.target.value)}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">The primary keyword you want this page to rank for.</p>
          </div>

          {/* Canonical URL */}
          <div className="space-y-1">
            <Label className="text-sm">Canonical URL</Label>
            <Input
              placeholder="https://yoursite.com/page-url"
              value={seo.canonicalUrl}
              onChange={(e) => update("canonicalUrl", e.target.value)}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">Set a canonical URL to prevent duplicate content issues. Leave blank to use the page's own URL.</p>
          </div>

          {/* OG Title */}
          <div className="space-y-1">
            <Label className="text-sm">OG Title (Social Share Title)</Label>
            <Input
              placeholder={seo.metaTitle || titleFallback || "Social share title"}
              value={seo.ogTitle}
              onChange={(e) => update("ogTitle", e.target.value)}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">Title shown when shared on Facebook, LinkedIn, etc. Falls back to Meta Title if empty.</p>
          </div>

          {/* OG Description */}
          <div className="space-y-1">
            <Label className="text-sm">OG Description (Social Share Description)</Label>
            <Textarea
              placeholder="Description shown on social media..."
              value={seo.ogDescription}
              onChange={(e) => update("ogDescription", e.target.value)}
              rows={2}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">Falls back to Meta Description if empty.</p>
          </div>

          {/* OG Image */}
          <div className="space-y-2">
            <Label className="text-sm">OG Image (Social Share Image)</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) update("ogImage", URL.createObjectURL(file));
                }}
                className="flex-1"
                disabled={disabled}
              />
              <Button variant="outline" size="sm" onClick={() => setMediaOpen(true)} disabled={disabled}>
                <ImageIcon className="h-4 w-4 mr-1" /> Media Library
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Recommended: 1200×630 pixels for optimal display on social platforms.</p>
            {seo.ogImage && (
              <div className="relative">
                <img src={seo.ogImage} alt="OG Preview" className="max-h-32 rounded border border-border object-cover" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 text-xs"
                  onClick={() => update("ogImage", "")}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Robots directives */}
          <div className="space-y-2">
            <Label className="text-sm">Search Engine Directives</Label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={seo.noIndex}
                  onChange={(e) => update("noIndex", e.target.checked)}
                  className="rounded"
                  disabled={disabled}
                />
                No Index
                <span className="text-xs">(hide from search results)</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={seo.noFollow}
                  onChange={(e) => update("noFollow", e.target.checked)}
                  className="rounded"
                  disabled={disabled}
                />
                No Follow
                <span className="text-xs">(don't follow links)</span>
              </label>
            </div>
          </div>

          <MediaPickerDialog
            open={mediaOpen}
            onClose={() => setMediaOpen(false)}
            onSelect={(url) => update("ogImage", url)}
          />
        </CardContent>
      )}
    </Card>
  );
}
