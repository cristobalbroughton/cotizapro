-- =========================================
-- CotizaPro — Migración v2
-- Ejecutar en Supabase SQL Editor
-- =========================================

-- 1. Nuevas columnas en profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS giro          TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- 2. Nueva columna en quotes (teléfono cliente)
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS client_phone TEXT;

-- 3. Bucket de Storage para logos (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Políticas de Storage para logos
DO $$
BEGIN

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'logos_public_read' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "logos_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'logos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'logos_user_insert' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "logos_user_insert" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'logos' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'logos_user_update' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "logos_user_update" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'logos' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'logos_user_delete' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "logos_user_delete" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'logos' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

END $$;
