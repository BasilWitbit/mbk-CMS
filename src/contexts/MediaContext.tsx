import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MediaItem {
  name: string;
  url: string;
}

interface MediaContextType {
  media: MediaItem[];
  addMedia: (item: MediaItem) => void;
  deleteMedia: (url: string) => void;
  loading: boolean;
}

const MediaContext = createContext<MediaContextType>({
  media: [],
  addMedia: () => {},
  deleteMedia: () => {},
  loading: true,
});

export function MediaProvider({ children }: { children: ReactNode }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
      if (error) { setLoading(false); return; }
      setMedia(data as MediaItem[]);
      setLoading(false);
    };
    fetchMedia();
  }, []);

  const addMedia = (item: MediaItem) => {
    setMedia((prev) => [item, ...prev]);
  };

  const deleteMedia = async (url: string) => {
    const fileName = url.split("/").pop();
    if (fileName) {
      // Delete from storage bucket
      await supabase.storage.from("media").remove([fileName]);
      // Delete from database
      await supabase.from("media").delete().eq("url", url);
    }
    setMedia((prev) => prev.filter((m) => m.url !== url));
  };

  return (
    <MediaContext.Provider value={{ media, addMedia, deleteMedia, loading }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  return useContext(MediaContext);
}
