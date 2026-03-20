-- =========================================
-- CotizaPro — Migración v4
-- Toggle show_iva en perfil y cotizaciones
-- Ejecutar en Supabase SQL Editor
-- =========================================

-- 1. Preferencia por defecto en el perfil del negocio
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_iva BOOLEAN NOT NULL DEFAULT true;

-- 2. Preferencia individual por cotización
--    (heredada del perfil al crear, modificable por cotización)
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS show_iva BOOLEAN NOT NULL DEFAULT true;

-- Verificar resultado
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'quotes')
  AND column_name = 'show_iva'
ORDER BY table_name;
