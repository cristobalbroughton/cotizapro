# CotizaPro — CLAUDE.md

## Qué es esto
SaaS de cotizaciones para pymes chilenas. Usuarios crean,
previsualizan y descargan cotizaciones en PDF con formato
profesional. Plan freemium (5 cotizaciones) + Pro (ilimitado).

Producción: https://cotizapro-8cwv.vercel.app

## Stack
- Vite 8 + React 18 + Tailwind CSS 3
- Supabase (auth, PostgreSQL, Storage para logos)
- @react-pdf/renderer (PDF en browser worker)
- React Router v6, Lucide React
- Deploy: Vercel + GitHub (main → auto-deploy)

## Estructura de carpetas
```
src/
  pages/       Dashboard, QuoteList, NewQuote, EditQuote,
               ViewQuote, Settings, Login, Register,
               ForgotPassword, ResetPassword, NotFound, Privacy
  components/  Layout, Header, Sidebar, QuoteForm, QuotePDF,
               UpgradeModal, ProtectedRoute
  hooks/       useAuth.jsx, useQuotes.js
  context/     SidebarContext.jsx
  utils/       formatters.js, calculations.js
  lib/         supabase.js
```

## Reglas críticas de negocio

### Formato CLP (NUNCA usar Intl.NumberFormat para moneda)
Usar SIEMPRE la función regex en formatters.js:
```js
formatCLP(amount) → "$84.033"
```
En el PDF worker usar `fCLP()` (misma lógica inline).
`Intl` puede fallar en el worker de @react-pdf/renderer.

### Lógica de precios
El usuario ingresa el **precio final (con IVA incluido)**.
La app calcula hacia atrás:
```
Monto Neto = precio / 1.19  (redondeado sin decimales)
IVA        = precio - neto
Total      = precio ingresado (sin cambio)
```
El campo `unit_price` en BD guarda el precio final ingresado.

### IVA toggle (show_iva)
- Se guarda en `profiles.show_iva` (preferencia por defecto del usuario)
- Se guarda en `quotes.show_iva` (configurable por cotización individual)
- Si `show_iva = true`: mostrar Monto Neto + IVA (19%) + Total
- Si `show_iva = false`: mostrar solo Total
- El cálculo interno **siempre** considera IVA

### Freemium (límite 5 cotizaciones)
- Contador: `profiles.quotes_created_count` — **SOLO SUBE, nunca baja**
- Trigger en Supabase lo incrementa en cada INSERT en `quotes`
- Al eliminar una cotización: el contador **NO** baja
- `canCreate = !isFree || quotesCreatedCount < FREE_LIMIT`
- Después de `createQuote`: llamar `incrementQuotesCount()` local (optimista)

### RUT chileno
Formato: `XX.XXX.XXX-X` con validación módulo 11.
Ver `formatRUT()` y `validateRUT()` en `src/utils/formatters.js`.

## Base de datos — migraciones aplicadas
| Archivo | Qué agrega |
|---------|-----------|
| `supabase_schema.sql` | Esquema inicial + RLS + triggers |
| `supabase_migration_v2.sql` | `giro`, `contact_email`, bucket `logos` |
| `supabase_migration_v3.sql` | `quotes_created_count` en profiles + trigger |
| `supabase_migration_v4.sql` | `show_iva` en profiles y quotes |
| `supabase_migration_v5.sql` | `pro_expires_at` en profiles |

Al agregar columnas: usar siempre `ADD COLUMN IF NOT EXISTS`.
Los triggers usan `CREATE OR REPLACE TRIGGER` (no `CREATE TRIGGER`).

## Plan Pro y expiración
- `profiles.plan`: `'free'` | `'pro'`
- `profiles.pro_expires_at`: timestamp | null
- Al cargar el perfil: si `plan='pro'` y `pro_expires_at < ahora`
  → actualizar automáticamente a `'free'` en Supabase
- `proExpiresSoon` = vence en menos de 7 días → badge amarillo en dashboard

## PDF con @react-pdf/renderer
- Componente: `src/components/QuotePDF.jsx`
- **NO usar Intl** dentro del PDF (el worker no lo soporta de forma consistente)
- Usar helpers inline: `fCLP()`, `fDate()`, `fQuoteNum()`, `fExpiry()`
- Logo: se pasa como prop (URL con cache-bust `?t=timestamp`)
- Totales respetan el campo `show_iva` del quote individual

## Sidebar
- Colapsable en desktop/tablet (preferencia persiste en `localStorage`)
- Drawer deslizable en móvil (se superpone al contenido, backdrop oscuro)
- Botón toggle: arriba del todo en desktop, justo debajo del header
- Tooltips: aparecen a la **derecha** del ícono cuando está colapsado
- Contexto global: `src/context/SidebarContext.jsx`

## Supabase: gotchas conocidos
- **NUMERIC → string**: Supabase devuelve columnas NUMERIC como `"14673.00"`.
  Siempre usar `parseFloat()` o `Number()` al operar con totales.
- **RLS activo**: siempre filtrar por `user_id` en queries manuales.
- **Storage bucket `logos`**: límite 2 MB, path `{userId}/logo.{ext}`.

## Convenciones de código
- Componentes de página: `default export`, PascalCase
- Sub-componentes pequeños: dentro del mismo archivo de la página
- Hooks: `useAuth` (contexto de sesión/perfil) y `useQuotes` (CRUD cotizaciones)
- Clases Tailwind custom: `btn-primary`, `btn-secondary`, `input-field`,
  `label`, `card`, `badge-*` — definidas en `src/index.css`
- Color primario: `#1e3a5f` (primary-800) como azul oscuro principal

## Pendiente / roadmap
- [ ] Integrar Flow.cl para pagos (botón "Actualizar a Pro" en UpgradeModal)
- [ ] Enviar cotización por email al cliente directamente desde la app
- [ ] Duplicar cotización existente
- [ ] Número de WhatsApp real en Layout.jsx (`wa.me/56912345678` es placeholder)
- [ ] Logo oficial para reemplazar el favicon emoji 📄

## Deploy
```bash
git push origin main   # Vercel redeploy automático (~1-2 min)
```
Variables de entorno en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
