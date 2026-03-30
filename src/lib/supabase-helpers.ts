import { supabase } from "@/integrations/supabase/client";

export const uploadMedia = async (file: File): Promise<string | null> => {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(fileName, file);
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  const { data } = supabase.storage.from('media').getPublicUrl(fileName);
  
  const { error: dbError } = await supabase.from('media').insert({ 
    name: file.name, 
    url: data.publicUrl 
  });
  
  if (dbError) {
    console.error('Database insert error:', dbError);
  }
  
  return data.publicUrl;
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
