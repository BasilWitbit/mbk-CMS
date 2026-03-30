import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMedia } from "@/contexts/MediaContext";
import { Check } from "lucide-react";

interface MediaPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaPickerDialog({ open, onClose, onSelect }: MediaPickerDialogProps) {
  const { media } = useMedia();
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      setSelected(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose from Media Library</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {media.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No media files yet. Upload some in the Media Library first.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
              {media.map((file) => (
                <button
                  key={file.url}
                  onClick={() => setSelected(file.url)}
                  className={`relative rounded-lg border-2 overflow-hidden transition-all ${
                    selected === file.url ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <img src={file.url} alt={file.name} className="w-full h-20 object-cover" />
                  {selected === file.url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground truncate px-1 py-0.5">{file.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!selected} onClick={handleConfirm}>Use Selected</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
