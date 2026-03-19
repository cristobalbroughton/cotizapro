-- =========================================
-- CotizaPro - Schema de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- =========================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  company     TEXT,
  rut_empresa TEXT,
  address     TEXT,
  phone       TEXT,
  logo_url    TEXT,
  plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS public.quotes (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quote_number        INTEGER NOT NULL,

  -- Datos del cliente
  client_name         TEXT NOT NULL,
  client_rut          TEXT,
  client_email        TEXT,
  client_address      TEXT,

  -- Contenido
  items               JSONB NOT NULL DEFAULT '[]',
  notes               TEXT,
  validity_days       INTEGER DEFAULT 30,

  -- Totales (almacenados para búsqueda/reporte)
  subtotal            NUMERIC(12,2) DEFAULT 0,
  iva_amount          NUMERIC(12,2) DEFAULT 0,
  total               NUMERIC(12,2) DEFAULT 0,

  -- Estado
  status              TEXT NOT NULL DEFAULT 'borrador'
                        CHECK (status IN ('borrador', 'enviada', 'aceptada', 'rechazada')),

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  -- Número correlativo único por usuario
  UNIQUE(user_id, quote_number)
);

-- Secuencia de números de cotización por usuario
CREATE TABLE IF NOT EXISTS public.quote_sequences (
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);

-- =========================================
-- FUNCIONES Y TRIGGERS
-- =========================================

-- Función: crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.quote_sequences (user_id, last_number)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: ejecutar al crear usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función: obtener y auto-incrementar número de cotización
CREATE OR REPLACE FUNCTION public.get_next_quote_number(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  INSERT INTO public.quote_sequences (user_id, last_number)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET last_number = quote_sequences.last_number + 1
  RETURNING last_number INTO next_num;

  RETURN next_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_sequences ENABLE ROW LEVEL SECURITY;

-- Políticas: profiles
CREATE POLICY "users_own_profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Políticas: quotes
CREATE POLICY "users_own_quotes" ON public.quotes
  FOR ALL USING (auth.uid() = user_id);

-- Políticas: quote_sequences
CREATE POLICY "users_own_sequence" ON public.quote_sequences
  FOR ALL USING (auth.uid() = user_id);

-- =========================================
-- ÍNDICES
-- =========================================

CREATE INDEX IF NOT EXISTS idx_quotes_user_id    ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status     ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);
