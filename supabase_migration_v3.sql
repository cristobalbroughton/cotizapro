-- =========================================
-- CotizaPro — Migración v3
-- Contador histórico de cotizaciones creadas
-- Ejecutar en Supabase SQL Editor
-- =========================================

-- 1. Agregar columna a profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS quotes_created_count INTEGER NOT NULL DEFAULT 0;

-- 2. Inicializar con el conteo histórico real.
--    quote_sequences.last_number ya trackea cuántas cotizaciones
--    creó cada usuario (solo sube, nunca baja).
UPDATE public.profiles p
SET quotes_created_count = COALESCE(
  (SELECT qs.last_number
   FROM public.quote_sequences qs
   WHERE qs.user_id = p.id),
  0
);

-- 3. Función que incrementa el contador al insertar una cotización
CREATE OR REPLACE FUNCTION public.increment_quotes_created_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET quotes_created_count = quotes_created_count + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger: se dispara DESPUÉS de cada INSERT en quotes
CREATE OR REPLACE TRIGGER on_quote_inserted
  AFTER INSERT ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.increment_quotes_created_count();

-- 5. Verificar resultado
SELECT p.id, p.full_name, p.quotes_created_count,
       COUNT(q.id) AS quotes_actuales
FROM public.profiles p
LEFT JOIN public.quotes q ON q.user_id = p.id
GROUP BY p.id, p.full_name, p.quotes_created_count;
