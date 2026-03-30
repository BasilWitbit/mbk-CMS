
-- Social links table
CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  custom_icon_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage social_links" ON public.social_links
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Social links readable by authenticated" ON public.social_links
  FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON public.social_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Contact info table
CREATE TABLE public.contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('address', 'email', 'phone')),
  label text NOT NULL DEFAULT '',
  value text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contact_info" ON public.contact_info
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Contact info readable by authenticated" ON public.contact_info
  FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON public.contact_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
