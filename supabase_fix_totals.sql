-- =========================================
-- CotizaPro — Fix: recalcular totales en 0
-- Ejecutar en Supabase SQL Editor
-- =========================================
-- Recalcula subtotal, iva_amount y total a partir
-- de los ítems guardados en JSONB para todas las
-- cotizaciones que quedaron con total = 0.

WITH calculo AS (
  SELECT
    id,
    COALESCE(
      (SELECT SUM(
          (item->>'quantity')::numeric * (item->>'unit_price')::numeric
        )
        FROM jsonb_array_elements(items) AS item
      ), 0
    ) AS neto
  FROM public.quotes
  WHERE total = 0 OR total IS NULL
)
UPDATE public.quotes q
SET
  subtotal   = c.neto,
  iva_amount = ROUND(c.neto * 0.19),
  total      = c.neto + ROUND(c.neto * 0.19)
FROM calculo c
WHERE q.id = c.id;

-- Verificar resultado
SELECT id, quote_number, client_name, subtotal, iva_amount, total
FROM public.quotes
ORDER BY created_at DESC;
