import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CMSSettings() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>
      <Card>
        <CardHeader><CardTitle className="text-lg">Theme Colors</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Theme colors are managed via CSS variables in the design system. The current theme uses:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Primary", color: "bg-primary", hex: "#D0FF71" },
              { label: "Text", color: "bg-foreground", hex: "#000000" },
              { label: "Background", color: "bg-background", hex: "#FAFAFA" },
              { label: "Secondary BG", color: "bg-secondary", hex: "#E8F5D6" },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded border border-border ${c.color}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
