import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, File, Handshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ posts: 0, pages: 0, partners: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const [postsRes, pagesRes, partnersRes] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("pages").select("id", { count: "exact", head: true }),
        supabase.from("partners").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        posts: postsRes.count || 0,
        pages: pagesRes.count || 0,
        partners: partnersRes.count || 0,
      });
    };
    fetchCounts();
  }, []);

  const stats = [
    { label: "Posts", value: counts.posts, icon: FileText, color: "text-primary", path: "/cms/posts" },
    { label: "Pages", value: counts.pages, icon: File, color: "text-cms-success", path: "/cms/pages" },
    { label: "Partners", value: counts.partners, icon: Handshake, color: "text-cms-warning", path: "/cms/partners" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(stat.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
