CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media viewable by authenticated users" ON public.media FOR SELECT TO authenticated USING (true);
CREATE POLICY "Media insertable by authenticated users" ON public.media FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Media deletable by authenticated users" ON public.media FOR DELETE TO authenticated USING (true);
