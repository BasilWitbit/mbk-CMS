import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Link as LinkIcon, Trash2, Play, Pause, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { uploadMedia } from "@/lib/supabase-helpers";

export interface VideoData {
  url: string;
  controls: boolean;
  loop: boolean;
  autoplay: boolean;
  muted: boolean;
}

interface VideoUploadWidgetProps {
  videoData?: VideoData;
  onChange: (data: VideoData | null) => void;
  disabled?: boolean;
}

export function VideoUploadWidget({ videoData, onChange, disabled }: VideoUploadWidgetProps) {
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const defaultData: VideoData = {
    url: "",
    controls: true,
    loop: false,
    autoplay: false,
    muted: true,
  };

  const currentData = videoData || defaultData;

  const updateData = (updates: Partial<VideoData>) => {
    onChange({ ...currentData, ...updates });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadMedia(file);
      if (url) {
        updateData({ url });
        toast.success("Video uploaded successfully");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to remove this video?")) {
      onChange(null);
    }
  };

  return (
    <Card className="overflow-hidden border-dashed">
      <CardContent className="p-6 space-y-6">
        {!currentData.url ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Upload Video File</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    disabled={disabled || uploading}
                    className="hidden"
                    id="video-upload"
                  />
                  <Label
                    htmlFor="video-upload"
                    className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {uploading ? "Uploading..." : "Click to upload video"}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">MP4, WebM, Ogg (max 50MB)</span>
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Video URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://example.com/video.mp4"
                      className="pl-9"
                      value={currentData.url}
                      onChange={(e) => updateData({ url: e.target.value })}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Direct link to video file</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative group rounded-lg overflow-hidden bg-black border border-border aspect-video">
              <video
                ref={videoRef}
                src={currentData.url}
                controls={currentData.controls}
                loop={currentData.loop}
                autoPlay={currentData.autoplay}
                muted={currentData.muted}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDelete}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="space-y-0.5">
                  <Label className="text-xs">Controls</Label>
                  <p className="text-[10px] text-muted-foreground">Show player UI</p>
                </div>
                <Switch
                  checked={currentData.controls}
                  onCheckedChange={(checked) => updateData({ controls: checked })}
                  disabled={disabled}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="space-y-0.5">
                  <Label className="text-xs">Loop</Label>
                  <p className="text-[10px] text-muted-foreground">Repeat video</p>
                </div>
                <Switch
                  checked={currentData.loop}
                  onCheckedChange={(checked) => updateData({ loop: checked })}
                  disabled={disabled}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="space-y-0.5">
                  <Label className="text-xs">Autoplay</Label>
                  <p className="text-[10px] text-muted-foreground">Start on load</p>
                </div>
                <Switch
                  checked={currentData.autoplay}
                  onCheckedChange={(checked) => updateData({ autoplay: checked })}
                  disabled={disabled}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="space-y-0.5">
                  <Label className="text-xs">Mute</Label>
                  <p className="text-[10px] text-muted-foreground">Silence audio</p>
                </div>
                <Switch
                  checked={currentData.muted}
                  onCheckedChange={(checked) => updateData({ muted: checked })}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentData.url}
                    onChange={(e) => updateData({ url: e.target.value })}
                    className="h-8 text-xs"
                    disabled={disabled}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                        const input = document.getElementById('video-upload') as HTMLInputElement;
                        if (input) input.click();
                    }}
                    disabled={disabled || uploading}
                    title="Replace file"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${uploading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
