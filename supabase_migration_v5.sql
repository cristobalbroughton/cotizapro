-- =========================================
-- CotizaPro — Migración v5
-- Fecha de vencimiento del plan Pro
-- Ejecutar en Supabase SQL Editor
-- =========================================

-- 1. Agregar campo pro_expires_at a profiles
--    NULL = sin expiración (plan free, o Pro sin fecha límite asignada)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Verificar resultado
SELECT id, full_name, plan, pro_expires_at
FROM public.profiles
ORDER BY created_at DESC;
