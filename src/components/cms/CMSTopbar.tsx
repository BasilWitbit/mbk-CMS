import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLogo } from "@/contexts/LogoContext";
import { useAuth } from "@/contexts/AuthContext";

interface CMSTopbarProps {
  user: any;
  onToggleSidebar: () => void;
}

export function CMSTopbar({ user, onToggleSidebar }: CMSTopbarProps) {
  const navigate = useNavigate();
  const { logoUrl } = useLogo();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </Button>
        {logoUrl ? <img src={logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" /> : <span className="text-sm font-semibold text-foreground">CMS Admin 2 Test</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
