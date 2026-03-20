import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'

// ── Paleta ──────────────────────────────────────────────
const C = {
  primary:   '#1e3a5f',
  primaryLt: '#2d5a96',
  white:     '#ffffff',
  gray900:   '#111827',
  gray700:   '#374151',
  gray500:   '#6b7280',
  gray400:   '#9ca3af',
  gray200:   '#e5e7eb',
  bgLight:   '#f8fafc',
  bgBlue:    '#eef2f7',
}

// ── Helpers (sin Intl para compatibilidad con el worker del PDF) ──
function fCLP(n) {
  const v = Math.round(Number(n) || 0)
  return '$' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function fDate(str) {
  if (!str) return ''
  const d = new Date(str)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

function fQuoteNum(n) {
  return `COT-${String(n).padStart(4, '0')}`
}

function fExpiry(validityDays, fromDate) {
  const d = fromDate ? new Date(fromDate) : new Date()
  d.setDate(d.getDate() + (parseInt(validityDays) || 30))
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

function itemSubtotal(qty, price) {
  return (parseFloat(qty) || 0) * (parseFloat(price) || 0)
}

// ── Estilos ──────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.gray700,
    backgroundColor: C.white,
    paddingTop: 42,
    paddingBottom: 56,
    paddingHorizontal: 44,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 20,
  },
  companyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: C.primary,
    marginBottom: 5,
  },
  companyMeta: {
    fontSize: 9,
    color: C.gray700,
    marginBottom: 2,
  },
  companyMetaLabel: {
    color: C.gray500,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: C.bgBlue,
    borderRadius: 4,
  },

  // Divider
  divider: {
    borderBottomWidth: 3,
    borderBottomColor: C.primary,
    marginTop: 14,
    marginBottom: 18,
  },

  // Quote info
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  quoteTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: C.primary,
    letterSpacing: 0.5,
  },
  quoteNum: {
    fontSize: 11,
    color: C.gray500,
    marginTop: 4,
  },
  dateBlock: {
    alignItems: 'flex-end',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 8,
    color: C.gray400,
    marginRight: 8,
    textAlign: 'right',
  },
  dateValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: C.gray700,
    minWidth: 70,
    textAlign: 'right',
  },

  // Client section
  clientSection: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  clientBox: {
    flex: 1,
    backgroundColor: C.bgLight,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: C.gray400,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  clientName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: C.gray900,
    marginBottom: 4,
  },
  clientDetail: {
    fontSize: 9,
    color: C.gray500,
    marginBottom: 2,
  },

  // Table
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.primary,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  thText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: C.white,
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: C.gray200,
  },
  tableRowAlt: {
    backgroundColor: C.bgLight,
  },
  td: {
    fontSize: 9,
    color: C.gray700,
  },
  colDesc:     { flex: 1 },
  colQty:      { width: 40, textAlign: 'center' },
  colPrice:    { width: 82, textAlign: 'right' },
  colSubtotal: { width: 90, textAlign: 'right' },

  // Totals
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
    marginBottom: 22,
  },
  totalsBox: {
    width: 240,
  },
  totalLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: C.gray200,
  },
  totalLineLabel: {
    fontSize: 9,
    color: C.gray500,
  },
  totalLineValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: C.gray700,
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: C.primary,
    marginTop: 4,
  },
  grandLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: C.white,
    letterSpacing: 0.5,
  },
  grandValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: C.white,
  },

  // Notes
  notesBox: {
    backgroundColor: C.bgLight,
    padding: 12,
    marginBottom: 20,
    borderRadius: 2,
  },
  notesText: {
    fontSize: 9,
    color: C.gray700,
    lineHeight: 1.6,
  },

  // Footer (absolute)
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 44,
    right: 44,
    borderTopWidth: 0.5,
    borderTopColor: C.gray200,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: C.gray400,
  },
})

// ── Componente principal ────────────────────────────────
export default function QuotePDF({ quote, profile }) {
  const items    = quote.items || []
  const subtotal = items.reduce((acc, it) => acc + itemSubtotal(it.quantity, it.unit_price), 0)
  const iva      = Math.round(subtotal * 0.19)
  const total    = subtotal + iva
  const showIva  = quote.show_iva ?? true

  const emisionDate = fDate(quote.created_at)
  const expiryDate  = fExpiry(quote.validity_days, quote.created_at)

  return (
    <Document
      title={`Cotizacion_${fQuoteNum(quote.quote_number)}`}
      author={profile?.company || profile?.full_name || 'CotizaPro'}
      creator="CotizaPro"
    >
      <Page size="LETTER" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.companyName}>
              {profile?.company || profile?.full_name || 'Mi Empresa'}
            </Text>
            {profile?.rut_empresa && (
              <Text style={s.companyMeta}>RUT: {profile.rut_empresa}</Text>
            )}
            {profile?.giro && (
              <Text style={s.companyMeta}>Giro: {profile.giro}</Text>
            )}
            {profile?.address && (
              <Text style={s.companyMeta}>{profile.address}</Text>
            )}
            {profile?.phone && (
              <Text style={s.companyMeta}>Tel: {profile.phone}</Text>
            )}
            {profile?.contact_email && (
              <Text style={s.companyMeta}>{profile.contact_email}</Text>
            )}
          </View>

          {/* Logo si existe */}
          {profile?.logo_url ? (
            <Image style={s.logo} src={profile.logo_url} />
          ) : (
            <View style={s.logoPlaceholder} />
          )}
        </View>

        {/* ── DIVISOR ── */}
        <View style={s.divider} />

        {/* ── N° COTIZACIÓN + FECHAS ── */}
        <View style={s.quoteHeader}>
          <View>
            <Text style={s.quoteTitle}>COTIZACIÓN</Text>
            <Text style={s.quoteNum}>{fQuoteNum(quote.quote_number)}</Text>
          </View>
          <View style={s.dateBlock}>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>Fecha de emisión</Text>
              <Text style={s.dateValue}>{emisionDate}</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>Válida hasta</Text>
              <Text style={s.dateValue}>{expiryDate}</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>Validez</Text>
              <Text style={s.dateValue}>{quote.validity_days || 30} días</Text>
            </View>
          </View>
        </View>

        {/* ── DATOS DEL CLIENTE ── */}
        <View style={s.clientSection}>
          <View style={s.clientBox}>
            <Text style={s.sectionLabel}>CLIENTE</Text>
            <Text style={s.clientName}>{quote.client_name}</Text>
            {quote.client_rut   && <Text style={s.clientDetail}>RUT: {quote.client_rut}</Text>}
            {quote.client_email && <Text style={s.clientDetail}>{quote.client_email}</Text>}
            {quote.client_phone && <Text style={s.clientDetail}>Tel: {quote.client_phone}</Text>}
            {quote.client_address && <Text style={s.clientDetail}>{quote.client_address}</Text>}
          </View>
        </View>

        {/* ── TABLA DE ÍTEMS ── */}
        <View style={s.tableHead}>
          <Text style={[s.thText, s.colDesc]}>DESCRIPCIÓN</Text>
          <Text style={[s.thText, s.colQty]}>CANT.</Text>
          <Text style={[s.thText, s.colPrice]}>PRECIO UNIT.</Text>
          <Text style={[s.thText, s.colSubtotal]}>SUBTOTAL</Text>
        </View>

        {items.map((item, i) => (
          <View
            key={i}
            style={[s.tableRow, i % 2 !== 0 && s.tableRowAlt]}
            wrap={false}
          >
            <Text style={[s.td, s.colDesc]}>{item.description}</Text>
            <Text style={[s.td, s.colQty]}>{item.quantity}</Text>
            <Text style={[s.td, s.colPrice]}>{fCLP(item.unit_price)}</Text>
            <Text style={[s.td, s.colSubtotal]}>
              {fCLP(itemSubtotal(item.quantity, item.unit_price))}
            </Text>
          </View>
        ))}

        {/* ── TOTALES ── */}
        <View style={s.totalsSection}>
          <View style={s.totalsBox}>
            {showIva && (
              <>
                <View style={s.totalLineRow}>
                  <Text style={s.totalLineLabel}>Subtotal neto</Text>
                  <Text style={s.totalLineValue}>{fCLP(subtotal)}</Text>
                </View>
                <View style={s.totalLineRow}>
                  <Text style={s.totalLineLabel}>IVA (19%)</Text>
                  <Text style={s.totalLineValue}>{fCLP(iva)}</Text>
                </View>
              </>
            )}
            <View style={s.grandRow}>
              <Text style={s.grandLabel}>TOTAL</Text>
              <Text style={s.grandValue}>{fCLP(total)}</Text>
            </View>
          </View>
        </View>

        {/* ── NOTAS Y CONDICIONES ── */}
        {quote.notes ? (
          <View style={s.notesBox}>
            <Text style={s.sectionLabel}>NOTAS Y CONDICIONES COMERCIALES</Text>
            <Text style={s.notesText}>{quote.notes}</Text>
          </View>
        ) : null}

        {/* ── FOOTER ABSOLUTO ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Cotización válida por {quote.validity_days || 30} días desde la fecha de emisión ({emisionDate})
          </Text>
          <Text style={s.footerText}>
            Generado con CotizaPro · {fQuoteNum(quote.quote_number)}
          </Text>
        </View>

      </Page>
    </Document>
  )
}
