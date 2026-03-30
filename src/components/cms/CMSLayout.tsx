import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { CMSSidebar } from "./CMSSidebar";
import { CMSTopbar } from "./CMSTopbar";
import { CMSBreadcrumbs } from "./CMSBreadcrumbs";
import { LogoProvider } from "@/contexts/LogoContext";
import { MediaProvider } from "@/contexts/MediaContext";
import { useAuth } from "@/contexts/AuthContext";

export function CMSLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <LogoProvider>
      <MediaProvider>
        <div className="flex h-screen overflow-hidden">
          <CMSSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <CMSTopbar user={{ email: user.email || "" }} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <main className="flex-1 overflow-auto p-6 cms-scrollbar">
              <CMSBreadcrumbs />
              <Outlet />
            </main>
          </div>
        </div>
      </MediaProvider>
    </LogoProvider>
  );
}
