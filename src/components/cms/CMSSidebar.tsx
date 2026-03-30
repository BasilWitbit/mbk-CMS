import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Layers,
  File,
  Users,
  Handshake,
  Settings,
  ChevronDown,
  ChevronRight,
  Image,
  List,
  Globe,
  Share2,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface CMSSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  label: string;
  icon: any;
  path?: string;
  children?: { label: string; icon: any; path: string }[];
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/cms" },
  {
    label: "Posts",
    icon: FileText,
    children: [
      { label: "All Posts", icon: FolderOpen, path: "/cms/posts" },
      { label: "Categories", icon: Layers, path: "/cms/categories" },
    ],
  },
  {
    label: "Pages",
    icon: File,
    path: "/cms/pages",
    children: [
      { label: "Homepage", icon: File, path: "/cms/pages/homepage" },
      { label: "About Us", icon: File, path: "/cms/pages/about-us" },
      { label: "Our Partners", icon: File, path: "/cms/pages/our-partners" },
      { label: "Contact Us", icon: File, path: "/cms/pages/contact-us" },
      { label: "Privacy Policy", icon: File, path: "/cms/pages/privacy-policy" },
      { label: "Terms & Conditions", icon: File, path: "/cms/pages/terms-conditions" },
    ],
  },
  { label: "Partners", icon: Handshake, path: "/cms/partners" },
  { label: "Media", icon: Image, path: "/cms/media" },
  { label: "Users", icon: Users, path: "/cms/users" },
  { label: "Site Identity", icon: Globe, path: "/cms/site-identity" },
  { label: "Social Media", icon: Share2, path: "/cms/social-media" },
  { label: "Contact Info", icon: Phone, path: "/cms/contact-info" },
  { label: "Settings", icon: Settings, path: "/cms/settings" },
];

export function CMSSidebar({ collapsed }: CMSSidebarProps) {
  const { role } = useAuth();
  const isSuperAdmin = role === "admin";
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Posts", "Pages"]);

  const filteredMenuItems = menuItems.filter(item => {
    if (item.label === "Users" && !isSuperAdmin) return false;
    return true;
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isChildActive = (children?: { path: string }[]) =>
    children?.some((c) => location.pathname.startsWith(c.path));

  return (
    <aside
      className={cn(
        "h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 cms-scrollbar overflow-y-auto",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="sticky top-0 z-10 bg-sidebar p-4 border-b border-sidebar-border">
        {!collapsed && (
          <img 
            src="/images/cms-logo.png" 
            alt="Harmony CMS" 
            className="h-8 w-auto object-contain brightness-0 invert" 
          />
        )}
      </div>

      <nav className="flex-1 p-[10px] space-y-1">
        {filteredMenuItems.map((item) => {
          if (item.children) {
            const expanded = expandedMenus.includes(item.label);
            const childActive = isChildActive(item.children);
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center">
                  {item.path ? (
                    <NavLink
                      to={item.path}
                      onClick={() => !collapsed && toggleMenu(item.label)}
                      className={cn(
                        "flex-1 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-[5px]",
                        childActive || isActive(item.path)
                           ? "text-sidebar-primary-foreground bg-sidebar-primary font-medium"
                           : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </>
                      )}
                    </NavLink>
                  ) : (
                    <button
                      onClick={() => !collapsed && toggleMenu(item.label)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-[5px]",
                        childActive
                           ? "text-sidebar-primary-foreground bg-sidebar-primary font-medium"
                           : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </>
                      )}
                    </button>
                  )}
                </div>
                {!collapsed && expanded && (
                  <div className="ml-4 pl-2 border-l border-sidebar-border space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-[5px]",
                          isActive(child.path)
                            ? "text-sidebar-primary-foreground bg-sidebar-primary font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <child.icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path!}
              end={item.path === "/cms"}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-[5px]",
                isActive(item.path!)
                   ? "text-sidebar-primary-foreground bg-sidebar-primary font-medium"
                   : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
